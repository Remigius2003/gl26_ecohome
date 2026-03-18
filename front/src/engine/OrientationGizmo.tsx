import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { GizmoFace } from "./types";

export type { GizmoFace };

interface Props {
    onFaceClick?:       (face: GizmoFace) => void;
    onLitFacesChange?:  (lit: Set<GizmoFace>) => void;
    labels?:            Partial<Record<GizmoFace, string>>;
    size?:              number;
}

// BoxGeometry face order: +x=0, -x=1, +y=2, -y=3, +z=4, -z=5
const FACE_META: { face: GizmoFace; normal: THREE.Vector3; bg: string; fg: string }[] = [
    { face: "right",  normal: new THREE.Vector3( 1,  0,  0), bg: "#6495ed", fg: "#fff" },
    { face: "left",   normal: new THREE.Vector3(-1,  0,  0), bg: "#3cb371", fg: "#fff" },
    { face: "top",    normal: new THREE.Vector3( 0,  1,  0), bg: "#ffd700", fg: "#222" },
    { face: "bottom", normal: new THREE.Vector3( 0, -1,  0), bg: "#2f4f4f", fg: "#ccc" },
    { face: "front",  normal: new THREE.Vector3( 0,  0,  1), bg: "#ff6347", fg: "#fff" },
    { face: "back",   normal: new THREE.Vector3( 0,  0, -1), bg: "#ba55d3", fg: "#fff" },
];

// Direction the gizmo light comes from (matches gizmo's DirectionalLight position)
const LIGHT_DIR = new THREE.Vector3(3, 5, 3).normalize();

const TEX_SIZE = 256;

function makeFaceTexture(text: string, bg: string, fg: string): THREE.CanvasTexture {
    const S = TEX_SIZE;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 8;
    ctx.strokeRect(5, 5, S - 10, S - 10);

    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const words = text.split(" ");
    const lines: string[] =
        words.length <= 1 ? [text] :
        words.length === 2 ? words :
        [words.slice(0, Math.ceil(words.length / 2)).join(" "),
         words.slice(Math.ceil(words.length / 2)).join(" ")];

    const lineH = lines.length > 1 ? S * 0.28 : 0;
    lines.forEach((line, i) => {
        let fs = Math.floor(S * 0.22);
        ctx.font = `bold ${fs}px sans-serif`;
        while (ctx.measureText(line).width > S * 0.84 && fs > 10) {
            fs -= 1;
            ctx.font = `bold ${fs}px sans-serif`;
        }
        const y = S / 2 + (i - (lines.length - 1) / 2) * lineH;
        ctx.fillText(line, S / 2, y);
    });

    return new THREE.CanvasTexture(c);
}

export default function OrientationGizmo({ onFaceClick, onLitFacesChange, labels, size = 120 }: Props) {
    const mountRef          = useRef<HTMLDivElement>(null);
    const materialsRef      = useRef<THREE.MeshStandardMaterial[]>([]);
    const litCallbackRef    = useRef(onLitFacesChange);
    litCallbackRef.current  = onLitFacesChange; // always current without triggering re-render

    // Main effect: build scene once (only recreates on size / onFaceClick change)
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 4);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // Reduced ambient for dramatic lit/unlit contrast
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        const dir = new THREE.DirectionalLight(0xffffff, 1.2);
        dir.position.set(3, 5, 3);
        scene.add(dir);

        const materials = FACE_META.map(({ face, bg, fg }) =>
            new THREE.MeshStandardMaterial({
                map: makeFaceTexture(labels?.[face] ?? face, bg, fg),
            })
        );
        materialsRef.current = materials;

        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), materials);
        scene.add(cube);

        let frameId = 0;
        let prevLitKey = "";

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);

            // Compute which faces are lit by checking normals against light direction
            const litFaces = new Set<GizmoFace>();
            FACE_META.forEach(({ face, normal }) => {
                const worldNormal = normal.clone().applyQuaternion(cube.quaternion);
                if (worldNormal.dot(LIGHT_DIR) > 0) litFaces.add(face);
            });

            // Only emit when the set changes
            const litKey = Array.from(litFaces).sort().join(",");
            if (litKey !== prevLitKey) {
                prevLitKey = litKey;
                litCallbackRef.current?.(litFaces);
            }
        };
        animate();

        const drag = { active: false, lastX: 0, lastY: 0, startX: 0, startY: 0, moved: false };

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
            const ndc  = new THREE.Vector2(
                ((e.clientX - rect.left) / size) *  2 - 1,
                ((e.clientY - rect.top)  / size) * -2 + 1,
            );
            const ray = new THREE.Raycaster();
            ray.setFromCamera(ndc, camera);
            const hits = ray.intersectObject(cube);
            return hits.length ? (hits[0].face?.materialIndex ?? -1) : -1;
        };

        const onMouseDown = (e: MouseEvent) => {
            e.stopPropagation();
            drag.active = true;
            drag.lastX  = drag.startX = e.clientX;
            drag.lastY  = drag.startY = e.clientY;
            drag.moved  = false;
        };

        const onWindowMouseMove = (e: MouseEvent) => {
            if (!drag.active) return;
            const dx = (e.clientX - drag.lastX) * 0.01;
            const dy = (e.clientY - drag.lastY) * 0.01;
            const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
            const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
            cube.quaternion.premultiply(qY).premultiply(qX);
            drag.lastX = e.clientX;
            drag.lastY = e.clientY;
            const tdx = e.clientX - drag.startX;
            const tdy = e.clientY - drag.startY;
            if (tdx * tdx + tdy * tdy > 16) drag.moved = true;
        };

        const onMouseMove  = (e: MouseEvent) => { if (!drag.active) highlightFace(faceAt(e)); };
        const onMouseLeave = () => { if (!drag.active) highlightFace(-1); };

        const onWindowMouseUp = (e: MouseEvent) => {
            if (!drag.active) return;
            if (!drag.moved) {
                const idx = faceAt(e);
                if (idx !== -1 && onFaceClick) onFaceClick(FACE_META[idx].face);
            }
            drag.active = false;
            highlightFace(-1);
        };

        mount.addEventListener("mousedown",  onMouseDown);
        mount.addEventListener("mousemove",  onMouseMove);
        mount.addEventListener("mouseleave", onMouseLeave);
        mount.addEventListener("wheel", e => e.stopPropagation(), { passive: true });
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
    }, [onFaceClick, size]); // labels and onLitFacesChange intentionally excluded: handled via refs

    // Texture-only update when labels change (no scene rebuild needed)
    useEffect(() => {
        if (!materialsRef.current.length) return;
        FACE_META.forEach(({ face, bg, fg }, i) => {
            const mat = materialsRef.current[i];
            if (!mat) return;
            mat.map?.dispose();
            mat.map = makeFaceTexture(labels?.[face] ?? face, bg, fg);
            mat.needsUpdate = true;
        });
    }, [labels]);

    return (
        <div
            ref={mountRef}
            style={{
                position: "absolute", top: 16, left: 16,
                width: size, height: size,
                cursor: "grab", borderRadius: 8, overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                background: "rgba(20,20,40,0.45)",
                backdropFilter: "blur(4px)", zIndex: 10,
            }}
        />
    );
}
