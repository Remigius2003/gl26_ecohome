import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import ThreeEngine, { ThreeEngineHandle, SceneObject } from "../engine/ThreeEngine";
import OrientationGizmo, { GizmoFace } from "../engine/OrientationGizmo";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_JUMP_RANGE   = 20;
const MAX_ARC_HEIGHT   = 6;
const JUMP_DURATION_MS = 900;
const BLOCK_RADIUS     = 2.0;  // units: can't land within this of a non-movable object
const INTERACT_RANGE   = 5.0;  // units: max 2D distance to interact with an object

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ApiObject {
    id: number;
    label: string;
    geometry: "box" | "sphere" | "cylinder";
    color: string;
    x: number;
    y: number;
    z: number;
    movable: boolean;
    face: string;
}

interface LoadedEntry {
    label: string;
    movable: boolean;
    apiId: number;
    mesh: THREE.Mesh;
}

interface JumpState {
    from: THREE.Vector3;   // XZ current pos, Y = baseY
    to:   THREE.Vector3;   // XZ destination, Y = baseY
    startTime: number;
    duration:  number;
    arcHeight: number;
    baseY:     number;     // fixed ground Y for the movable object
    targetId:  number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildMesh(obj: ApiObject): THREE.Mesh {
    let geo: THREE.BufferGeometry;
    if      (obj.geometry === "sphere")   geo = new THREE.SphereGeometry(1.2, 32, 32);
    else if (obj.geometry === "cylinder") geo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    else                                  geo = new THREE.BoxGeometry(2, 2, 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: obj.color }));
    mesh.position.set(obj.x, obj.y, obj.z);
    return mesh;
}

/** Flat X marker visible from top-down camera */
function makeCrossMarker(pos: THREE.Vector3): THREE.Group {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2222, side: THREE.DoubleSide });
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

// ---------------------------------------------------------------------------
// Toast hook
// ---------------------------------------------------------------------------
function useToast() {
    const [msg, setMsg] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const show = useCallback((m: string) => {
        setMsg(m);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setMsg(null), 2500);
    }, []);
    return { msg, show };
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
export default function Home() {
    const engineRef      = useRef<ThreeEngineHandle | null>(null);
    const loadedIdsRef   = useRef<string[]>([]);
    // sceneId → entry (for mesh click lookups)
    const meshMapRef     = useRef<Map<string, LoadedEntry>>(new Map());
    // movable object refs
    const movableRef     = useRef<{ id: number; sceneId: string; mesh: THREE.Mesh } | null>(null);
    const movableBaseYRef = useRef<number>(1);
    const jumpRef        = useRef<JumpState | null>(null);
    // non-movable objects (for obstruction)
    const nonMovablesRef = useRef<{ mesh: THREE.Mesh; pos: THREE.Vector2 }[]>([]);

    const { msg: toast, show: showToast } = useToast();

    // -------------------------------------------------------------------------
    // Per-frame jump animation
    // -------------------------------------------------------------------------
    const onFrame = useCallback(() => {
        const jump    = jumpRef.current;
        const movable = movableRef.current;
        if (!jump || !movable) return;

        const t  = Math.min((performance.now() - jump.startTime) / jump.duration, 1);
        const te = 1 - (1 - t) * (1 - t); // ease-out quad

        movable.mesh.position.x = jump.from.x + (jump.to.x - jump.from.x) * te;
        movable.mesh.position.z = jump.from.z + (jump.to.z - jump.from.z) * te;
        movable.mesh.position.y = jump.baseY + Math.sin(t * Math.PI) * jump.arcHeight;

        if (t >= 1) {
            movable.mesh.position.set(jump.to.x, jump.baseY, jump.to.z);
            const landed = jump;
            jumpRef.current = null;
            fetch(`/api/objects/${landed.targetId}/position`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: landed.to.x, z: landed.to.z }),
            }).catch(() => {});
        }
    }, []);

    // -------------------------------------------------------------------------
    // Show a temporary cross marker above a blocking object
    // -------------------------------------------------------------------------
    const showCross = useCallback((blockingMesh: THREE.Mesh) => {
        const engine = engineRef.current;
        if (!engine) return;
        const crossId = `cross-${Date.now()}`;
        const group   = makeCrossMarker(blockingMesh.position);
        engine.addObject({ id: crossId, mesh: group } as SceneObject);
        setTimeout(() => engine.removeObject(crossId), 1800);
    }, []);

    // -------------------------------------------------------------------------
    // Load face objects into the scene
    // -------------------------------------------------------------------------
    const loadFace = useCallback((face: GizmoFace) => {
        const engine = engineRef.current;
        if (!engine) return;

        // Persist current position before leaving this face
        const movable = movableRef.current;
        if (movable) {
            // If mid-jump, save the intended destination; otherwise save current position
            const saveX = jumpRef.current ? jumpRef.current.to.x : movable.mesh.position.x;
            const saveZ = jumpRef.current ? jumpRef.current.to.z : movable.mesh.position.z;
            fetch(`/api/objects/${movable.id}/position`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: saveX, z: saveZ }),
            }).catch(() => {});
        }

        jumpRef.current = null;
        loadedIdsRef.current.forEach(id => engine.removeObject(id));
        loadedIdsRef.current   = [];
        meshMapRef.current     = new Map();
        movableRef.current     = null;
        nonMovablesRef.current = [];

        fetch(`/api/objects?face=${face}`)
            .then(r => r.json())
            .then((objects: ApiObject[]) => {
                objects.forEach(obj => {
                    const mesh    = buildMesh(obj);
                    const sceneId = `${face}-${obj.id}`;
                    loadedIdsRef.current.push(sceneId);
                    meshMapRef.current.set(sceneId, { label: obj.label, movable: obj.movable, apiId: obj.id, mesh });
                    engine.addObject({ id: sceneId, mesh });

                    if (obj.movable) {
                        movableRef.current    = { id: obj.id, sceneId, mesh };
                        movableBaseYRef.current = obj.y;
                    } else {
                        nonMovablesRef.current.push({ mesh, pos: new THREE.Vector2(obj.x, obj.z) });
                    }
                });
            })
            .catch(() => showToast("Could not load objects from server"));
    }, [showToast]);

    // -------------------------------------------------------------------------
    // Engine ready
    // -------------------------------------------------------------------------
    const handleReady = useCallback((engine: ThreeEngineHandle) => {
        engineRef.current = engine;
        engine.setFrameCallback(onFrame);
        loadFace("top");
    }, [onFrame, loadFace]);

    // -------------------------------------------------------------------------
    // Ground click → jump (with obstruction check)
    // -------------------------------------------------------------------------
    const handleGroundClick = useCallback((point: THREE.Vector3) => {
        const movable = movableRef.current;
        if (!movable) return;

        // Use stored baseY (not current mesh Y which may be mid-arc)
        const baseY = movableBaseYRef.current;
        const fromX = movable.mesh.position.x;
        const fromZ = movable.mesh.position.z;

        const dx     = point.x - fromX;
        const dz     = point.z - fromZ;
        const dist2D = Math.sqrt(dx * dx + dz * dz);
        if (dist2D < 0.1) return;

        // Clamp to max jump range
        const ratio       = Math.min(dist2D, MAX_JUMP_RANGE) / dist2D;
        const destX       = fromX + dx * ratio;
        const destZ       = fromZ + dz * ratio;
        const clampedDist = dist2D * ratio;

        // Obstruction check: is the landing spot blocked?
        for (const nm of nonMovablesRef.current) {
            const d = Math.sqrt((nm.pos.x - destX) ** 2 + (nm.pos.y - destZ) ** 2);
            if (d < BLOCK_RADIUS) {
                showCross(nm.mesh);
                showToast("Path blocked!");
                return;
            }
        }

        const to        = new THREE.Vector3(destX, baseY, destZ);
        const from      = new THREE.Vector3(fromX, baseY, fromZ);
        const arcHeight = (clampedDist / MAX_JUMP_RANGE) * MAX_ARC_HEIGHT;
        const duration  = JUMP_DURATION_MS * Math.pow(clampedDist / MAX_JUMP_RANGE, 0.6);

        jumpRef.current = { from, to, startTime: performance.now(), duration, arcHeight, baseY, targetId: movable.id };
    }, [showCross, showToast]);

    // -------------------------------------------------------------------------
    // Mesh click → interact if nearby
    // -------------------------------------------------------------------------
    const handleMeshClick = useCallback((sceneId: string) => {
        const entry   = meshMapRef.current.get(sceneId);
        const movable = movableRef.current;
        if (!entry || entry.movable || !movable) return; // ignore self-clicks

        const mx  = movable.mesh.position.x;
        const mz  = movable.mesh.position.z;
        const dist = Math.sqrt((entry.mesh.position.x - mx) ** 2 + (entry.mesh.position.z - mz) ** 2);

        if (dist <= INTERACT_RANGE) {
            // Visual: brief emissive flash on the object
            const mat = entry.mesh.material as THREE.MeshStandardMaterial;
            const orig = mat.emissiveIntensity;
            mat.emissive.set(0xffffff);
            mat.emissiveIntensity = 0.5;
            setTimeout(() => { mat.emissiveIntensity = orig; mat.emissive.set(0x000000); }, 400);
            showToast(`Interacted with ${entry.label}`);
        } else {
            showToast(`Too far to interact (${dist.toFixed(1)} units away)`);
        }
    }, [showToast]);

    // -------------------------------------------------------------------------
    // Gizmo face click → switch scene
    // -------------------------------------------------------------------------
    const handleFaceClick = useCallback((face: GizmoFace) => {
        loadFace(face);
        showToast(`View: ${face}`);
        if (face === "top")    engineRef.current?.resetCamera();
        if (face === "bottom") engineRef.current?.toggleGrid();
    }, [loadFace, showToast]);

    return (
        <main style={{ position: "relative", width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
            <ThreeEngine
                onReady={handleReady}
                onGroundClick={handleGroundClick}
                onMeshClick={handleMeshClick}
                cameraBounds={25}
                style={{ width: "100%", height: "100%" }}
            />

            <OrientationGizmo onFaceClick={handleFaceClick} size={120} />

            <div style={{
                position: "fixed", bottom: 16, left: 16,
                color: "#888", fontSize: 12, pointerEvents: "none",
                userSelect: "none", fontFamily: "sans-serif", lineHeight: 1.8,
            }}>
                🖱 Drag to pan &nbsp;|&nbsp; Scroll to zoom &nbsp;|&nbsp; Click ground to jump &nbsp;|&nbsp; Click nearby object to interact
            </div>

            {toast && (
                <div style={{
                    position: "fixed", bottom: 48, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(20,20,50,0.9)", color: "#fff", padding: "8px 20px",
                    borderRadius: 6, fontSize: 13, fontFamily: "sans-serif",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none", zIndex: 20,
                }}>
                    {toast}
                </div>
            )}
        </main>
    );
}
