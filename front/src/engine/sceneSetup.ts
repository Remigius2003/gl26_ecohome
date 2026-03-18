import * as THREE from "three";

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export function createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    return scene;
}

// ---------------------------------------------------------------------------
// Camera (top-down perspective)
// ---------------------------------------------------------------------------
export function createCamera(aspect: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    return camera;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------
export function createRenderer(canvas: HTMLDivElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    canvas.appendChild(renderer.domElement);
    return renderer;
}

// ---------------------------------------------------------------------------
// Lighting — soft ambient base; face lights provide directional illumination
// ---------------------------------------------------------------------------
export function addLighting(scene: THREE.Scene): void {
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
}

// ---------------------------------------------------------------------------
// Ground — black plane for outside, textured plane inside the boundary
// ---------------------------------------------------------------------------
export function createGround(): THREE.Mesh {
    const geo  = new THREE.PlaneGeometry(1000, 1000);
    const mat  = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
}

export function createInnerGround(bounds: number): THREE.Group {
    const group = new THREE.Group();
    const size  = bounds * 2;

    // Dark base plane
    const geo  = new THREE.PlaneGeometry(size, size);
    const mat  = new THREE.MeshStandardMaterial({ color: 0x0d0d1f, roughness: 0.95, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x    = -Math.PI / 2;
    mesh.position.y    = 0.005;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Major grid lines — every 2 units, blue accent
    const majorGrid = new THREE.GridHelper(size, size / 2, 0x2255cc, 0x1a2a55);
    majorGrid.position.y = 0.01;
    (majorGrid.material as THREE.LineBasicMaterial).transparent = true;
    (majorGrid.material as THREE.LineBasicMaterial).opacity     = 0.55;
    group.add(majorGrid);

    // Fine sub-grid — every 1 unit, very faint
    const fineGrid = new THREE.GridHelper(size, size, 0x111830, 0x111830);
    fineGrid.position.y = 0.008;
    (fineGrid.material as THREE.LineBasicMaterial).transparent = true;
    (fineGrid.material as THREE.LineBasicMaterial).opacity     = 0.35;
    group.add(fineGrid);

    return group;
}

// ---------------------------------------------------------------------------
// Face lights — one PointLight per gizmo face, initially off (intensity = 0)
// ---------------------------------------------------------------------------
const FACE_LIGHT_POSITIONS: Record<string, [number, number, number]> = {
    top:    [  0,  30,   0],
    bottom: [  0,  -5,   0],
    front:  [  0,  10,  20],
    back:   [  0,  10, -20],
    left:   [-20,  10,   0],
    right:  [ 20,  10,   0],
};

export function createFaceLights(): Map<string, THREE.PointLight> {
    const map = new Map<string, THREE.PointLight>();
    for (const [face, [x, y, z]] of Object.entries(FACE_LIGHT_POSITIONS)) {
        const light = new THREE.PointLight(0xfffbe8, 0, 150);
        light.position.set(x, y, z);
        map.set(face, light);
    }
    return map;
}

// ---------------------------------------------------------------------------
// Visible boundary — shows the camera/world limit to the player
// ---------------------------------------------------------------------------
export function createBoundary(bounds: number): THREE.Group {
    const group = new THREE.Group();
    const b = bounds;

    // Ground rectangle
    const pts = [
        new THREE.Vector3(-b, 0.02, -b),
        new THREE.Vector3( b, 0.02, -b),
        new THREE.Vector3( b, 0.02,  b),
        new THREE.Vector3(-b, 0.02,  b),
        new THREE.Vector3(-b, 0.02, -b),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4488ff });
    group.add(new THREE.Line(lineGeo, lineMat));

    // Low boundary walls (semi-transparent, visible when near the edge)
    const wallMat = new THREE.MeshBasicMaterial({
        color: 0x2255cc,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
    });
    const wallH = 3;
    const wallDefs: [number, number, number, number, number, number][] = [
        [    0,  wallH / 2,  -b,       0,   0,  b * 2],  // north
        [    0,  wallH / 2,   b,       0,   0,  b * 2],  // south
        [   -b,  wallH / 2,   0,  0, Math.PI / 2,  b * 2],  // west
        [    b,  wallH / 2,   0,  0, Math.PI / 2,  b * 2],  // east
    ];
    wallDefs.forEach(([cx, cy, cz, rx, ry, w]) => {
        const geo  = new THREE.PlaneGeometry(w, wallH);
        const mesh = new THREE.Mesh(geo, wallMat);
        mesh.position.set(cx, cy, cz);
        mesh.rotation.set(rx, ry, 0);
        group.add(mesh);
    });

    // Corner pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x2244aa, emissiveIntensity: 0.6 });
    const pillarGeo = new THREE.BoxGeometry(0.35, 4, 0.35);
    [[-b, -b], [b, -b], [b, b], [-b, b]].forEach(([px, pz]) => {
        const mesh = new THREE.Mesh(pillarGeo, pillarMat);
        mesh.position.set(px, 2, pz);
        group.add(mesh);
    });

    return group;
}
