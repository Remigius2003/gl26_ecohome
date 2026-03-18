import torch
import numpy as np
from scipy.spatial import cKDTree
from tqdm.auto import tqdm
from point_e.diffusion.configs import DIFFUSION_CONFIGS, diffusion_from_config
from point_e.diffusion.sampler import PointCloudSampler
from point_e.models.download import load_checkpoint
from point_e.models.configs import MODEL_CONFIGS, model_from_config
from point_e.util.pc_to_mesh import marching_cubes_mesh
import skimage.measure
import trimesh

# Try DirectML (AMD GPU on Windows), fall back to CPU
try:
    import torch_directml
    device = torch_directml.device()
    print(f"Using AMD GPU via DirectML: {torch_directml.device_name(0)}")
except ImportError:
    device = torch.device("cpu")
    print("Using CPU")

prompt = "a bush"

print("Loading models...")
base_name = "base40M-textvec"
base_model = model_from_config(MODEL_CONFIGS[base_name], device)
base_model.eval()
base_diffusion = diffusion_from_config(DIFFUSION_CONFIGS[base_name])

upsampler_model = model_from_config(MODEL_CONFIGS["upsample"], device)
upsampler_model.eval()
upsampler_diffusion = diffusion_from_config(DIFFUSION_CONFIGS["upsample"])

print("Downloading checkpoints...")
# DirectML can't be used as map_location — load on CPU then move to device
base_model.load_state_dict(load_checkpoint(base_name, torch.device("cpu")))
base_model.to(device)
upsampler_model.load_state_dict(load_checkpoint("upsample", torch.device("cpu")))
upsampler_model.to(device)

sampler = PointCloudSampler(
    device=device,
    models=[base_model, upsampler_model],
    diffusions=[base_diffusion, upsampler_diffusion],
    num_points=[1024, 4096 - 1024],
    aux_channels=["R", "G", "B"],
    guidance_scale=[3.0, 0.0],
    model_kwargs_key_filter=("texts", ""),
)

print(f"Generating point cloud for: '{prompt}'")
samples = None
for x in tqdm(sampler.sample_batch_progressive(
    batch_size=1,
    model_kwargs={"texts": [prompt]},
)):
    samples = x

pc = sampler.output_to_point_clouds(samples)[0]

print("Converting point cloud to mesh...")
# SDF model for mesh reconstruction
sdf_name = "sdf"
sdf_model = model_from_config(MODEL_CONFIGS[sdf_name], device)
sdf_model.eval()
sdf_model.load_state_dict(load_checkpoint(sdf_name, torch.device("cpu")))
sdf_model.to(device)

mesh = marching_cubes_mesh(
    pc=pc,
    model=sdf_model,
    batch_size=4096,
    grid_size=128,
    progress=True,
)

print("Exporting to tree_3d.glb...")
# Transfer point cloud colors to mesh vertices via nearest-neighbor lookup
pc_coords = pc.coords                          # (N, 3)
pc_colors = np.stack([pc.channels["R"], pc.channels["G"], pc.channels["B"]], axis=1)  # (N, 3) in [0,1]
tree = cKDTree(pc_coords)
_, idx = tree.query(mesh.verts, k=1)
vertex_colors = (pc_colors[idx] * 255).astype(np.uint8)

tri = trimesh.Trimesh(
    vertices=mesh.verts,
    faces=mesh.faces,
    vertex_colors=vertex_colors,
)
tri.export("tree_3d.glb")
print("Saved to tree_3d.glb")
