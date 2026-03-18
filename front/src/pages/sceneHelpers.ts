import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ApiObject {
    id: number;
    label: string;
    geometry: "box" | "sphere" | "cylinder" | "gltf";
    color: string;
    x: number;
    y: number;
    z: number;
    movable: boolean;
    face: string;
    model_url?: string;
    path?: string;
    rx?: number;
    ry?: number;
    rz?: number;
    subtitle?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const _gltfLoader = new GLTFLoader();

export const DEG = Math.PI / 180;

export function buildPrimitive(obj: ApiObject): THREE.Mesh {
    let geo: THREE.BufferGeometry;
    if (obj.geometry === "sphere") geo = new THREE.SphereGeometry(1.2, 32, 32);
    else if (obj.geometry === "cylinder")
        geo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    else geo = new THREE.BoxGeometry(2, 2, 2);
    return new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: obj.color }),
    );
}

export function applyTransform(model: THREE.Object3D, obj: ApiObject) {
    model.position.set(obj.x, obj.y, obj.z);
    model.rotation.set(
        (obj.rx ?? 0) * DEG,
        (obj.ry ?? 0) * DEG,
        (obj.rz ?? 0) * DEG,
    );
}

export function makeLabel(name: string, subtitle: string): THREE.Sprite {
    const W = 512,
        H = 88;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Rounded background
    ctx.fillStyle = "rgba(8, 8, 24, 0.88)";
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(W - 12, 0);
    ctx.quadraticCurveTo(W, 0, W, 12);
    ctx.lineTo(W, H - 12);
    ctx.quadraticCurveTo(W, H, W - 12, H);
    ctx.lineTo(12, H);
    ctx.quadraticCurveTo(0, H, 0, H - 12);
    ctx.lineTo(0, 12);
    ctx.quadraticCurveTo(0, 0, 12, 0);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = "rgba(120, 160, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let fs = 32;
    ctx.font = `bold ${fs}px sans-serif`;
    while (ctx.measureText(name).width > W * 0.88 && fs > 14) {
        fs -= 1;
        ctx.font = `bold ${fs}px sans-serif`;
    }
    const nameY = subtitle ? H * 0.36 : H * 0.54;
    ctx.fillText(name, W / 2, nameY);

    // Subtitle (year / tag)
    if (subtitle) {
        ctx.fillStyle = "rgba(160, 190, 255, 0.65)";
        ctx.font = "22px sans-serif";
        ctx.fillText(subtitle, W / 2, H * 0.72);
    }

    const mat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(5.8, 5.8 * (H / W), 1);
    sprite.raycast = () => {};
    return sprite;
}

export function buildObject(obj: ApiObject): Promise<THREE.Object3D> {
    if (obj.model_url) {
        return new Promise((resolve) => {
            _gltfLoader.load(
                obj.model_url!,
                (gltf) => {
                    const model = gltf.scene;
                    applyTransform(model, obj);
                    // Keep original GLTF materials — color tinting would override baked textures
                    resolve(model);
                },
                undefined,
                () => resolve(buildPrimitive({ ...obj, color: "#ff00ff" })), // magenta fallback
            );
        });
    }
    if (obj.movable) {
        const size = 1.4;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: obj.color }));
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: 0x000000 }),
        );
        const group = new THREE.Group();
        group.add(mesh, edges);
        applyTransform(group, obj);
        return Promise.resolve(group);
    }
    const mesh = buildPrimitive(obj);
    applyTransform(mesh, obj);
    return Promise.resolve(mesh);
}

/** Flat X marker visible from top-down camera */
export function makeCrossMarker(pos: THREE.Vector3): THREE.Group {
    const mat = new THREE.MeshBasicMaterial({
        color: 0xff2222,
        side: THREE.DoubleSide,
    });
    const geo = new THREE.BoxGeometry(3, 0.18, 0.4);
    const bar1 = new THREE.Mesh(geo, mat);
    bar1.rotation.y = Math.PI / 4;
    const bar2 = new THREE.Mesh(geo, mat);
    bar2.rotation.y = -Math.PI / 4;
    const group = new THREE.Group();
    group.add(bar1, bar2);
    group.position.set(pos.x, pos.y + 3.5, pos.z);
    return group;
}
