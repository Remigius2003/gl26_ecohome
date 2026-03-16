import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface SceneObject {
    id: string;
    mesh: THREE.Object3D; // supports Mesh and Group
}

export interface ThreeEngineHandle {
    addObject:        (obj: SceneObject) => void;
    removeObject:     (id: string) => void;
    getScene:         () => THREE.Scene;
    resetCamera:      () => void;
    toggleGrid:       () => void;
    setFrameCallback: (fn: (() => void) | null) => void;
}

interface Props {
    onReady?:       (handle: ThreeEngineHandle) => void;
    onGroundClick?: (point: THREE.Vector3) => void;
    onMeshClick?:   (sceneId: string, point: THREE.Vector3) => void;
    cameraBounds?:  number;
    style?:         React.CSSProperties;
}

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/** Walk up the Object3D hierarchy to find a sceneId in userData */
function findSceneId(obj: THREE.Object3D): string | undefined {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
        if (cur.userData.sceneId) return cur.userData.sceneId as string;
        cur = cur.parent;
    }
    return undefined;
}

export default function ThreeEngine({ onReady, onGroundClick, onMeshClick, cameraBounds = 25, style }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // --- Scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // --- Camera (top-down) ---
        const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        // --- Lighting ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // --- Grid ---
        const grid = new THREE.GridHelper(50, 50, 0x444466, 0x333355);
        scene.add(grid);

        // --- Objects map ---
        const objects = new Map<string, SceneObject>();

        // --- Animation ---
        let frameId = 0;
        const frameCallbackRef = { current: null as (() => void) | null };
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            // Always look straight down regardless of pan position
            camera.lookAt(camera.position.x, 0, camera.position.z);
            frameCallbackRef.current?.();
            renderer.render(scene, camera);
        };
        animate();

        // --- Drag / click state ---
        const drag = { active: false, lastX: 0, lastY: 0, startX: 0, startY: 0, moved: false };
        const clamp = (v: number) => Math.max(-cameraBounds, Math.min(cameraBounds, v));

        const onMouseDown = (e: MouseEvent) => {
            drag.active = true;
            drag.lastX  = e.clientX;
            drag.lastY  = e.clientY;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.moved  = false;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!drag.active) return;
            const dx = (e.clientX - drag.lastX) * 0.05;
            const dy = (e.clientY - drag.lastY) * 0.05;
            camera.position.x = clamp(camera.position.x - dx);
            camera.position.z = clamp(camera.position.z - dy);
            drag.lastX = e.clientX;
            drag.lastY = e.clientY;
            const tdx = e.clientX - drag.startX;
            const tdy = e.clientY - drag.startY;
            if (Math.sqrt(tdx * tdx + tdy * tdy) > 4) drag.moved = true;
        };

        const onMouseUp = (e: MouseEvent) => {
            if (!drag.active) return; // ignore mouseup from gizmo or external drags
            if (!drag.moved) {
                const rect = mount.getBoundingClientRect();
                const ndc = new THREE.Vector2(
                    ((e.clientX - rect.left)  / mount.clientWidth)  * 2 - 1,
                    -((e.clientY - rect.top) / mount.clientHeight) * 2 + 1
                );
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(ndc, camera);

                // 1. Try mesh hit first
                const allMeshes = Array.from(objects.values()).map(o => o.mesh);
                const hits = raycaster.intersectObjects(allMeshes, true /* recursive */);
                if (hits.length > 0) {
                    const sceneId = findSceneId(hits[0].object);
                    if (sceneId && onMeshClick) {
                        onMeshClick(sceneId, hits[0].point);
                        drag.active = false;
                        return;
                    }
                }

                // 2. Fall back to ground plane
                const groundHit = new THREE.Vector3();
                if (raycaster.ray.intersectPlane(GROUND_PLANE, groundHit) && onGroundClick) {
                    onGroundClick(groundHit);
                }
            }
            drag.active = false;
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            camera.position.y = Math.max(2, Math.min(100, camera.position.y + e.deltaY * 0.05));
        };

        const onResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };

        mount.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup",   onMouseUp);
        mount.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("resize", onResize);

        // --- Handle ---
        if (onReady) {
            onReady({
                addObject: (obj) => {
                    obj.mesh.userData.sceneId = obj.id; // tag for raycasting
                    objects.set(obj.id, obj);
                    scene.add(obj.mesh);
                },
                removeObject: (id) => {
                    const o = objects.get(id);
                    if (o) { scene.remove(o.mesh); objects.delete(id); }
                },
                getScene:         ()   => scene,
                resetCamera:      ()   => { camera.position.set(0, 20, 0); camera.lookAt(0, 0, 0); },
                toggleGrid:       ()   => { grid.visible = !grid.visible; },
                setFrameCallback: (fn) => { frameCallbackRef.current = fn; },
            });
        }

        return () => {
            cancelAnimationFrame(frameId);
            mount.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup",   onMouseUp);
            mount.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [onReady, onGroundClick, onMeshClick, cameraBounds]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", ...style }} />;
}
