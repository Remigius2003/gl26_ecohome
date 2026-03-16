import { useEffect, useRef } from "react";
import * as THREE from "three";

export type GizmoFace = "top" | "bottom" | "right" | "left" | "front" | "back";

interface Props {
    onFaceClick?: (face: GizmoFace) => void;
    size?: number;
}

// face index in BoxGeometry: +x=0, -x=1, +y=2, -y=3, +z=4, -z=5
const FACE_META: { face: GizmoFace; label: string; bg: string; fg: string }[] = [
    { face: "right",  label: "R", bg: "#6495ed", fg: "#fff" },
    { face: "left",   label: "L", bg: "#3cb371", fg: "#fff" },
    { face: "top",    label: "T", bg: "#ffd700", fg: "#222" },
    { face: "bottom", label: "B", bg: "#2f4f4f", fg: "#ccc" },
    { face: "front",  label: "F", bg: "#ff6347", fg: "#fff" },
    { face: "back",   label: "K", bg: "#ba55d3", fg: "#fff" },
];

function makeFaceTexture(label: string, bg: string, fg: string): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 122, 122);
    ctx.fillStyle = fg;
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 64, 64);
    return new THREE.CanvasTexture(c);
}

export default function OrientationGizmo({ onFaceClick, size = 120 }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // --- Scene ---
        const scene = new THREE.Scene();

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 4);
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // --- Lighting ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(3, 5, 3);
        scene.add(dir);

        // --- Cube with per-face materials ---
        const materials = FACE_META.map(({ label, bg, fg }) =>
            new THREE.MeshStandardMaterial({ map: makeFaceTexture(label, bg, fg) })
        );
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), materials);
        scene.add(cube);

        // --- Animation ---
        let frameId = 0;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // --- Drag-to-rotate state ---
        const drag = { active: false, lastX: 0, lastY: 0, startX: 0, startY: 0, moved: false };

        // --- Highlight on hover ---
        let hoveredIndex = -1;
        const highlightFace = (idx: number) => {
            if (hoveredIndex === idx) return;
            if (hoveredIndex !== -1) {
                materials[hoveredIndex].emissive.set(0x000000);
                materials[hoveredIndex].emissiveIntensity = 0;
            }
            hoveredIndex = idx;
            if (idx !== -1) {
                materials[idx].emissive.set(0xffffff);
                materials[idx].emissiveIntensity = 0.25;
            }
        };

        const faceAt = (e: MouseEvent): number => {
            const rect = mount.getBoundingClientRect();
            const ndc = new THREE.Vector2(
                ((e.clientX - rect.left)  / size) * 2 - 1,
                -((e.clientY - rect.top) / size) * 2 + 1
            );
            const ray = new THREE.Raycaster();
            ray.setFromCamera(ndc, camera);
            const hits = ray.intersectObject(cube);
            if (hits.length === 0) return -1;
            return hits[0].face?.materialIndex ?? -1;
        };

        const onMouseDown = (e: MouseEvent) => {
            e.stopPropagation();
            drag.active = true;
            drag.lastX  = e.clientX;
            drag.lastY  = e.clientY;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.moved  = false;
        };

        // On window so dragging outside the gizmo div keeps rotating
        const onWindowMouseMove = (e: MouseEvent) => {
            if (drag.active) {
                const dx = (e.clientX - drag.lastX) * 0.01;
                const dy = (e.clientY - drag.lastY) * 0.01;
                // Rotate around world-space axes so direction is always consistent
                // regardless of the cube's current orientation
                const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
                const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
                cube.quaternion.premultiply(qY).premultiply(qX);
                drag.lastX = e.clientX;
                drag.lastY = e.clientY;
                const tdx = e.clientX - drag.startX;
                const tdy = e.clientY - drag.startY;
                if (Math.sqrt(tdx * tdx + tdy * tdy) > 4) drag.moved = true;
            }
        };

        // Hover highlight only when inside the div (no drag active)
        const onMouseMove = (e: MouseEvent) => {
            if (!drag.active) highlightFace(faceAt(e));
        };

        const onWindowMouseUp = (e: MouseEvent) => {
            if (!drag.active) return;
            if (!drag.moved) {
                const idx = faceAt(e);
                if (idx !== -1 && onFaceClick) onFaceClick(FACE_META[idx].face);
            }
            drag.active = false;
            highlightFace(-1);
        };

        const onMouseLeave = () => { if (!drag.active) highlightFace(-1); };

        mount.addEventListener("mousedown",  onMouseDown);
        mount.addEventListener("mousemove",  onMouseMove);
        mount.addEventListener("mouseleave", onMouseLeave);
        mount.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
        window.addEventListener("mousemove", onWindowMouseMove);
        window.addEventListener("mouseup",   onWindowMouseUp);

        return () => {
            cancelAnimationFrame(frameId);
            mount.removeEventListener("mousedown",  onMouseDown);
            mount.removeEventListener("mousemove",  onMouseMove);
            mount.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("mousemove", onWindowMouseMove);
            window.removeEventListener("mouseup",   onWindowMouseUp);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [onFaceClick, size]);

    return (
        <div
            ref={mountRef}
            style={{
                position: "absolute",
                top: 16,
                left: 16,
                width: size,
                height: size,
                cursor: "grab",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                background: "rgba(20,20,40,0.45)",
                backdropFilter: "blur(4px)",
                zIndex: 10,
            }}
        />
    );
}
