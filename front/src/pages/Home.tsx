import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import ThreeEngine, {
    ThreeEngineHandle,
    SceneObject,
} from "../engine/ThreeEngine";
import OrientationGizmo, { GizmoFace } from "../engine/OrientationGizmo";
import LangButton from "../components/LangButton";
import SettingsButton from "../components/SettingsButton";
import InfoButton from "../components/InfoButton";
import EmbeddedPanel from "../components/EmbeddedPanel";
import GameHUD from "../components/game/GameHUD";
import { useLang } from "../context/LangContext";
import { ApiObject, buildObject, makeCrossMarker, makeLabel } from "./sceneHelpers";
import { useGame } from "./game/useGame";
import { useToast } from "../hooks/useToast";
import { useDust } from "../hooks/useDust";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_JUMP_RANGE = 20;
const MAX_ARC_HEIGHT = 6;
const JUMP_DURATION_MS = 900;
const BLOCK_RADIUS = 2.0; // units: can't land within this of a non-movable object
const INTERACT_RANGE = 5.0; // units: max 2D distance to interact with an object
const WORLD_BOUNDS = 24; // must stay inside the visible boundary (pillars at 25)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LoadedEntry {
    label: string;
    movable: boolean;
    apiId: number;
    mesh: THREE.Mesh;
    path?: string;
}

interface JumpState {
    from: THREE.Vector3; // XZ current pos, Y = baseY
    to: THREE.Vector3; // XZ destination, Y = baseY
    startTime: number;
    duration: number;
    arcHeight: number;
    baseY: number; // fixed ground Y for the movable object
    targetId: number;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
export default function Home() {
    const engineRef = useRef<ThreeEngineHandle | null>(null);
    const loadedIdsRef = useRef<string[]>([]);
    // sceneId → entry (for mesh click lookups)
    const meshMapRef = useRef<Map<string, LoadedEntry>>(new Map());
    // movable object refs
    const movableRef = useRef<{
        id: number;
        sceneId: string;
        mesh: THREE.Mesh;
    } | null>(null);
    const movableBaseYRef = useRef<number>(1);
    const jumpRef = useRef<JumpState | null>(null);
    const pendingDestRef = useRef<THREE.Vector3 | null>(null);
    // non-movable objects (for obstruction)
    const nonMovablesRef = useRef<{ mesh: THREE.Mesh; pos: THREE.Vector2 }[]>(
        [],
    );

    const activeFaceRef = useRef<GizmoFace>("front");
    const [activeFace, setActiveFace] = useState<GizmoFace>("front");

    const game = useGame(engineRef, movableRef, activeFaceRef);
    const { spawnDust, tickDust } = useDust(engineRef);

    const { msg: toast, show: showToast } = useToast();
    const { t } = useLang();
    const tRef = useRef(t);
    tRef.current = t; // always current without adding t to every dep array
    const [panel, setPanel] = useState<{ label: string; path: string } | null>(
        null,
    );
    const [faceOverlay, setFaceOverlay] = useState<{
        clipPath: string;
        transition: string;
        label: string;
    } | null>(null);

    // -------------------------------------------------------------------------
    // Per-frame animation + mini-game tick
    // -------------------------------------------------------------------------
    const onFrame = useCallback(() => {
        // ── Dust particles ──────────────────────────────────────────────────────
        tickDust();

        // ── Jump animation ──────────────────────────────────────────────────────
        const jump = jumpRef.current;
        const movable = movableRef.current;
        if (jump && movable) {
            const t = Math.min((performance.now() - jump.startTime) / jump.duration, 1);
            const te = 1 - (1 - t) * (1 - t);
            movable.mesh.position.x = jump.from.x + (jump.to.x - jump.from.x) * te;
            movable.mesh.position.z = jump.from.z + (jump.to.z - jump.from.z) * te;
            movable.mesh.position.y = jump.baseY + Math.sin(t * Math.PI) * jump.arcHeight;
            if (t >= 1) {
                movable.mesh.position.set(jump.to.x, jump.baseY, jump.to.z);
                // Landing dust
                spawnDust(new THREE.Vector3(jump.to.x, 0, jump.to.z));
                const landed = jump;
                jumpRef.current = null;
                fetch(`/api/objects/${landed.targetId}/position`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ x: landed.to.x, z: landed.to.z }),
                }).catch(() => {});
                const pending = pendingDestRef.current;
                if (pending) {
                    pendingDestRef.current = null;
                    const fromX = landed.to.x, fromZ = landed.to.z, baseY = landed.baseY;
                    const dx = pending.x - fromX, dz = pending.z - fromZ;
                    const dist2D = Math.sqrt(dx*dx + dz*dz);
                    if (dist2D >= 0.1) {
                        const jumpRatio = Math.min(dist2D, MAX_JUMP_RANGE) / dist2D;
                        const destX = Math.max(-WORLD_BOUNDS, Math.min(WORLD_BOUNDS, fromX + dx * jumpRatio));
                        const destZ = Math.max(-WORLD_BOUNDS, Math.min(WORLD_BOUNDS, fromZ + dz * jumpRatio));
                        const clampedDist = Math.sqrt((destX-fromX)**2 + (destZ-fromZ)**2);
                        if (clampedDist >= 0.1) {
                            let blocked = false;
                            for (const nm of nonMovablesRef.current) {
                                if (Math.sqrt((nm.pos.x-destX)**2 + (nm.pos.y-destZ)**2) < BLOCK_RADIUS) { blocked = true; break; }
                            }
                            if (!blocked) {
                                jumpRef.current = {
                                    from: new THREE.Vector3(fromX, baseY, fromZ),
                                    to:   new THREE.Vector3(destX, baseY, destZ),
                                    startTime: performance.now(),
                                    duration:  JUMP_DURATION_MS * Math.pow(clampedDist / MAX_JUMP_RANGE, 0.6),
                                    arcHeight: (clampedDist / MAX_JUMP_RANGE) * MAX_ARC_HEIGHT,
                                    baseY, targetId: movable.id,
                                };
                                // Takeoff dust for queued jump
                                spawnDust(new THREE.Vector3(fromX, 0, fromZ));
                            }
                        }
                    }
                }
            }
        }

        game.gameTick();
    }, [game.gameTick, tickDust, spawnDust]);

    // -------------------------------------------------------------------------
    // Show a temporary cross marker above a blocking object
    // -------------------------------------------------------------------------
    const showCross = useCallback((blockingMesh: THREE.Mesh) => {
        const engine = engineRef.current;
        if (!engine) return;
        const crossId = `cross-${Date.now()}`;
        const group = makeCrossMarker(blockingMesh.position);
        engine.addObject({ id: crossId, mesh: group } as SceneObject);
        setTimeout(() => engine.removeObject(crossId), 1800);
    }, []);

    // -------------------------------------------------------------------------
    // Load face objects into the scene
    // -------------------------------------------------------------------------
    const loadFace = useCallback(
        (face: GizmoFace) => {
            const engine = engineRef.current;
            if (!engine) return;

            // Persist current position before leaving this face
            const movable = movableRef.current;
            if (movable) {
                // If mid-jump, save the intended destination; otherwise save current position
                const saveX = jumpRef.current
                    ? jumpRef.current.to.x
                    : movable.mesh.position.x;
                const saveZ = jumpRef.current
                    ? jumpRef.current.to.z
                    : movable.mesh.position.z;
                fetch(`/api/objects/${movable.id}/position`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ x: saveX, z: saveZ }),
                }).catch(() => {});
            }

            // Stop game when switching away from back face
            game.stopGame(engine);

            jumpRef.current = null;
            pendingDestRef.current = null;
            loadedIdsRef.current.forEach((id) => engine.removeObject(id));
            loadedIdsRef.current = [];
            meshMapRef.current = new Map();
            movableRef.current = null;
            nonMovablesRef.current = [];

            fetch(`/api/objects?face=${face}`)
                .then((r) => r.json())
                .then(async (apiObjects: ApiObject[]) => {
                    const built = await Promise.all(
                        apiObjects.map(buildObject),
                    );
                    built.forEach((object3d, i) => {
                        const obj = apiObjects[i];
                        const sceneId = `${face}-${obj.id}`;
                        const mesh = object3d as THREE.Mesh;
                        loadedIdsRef.current.push(sceneId);
                        meshMapRef.current.set(sceneId, {
                            label: obj.label,
                            movable: obj.movable,
                            apiId: obj.id,
                            mesh,
                            path: obj.path,
                        });
                        engine.addObject({ id: sceneId, mesh: object3d });

                        if (obj.movable) {
                            movableRef.current = { id: obj.id, sceneId, mesh };
                            movableBaseYRef.current = obj.y;
                        } else {
                            nonMovablesRef.current.push({
                                mesh,
                                pos: new THREE.Vector2(obj.x, obj.z),
                            });
                            if (obj.path || obj.subtitle) {
                                const labelId = `${sceneId}-label`;
                                const displayName = tRef.current.labels[obj.label] ?? obj.label;
                                const sprite = makeLabel(
                                    displayName,
                                    obj.subtitle ?? "",
                                );
                                sprite.position.set(obj.x, obj.y + 3, obj.z);
                                engine.addObject({ id: labelId, mesh: sprite });
                                loadedIdsRef.current.push(labelId);
                                if (obj.label === "Start Game") {
                                    game.startCubeRef.current = { sceneId, mesh, labelId, labelMesh: sprite };
                                }
                            } else if (obj.label === "Start Game") {
                                game.startCubeRef.current = { sceneId, mesh, labelId: null, labelMesh: null };
                            }
                        }
                    });
                })
                .catch(() => showToast(tRef.current.ui.loadError));
        },
        [showToast, game.stopGame, game.startCubeRef],
    );

    // -------------------------------------------------------------------------
    // Engine ready
    // -------------------------------------------------------------------------
    const handleReady = useCallback(
        (engine: ThreeEngineHandle) => {
            engineRef.current = engine;
            activeFaceRef.current = "front";
            engine.setFrameCallback(onFrame);
            loadFace("front");
        },
        [onFrame, loadFace],
    );

    // -------------------------------------------------------------------------
    // Ground click → jump (with obstruction check)
    // -------------------------------------------------------------------------
    const handleGroundClick = useCallback(
        (point: THREE.Vector3) => {
            const movable = movableRef.current;
            if (!movable) return;

            // Queue destination if currently mid-air
            if (jumpRef.current) {
                pendingDestRef.current = point.clone();
                return;
            }

            // Use stored baseY (not current mesh Y which may be mid-arc)
            const baseY = movableBaseYRef.current;
            const fromX = movable.mesh.position.x;
            const fromZ = movable.mesh.position.z;

            const dx = point.x - fromX;
            const dz = point.z - fromZ;
            const dist2D = Math.sqrt(dx * dx + dz * dz);
            if (dist2D < 0.1) return;

            // Clamp to max jump range then to world boundary
            const jumpRatio = Math.min(dist2D, MAX_JUMP_RANGE) / dist2D;
            const destX = Math.max(
                -WORLD_BOUNDS,
                Math.min(WORLD_BOUNDS, fromX + dx * jumpRatio),
            );
            const destZ = Math.max(
                -WORLD_BOUNDS,
                Math.min(WORLD_BOUNDS, fromZ + dz * jumpRatio),
            );

            // Recalculate actual distance after both clamps (affects arc + duration)
            const clampedDist = Math.sqrt(
                (destX - fromX) ** 2 + (destZ - fromZ) ** 2,
            );
            if (clampedDist < 0.1) return;

            // Obstruction check: is the landing spot blocked?
            for (const nm of nonMovablesRef.current) {
                const d = Math.sqrt(
                    (nm.pos.x - destX) ** 2 + (nm.pos.y - destZ) ** 2,
                );
                if (d < BLOCK_RADIUS) {
                    showCross(nm.mesh);
                    showToast(tRef.current.ui.pathBlocked);
                    return;
                }
            }

            const to = new THREE.Vector3(destX, baseY, destZ);
            const from = new THREE.Vector3(fromX, baseY, fromZ);
            const arcHeight = (clampedDist / MAX_JUMP_RANGE) * MAX_ARC_HEIGHT;
            const duration =
                JUMP_DURATION_MS * Math.pow(clampedDist / MAX_JUMP_RANGE, 0.6);

            jumpRef.current = {
                from,
                to,
                startTime: performance.now(),
                duration,
                arcHeight,
                baseY,
                targetId: movable.id,
            };
            // Takeoff dust
            spawnDust(new THREE.Vector3(fromX, 0, fromZ));
        },
        [showCross, showToast, spawnDust],
    );

    // -------------------------------------------------------------------------
    // Mesh click → interact if nearby
    // -------------------------------------------------------------------------
    const handleMeshClick = useCallback(
        (sceneId: string) => {
            const entry = meshMapRef.current.get(sceneId);
            const movable = movableRef.current;
            if (!entry || entry.movable || !movable) return; // ignore self-clicks

            const mx = movable.mesh.position.x;
            const mz = movable.mesh.position.z;
            const dist = Math.sqrt(
                (entry.mesh.position.x - mx) ** 2 +
                    (entry.mesh.position.z - mz) ** 2,
            );

            if (dist <= INTERACT_RANGE) {
                // Visual: brief emissive flash
                const mat = entry.mesh.material as THREE.MeshStandardMaterial;
                const orig = mat.emissiveIntensity;
                mat.emissive.set(0xffffff);
                mat.emissiveIntensity = 0.5;
                setTimeout(() => {
                    mat.emissiveIntensity = orig;
                    mat.emissive.set(0x000000);
                }, 400);

                // Mini-game trigger
                if (entry.label === "Start Game") {
                    game.startGame();
                    return;
                }

                if (entry.path) {
                    setPanel({ label: entry.label, path: entry.path });
                } else {
                    showToast(
                        `${tRef.current.ui.interactedWith} ${entry.label}`,
                    );
                }
            } else {
                showToast(`${tRef.current.ui.tooFar} (${dist.toFixed(1)} u)`);
            }
        },
        [showToast, game.startGame],
    );

    // -------------------------------------------------------------------------
    // Right-click → fire projectile toward ground point
    // -------------------------------------------------------------------------
    const handleRightClick = useCallback((point: THREE.Vector3) => {
        game.fireProjectile(point);
    }, [game.fireProjectile]);

    // -------------------------------------------------------------------------
    // Gizmo face click → switch scene with iris transition
    // -------------------------------------------------------------------------
    const handleFaceClick = useCallback(
        (face: GizmoFace) => {
            activeFaceRef.current = face;
            setActiveFace(face);
            const label = tRef.current.faces[face] ?? face;

            // Phase 1: mount overlay clipped to nothing (invisible)
            setFaceOverlay({ clipPath: "circle(0% at 50% 50%)", transition: "none", label });

            // Phase 2: two rAFs later — animate iris closed (overlay expands)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setFaceOverlay((prev) =>
                        prev
                            ? { ...prev, clipPath: "circle(150% at 50% 50%)", transition: "clip-path 380ms cubic-bezier(0.85,0,0.15,1)" }
                            : null,
                    );
                });
            });

            // Phase 3: switch face, then open iris
            setTimeout(() => {
                loadFace(face);
                showToast(`${tRef.current.ui.view}: ${label}`);
                setFaceOverlay((prev) =>
                    prev
                        ? { ...prev, clipPath: "circle(0% at 50% 50%)", transition: "clip-path 500ms cubic-bezier(0.15,0,0.85,1)" }
                        : null,
                );
            }, 420);

            // Phase 4: unmount overlay
            setTimeout(() => setFaceOverlay(null), 950);
        },
        [loadFace, showToast],
    );

    // -------------------------------------------------------------------------
    // Gizmo lit faces → update main scene lights
    // -------------------------------------------------------------------------
    const handleLitFaces = useCallback((lit: Set<GizmoFace>) => {
        const engine = engineRef.current;
        if (!engine) return;
        (
            ["top", "bottom", "front", "back", "left", "right"] as GizmoFace[]
        ).forEach((face) => {
            engine.setFaceLit(face, lit.has(face));
        });
    }, []);

    return (
        <main
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                margin: 0,
                padding: 0,
                overflow: "hidden",
            }}
        >
            <ThreeEngine
                onReady={handleReady}
                onGroundClick={handleGroundClick}
                onMeshClick={handleMeshClick}
                onRightClick={handleRightClick}
                cameraBounds={25}
                style={{ width: "100%", height: "100%" }}
            />

            <OrientationGizmo
                onFaceClick={handleFaceClick}
                onLitFacesChange={handleLitFaces}
                labels={t.faces}
                size={180}
            />

            {/* Name — top right */}
            <div
                style={{
                    position: "fixed",
                    top: 20,
                    right: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 5,
                }}
            >
                <span
                    style={{
                        color: "#ffffff",
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: "sans-serif",
                        letterSpacing: 2,
                        textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                    }}
                >
                    Zephiel
                </span>
                <span
                    style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 400,
                        fontFamily: "sans-serif",
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        marginTop: 2,
                    }}
                >
                    portfolio
                </span>
            </div>

            {/* Buttons below the gizmo */}
            <div
                style={{
                    position: "absolute",
                    top: 16 + 180 + 8,
                    left: 16,
                    display: "flex",
                    gap: 8,
                    zIndex: 5,
                }}
            >
                <LangButton />
                <InfoButton
                    onOpen={() => setPanel({ label: "Info", path: "/info" })}
                />
                <SettingsButton />
            </div>

            <div
                style={{
                    position: "fixed",
                    bottom: 16,
                    left: 16,
                    color: "#888",
                    fontSize: 12,
                    pointerEvents: "none",
                    userSelect: "none",
                    fontFamily: "sans-serif",
                    lineHeight: 1.8,
                    zIndex: 5,
                }}
            >
                {activeFace === "back"
                    ? "🖱 Click ground to jump  |  Click Start Game to play  |  Right-click / Space to shoot"
                    : "🖱 Drag to pan  |  Scroll to zoom  |  Click ground to jump  |  Click nearby object to interact"
                }
            </div>

            {faceOverlay && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 2,
                        pointerEvents: "none",
                        clipPath: faceOverlay.clipPath,
                        transition: faceOverlay.transition,
                        backgroundImage: [
                            "linear-gradient(rgba(67,97,238,0.06) 1px, transparent 1px)",
                            "linear-gradient(90deg, rgba(67,97,238,0.06) 1px, transparent 1px)",
                            "radial-gradient(ellipse at center, #0e0630 0%, #06061a 70%)",
                        ].join(", "),
                        backgroundSize: "40px 40px, 40px 40px, 100% 100%",
                        filter: "drop-shadow(0 0 18px rgba(67,97,238,0.9)) drop-shadow(0 0 6px rgba(150,180,255,0.6))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{
                            color: "#8ba8ff",
                            fontSize: 26,
                            fontFamily: "sans-serif",
                            fontWeight: 700,
                            letterSpacing: 6,
                            textTransform: "uppercase",
                            textShadow: "0 0 20px rgba(100,140,255,0.95), 0 0 50px rgba(67,97,238,0.6)",
                        }}
                    >
                        {faceOverlay.label}
                    </span>
                </div>
            )}

            {activeFace === "back" && (
                <GameHUD
                    hp={game.gameHp}
                    mana={game.gameMana}
                    score={game.gameScore}
                    bestScore={game.bestScore}
                    gameOver={game.gameOver}
                    onRestart={() => game.setGameOver(false)}
                />
            )}

            {panel && (
                <EmbeddedPanel
                    label={panel.label}
                    path={panel.path}
                    onClose={() => setPanel(null)}
                />
            )}

            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 48,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(20,20,50,0.9)",
                        color: "#fff",
                        padding: "8px 20px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontFamily: "sans-serif",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        pointerEvents: "none",
                        zIndex: 20,
                    }}
                >
                    {toast}
                </div>
            )}
        </main>
    );
}
