import sys
import torch
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from tqdm.auto import tqdm
from point_e.diffusion.configs import DIFFUSION_CONFIGS, diffusion_from_config
from point_e.diffusion.sampler import PointCloudSampler
from point_e.models.download import load_checkpoint
from point_e.models.configs import MODEL_CONFIGS, model_from_config
from point_e.models.pretrained_clip import FrozenImageCLIP
from point_e.util.pc_to_mesh import marching_cubes_mesh
import trimesh

# ── config ────────────────────────────────────────────────────────────────────
IMAGE_PATH  = sys.argv[1] if len(sys.argv) > 1 else "input.png"
OUTPUT_PATH = sys.argv[2] if len(sys.argv) > 2 else "output_3d.glb"
GRID_SIZE   = 128
# ─────────────────────────────────────────────────────────────────────────────

try:
    import torch_directml
    device = torch_directml.device()
    print(f"Using AMD GPU via DirectML: {torch_directml.device_name(0)}")
except ImportError:
    device = torch.device("cpu")
    print("Using CPU")

# CLIP must run on CPU — DirectML doesn't support all its ops
cpu = torch.device("cpu")

img = Image.open(IMAGE_PATH).convert("RGB")

print("Loading CLIP (CPU)...")
clip_model = FrozenImageCLIP(cpu)

print("Extracting image embedding...")
with torch.no_grad():
    img_emb = clip_model.embed_images([img])   # (1, 768)

print("Loading diffusion models...")
base_name = "base40M-imagevec"
base_model = model_from_config(MODEL_CONFIGS[base_name], device)
base_model.eval()
base_diffusion = diffusion_from_config(DIFFUSION_CONFIGS[base_name])

upsampler_model = model_from_config(MODEL_CONFIGS["upsample"], device)
upsampler_model.eval()
upsampler_diffusion = diffusion_from_config(DIFFUSION_CONFIGS["upsample"])

print("Downloading checkpoints (cached after first run)...")
base_model.load_state_dict(load_checkpoint(base_name, cpu))
base_model.to(device)
upsampler_model.load_state_dict(load_checkpoint("upsample", cpu))
upsampler_model.to(device)

sampler = PointCloudSampler(
    device=device,
    models=[base_model, upsampler_model],
    diffusions=[base_diffusion, upsampler_diffusion],
    num_points=[1024, 4096 - 1024],
    aux_channels=["R", "G", "B"],
    guidance_scale=[3.0, 0.0],
    model_kwargs_key_filter=("embeddings", ""),
)

print(f"Generating point cloud from: {IMAGE_PATH}")
samples = None
for x in tqdm(sampler.sample_batch_progressive(
    batch_size=1,
    model_kwargs={"embeddings": [img_emb[0]]},
)):
    samples = x

pc = sampler.output_to_point_clouds(samples)[0]

print("Converting point cloud to mesh...")
sdf_model = model_from_config(MODEL_CONFIGS["sdf"], device)
sdf_model.eval()
sdf_model.load_state_dict(load_checkpoint("sdf", cpu))
sdf_model.to(device)

mesh = marching_cubes_mesh(
    pc=pc,
    model=sdf_model,
    batch_size=4096,
    grid_size=GRID_SIZE,
    progress=True,
)

print(f"Exporting to {OUTPUT_PATH}...")
pc_colors = np.stack([pc.channels["R"], pc.channels["G"], pc.channels["B"]], axis=1)
_, idx = cKDTree(pc.coords).query(mesh.verts, k=1)
vertex_colors = (pc_colors[idx] * 255).astype(np.uint8)

tri = trimesh.Trimesh(
    vertices=mesh.verts,
    faces=mesh.faces,
    vertex_colors=vertex_colors,
)
tri.export(OUTPUT_PATH)
print(f"Saved to {OUTPUT_PATH}")
