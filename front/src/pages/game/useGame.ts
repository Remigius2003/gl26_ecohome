import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeEngineHandle, SceneObject } from "../../engine/ThreeEngine";
import { GizmoFace } from "../../engine/OrientationGizmo";
import { GameEnemy, GameProjectile, GameManaPickup, StartCubeInfo } from "./types";
import {
    MANA_MAX,
    MANA_REGEN,
    SHOOT_COST,
    PROJ_SPEED,
    PROJ_LIFETIME,
    PROJ_DAMAGE,
    ENEMY_PROJ_SPEED,
    ENEMY_PROJ_LIFETIME,
    PLAYER_RADIUS,
    SPAWN_INTERVAL_START,
    SPAWN_INTERVAL_MIN,
    BEST_SCORE_KEY,
    MANA_PICKUP_INTERVAL,
    MANA_PICKUP_LIFETIME,
    MANA_PICKUP_AMOUNT,
    MANA_PICKUP_RADIUS,
    ENEMY_DEFS,
} from "./constants";

export function useGame(
    engineRef: React.MutableRefObject<ThreeEngineHandle | null>,
    movableRef: React.MutableRefObject<{ id: number; sceneId: string; mesh: THREE.Mesh } | null>,
    activeFaceRef: React.MutableRefObject<GizmoFace>,
) {
    // ── Game state refs ────────────────────────────────────────────────────────
    const gameActiveRef     = useRef(false);
    const gameStartTimeRef  = useRef(0);
    const hpRef             = useRef(100);
    const manaRef           = useRef(MANA_MAX);
    const scoreRef          = useRef(0);
    const bestScoreRef      = useRef(parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0"));
    const lastGameFrameRef  = useRef(0);
    const enemiesRef        = useRef<GameEnemy[]>([]);
    const playerProjsRef    = useRef<GameProjectile[]>([]);
    const enemyProjsRef     = useRef<GameProjectile[]>([]);
    const manaPickupsRef    = useRef<GameManaPickup[]>([]);
    const nextSpawnRef      = useRef(0);
    const nextPickupRef     = useRef(0);
    const startCubeRef      = useRef<StartCubeInfo | null>(null);

    const [gameActive, setGameActive] = useState(false);
    const [gameOver,   setGameOver]   = useState(false);
    const [gameHp,     setGameHp]     = useState(100);
    const [gameMana,   setGameMana]   = useState(MANA_MAX);
    const [gameScore,  setGameScore]  = useState(0);
    const [bestScore,  setBestScore]  = useState(parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0"));

    // Stable ref-pattern for doGameOver to avoid stale closures inside gameTick
    const doGameOverRef = useRef<() => void>(() => {});
    doGameOverRef.current = () => {
        const engine = engineRef.current;
        if (!engine) return;
        gameActiveRef.current = false;
        [...enemiesRef.current, ...playerProjsRef.current, ...enemyProjsRef.current, ...manaPickupsRef.current]
            .forEach(o => engine.removeObject(o.id));
        enemiesRef.current = []; playerProjsRef.current = []; enemyProjsRef.current = []; manaPickupsRef.current = [];
        const final = scoreRef.current;
        if (final > bestScoreRef.current) {
            bestScoreRef.current = final;
            localStorage.setItem(BEST_SCORE_KEY, String(final));
            setBestScore(final);
        }
        const sc = startCubeRef.current;
        if (sc) {
            engine.addObject({ id: sc.sceneId, mesh: sc.mesh } as SceneObject);
            if (sc.labelId && sc.labelMesh) engine.addObject({ id: sc.labelId, mesh: sc.labelMesh } as SceneObject);
        }
        setGameActive(false);
        setGameOver(true);
    };

    const gameTick = useCallback(() => {
        if (activeFaceRef.current !== "back" || !gameActiveRef.current) return;
        const engine = engineRef.current;
        const mv = movableRef.current;
        if (!engine || !mv) return;

        const now = performance.now();
        const dt = Math.min((now - lastGameFrameRef.current) / 1000, 0.1);
        lastGameFrameRef.current = now;

        const px = mv.mesh.position.x, pz = mv.mesh.position.z;

        // Mana regen
        manaRef.current = Math.min(MANA_MAX, manaRef.current + MANA_REGEN * dt);

        // Move player projectiles + collision with enemies
        playerProjsRef.current = playerProjsRef.current.filter(proj => {
            if (now - proj.born > proj.lifetime) { engine.removeObject(proj.id); return false; }
            proj.mesh.position.x += proj.dir.x * proj.speed * dt;
            proj.mesh.position.z += proj.dir.z * proj.speed * dt;
            for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
                const e = enemiesRef.current[i];
                const d = Math.hypot(proj.mesh.position.x - e.mesh.position.x, proj.mesh.position.z - e.mesh.position.z);
                if (d < e.radius + 0.3) {
                    e.hp -= proj.damage;
                    engine.removeObject(proj.id);
                    if (e.hp <= 0) {
                        engine.removeObject(e.id);
                        scoreRef.current += e.score;
                        setGameScore(scoreRef.current);
                        enemiesRef.current.splice(i, 1);
                    }
                    return false;
                }
            }
            return true;
        });

        // Move enemy projectiles + collision with player
        enemyProjsRef.current = enemyProjsRef.current.filter(proj => {
            if (now - proj.born > proj.lifetime) { engine.removeObject(proj.id); return false; }
            proj.mesh.position.x += proj.dir.x * proj.speed * dt;
            proj.mesh.position.z += proj.dir.z * proj.speed * dt;
            const d = Math.hypot(proj.mesh.position.x - px, proj.mesh.position.z - pz);
            if (d < PLAYER_RADIUS + 0.25) {
                hpRef.current = Math.max(0, hpRef.current - proj.damage);
                setGameHp(hpRef.current);
                engine.removeObject(proj.id);
                if (hpRef.current <= 0) {
                    doGameOverRef.current();
                    return false;
                }
                return false;
            }
            return true;
        });

        if (!gameActiveRef.current) return;

        // Update enemies
        const elapsed = (now - gameStartTimeRef.current) / 1000;
        for (const e of enemiesRef.current) {
            const dx = px - e.mesh.position.x, dz = pz - e.mesh.position.z;
            const dist = Math.hypot(dx, dz) || 0.001;
            if (e.type === "melee") {
                if (dist > 1.8) {
                    e.mesh.position.x += (dx / dist) * e.speed * dt;
                    e.mesh.position.z += (dz / dist) * e.speed * dt;
                } else if (now - e.lastShot > 900) {
                    e.lastShot = now;
                    hpRef.current = Math.max(0, hpRef.current - e.damage);
                    setGameHp(hpRef.current);
                    if (hpRef.current <= 0) {
                        doGameOverRef.current();
                        return;
                    }
                }
            } else {
                const preferred = 9;
                if (dist > preferred + 1) { e.mesh.position.x += (dx/dist)*e.speed*dt; e.mesh.position.z += (dz/dist)*e.speed*dt; }
                else if (dist < preferred - 1) { e.mesh.position.x -= (dx/dist)*e.speed*dt; e.mesh.position.z -= (dz/dist)*e.speed*dt; }
                if (now - e.lastShot > e.shootInterval) {
                    e.lastShot = now;
                    const dir = new THREE.Vector3(dx/dist, 0, dz/dist);
                    const id = `ep-${now}-${Math.random().toString(36).slice(2)}`;
                    const geo = new THREE.SphereGeometry(0.25, 6, 6);
                    const mat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(e.mesh.position.x + dir.x, 1, e.mesh.position.z + dir.z);
                    enemyProjsRef.current.push({ id, mesh, dir, speed: ENEMY_PROJ_SPEED, born: now, lifetime: ENEMY_PROJ_LIFETIME, damage: e.damage });
                    engine.addObject({ id, mesh } as SceneObject);
                }
            }
        }

        // Mana pickups — expire + collect
        manaPickupsRef.current = manaPickupsRef.current.filter(p => {
            if (now - p.born > MANA_PICKUP_LIFETIME) { engine.removeObject(p.id); return false; }
            if (Math.hypot(p.mesh.position.x - px, p.mesh.position.z - pz) < MANA_PICKUP_RADIUS) {
                manaRef.current = Math.min(MANA_MAX, manaRef.current + MANA_PICKUP_AMOUNT);
                setGameMana(Math.round(manaRef.current));
                engine.removeObject(p.id);
                return false;
            }
            // Gentle bob
            p.mesh.position.y = 1 + Math.sin((now - p.born) / 400) * 0.3;
            return true;
        });

        // Spawn mana pickup
        if (now >= nextPickupRef.current) {
            nextPickupRef.current = now + MANA_PICKUP_INTERVAL;
            const angle = Math.random() * Math.PI * 2;
            const dist  = 4 + Math.random() * 10;
            const pid   = `mp-${now}-${Math.random().toString(36).slice(2)}`;
            const geo   = new THREE.SphereGeometry(0.55, 10, 10);
            const mat   = new THREE.MeshBasicMaterial({ color: 0x06d6a0 });
            const mesh  = new THREE.Mesh(geo, mat);
            mesh.position.set(px + Math.cos(angle) * dist, 1, pz + Math.sin(angle) * dist);
            manaPickupsRef.current.push({ id: pid, mesh, born: now });
            engine.addObject({ id: pid, mesh } as SceneObject);
        }

        // Spawn enemies
        if (now >= nextSpawnRef.current) {
            const difficulty = 1 + elapsed / 35;
            const interval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_START - elapsed * 32);
            nextSpawnRef.current = now + interval;
            const def = ENEMY_DEFS[Math.floor(Math.random() * ENEMY_DEFS.length)];
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = 18 + Math.random() * 4;
            const sx = Math.cos(angle) * spawnDist, sz = Math.sin(angle) * spawnDist;
            const hp = Math.round(def.hp * difficulty);
            const speed = Math.min(def.speed * Math.sqrt(difficulty), def.speed * 2.5);
            const id = `en-${now}-${Math.random().toString(36).slice(2)}`;
            const size = def.type === "melee" ? 1.8 : 1.3;
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshStandardMaterial({ color: def.color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(sx, 1, sz);
            enemiesRef.current.push({ id, mesh, hp, speed, type: def.type, damage: Math.round(def.damage * difficulty), score: def.score, lastShot: 0, shootInterval: def.shootInterval, radius: def.radius });
            engine.addObject({ id, mesh } as SceneObject);
        }
    }, []);

    // -------------------------------------------------------------------------
    // Start mini-game
    // -------------------------------------------------------------------------
    const startGame = useCallback(() => {
        if (gameActiveRef.current) return;
        hpRef.current = 100;
        manaRef.current = MANA_MAX;
        scoreRef.current = 0;
        setGameHp(100);
        setGameMana(MANA_MAX);
        setGameScore(0);
        setGameOver(false);
        setGameActive(true);
        gameActiveRef.current = true;
        gameStartTimeRef.current = performance.now();
        lastGameFrameRef.current = performance.now();
        nextSpawnRef.current = performance.now() + SPAWN_INTERVAL_START;
        nextPickupRef.current = performance.now() + MANA_PICKUP_INTERVAL;
        enemiesRef.current = [];
        playerProjsRef.current = [];
        enemyProjsRef.current = [];
        manaPickupsRef.current = [];
        // Hide Start Game cube while game is running
        const sc = startCubeRef.current;
        if (sc) {
            const eng = engineRef.current;
            if (eng) { eng.removeObject(sc.sceneId); if (sc.labelId) eng.removeObject(sc.labelId); }
        }
    }, []);

    // -------------------------------------------------------------------------
    // Fire a player projectile toward a target point
    // -------------------------------------------------------------------------
    const fireProjectile = useCallback((target: THREE.Vector3) => {
        if (!gameActiveRef.current || activeFaceRef.current !== "back") return;
        if (manaRef.current < SHOOT_COST) return;
        const mv = movableRef.current;
        if (!mv) return;
        const engine = engineRef.current;
        if (!engine) return;
        manaRef.current -= SHOOT_COST;
        setGameMana(Math.round(manaRef.current));
        const dx = target.x - mv.mesh.position.x;
        const dz = target.z - mv.mesh.position.z;
        const len = Math.hypot(dx, dz) || 1;
        const dir = new THREE.Vector3(dx / len, 0, dz / len);
        const id = `pp-${performance.now()}-${Math.random().toString(36).slice(2)}`;
        const geo = new THREE.SphereGeometry(0.2, 6, 6);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(mv.mesh.position.x + dir.x, 1, mv.mesh.position.z + dir.z);
        playerProjsRef.current.push({ id, mesh, dir, speed: PROJ_SPEED, born: performance.now(), lifetime: PROJ_LIFETIME, damage: PROJ_DAMAGE });
        engine.addObject({ id, mesh } as SceneObject);
    }, []);

    // -------------------------------------------------------------------------
    // Stop game (e.g. when switching face)
    // -------------------------------------------------------------------------
    const stopGame = useCallback((engine: ThreeEngineHandle) => {
        if (!gameActiveRef.current) return;
        gameActiveRef.current = false;
        [...enemiesRef.current, ...playerProjsRef.current, ...enemyProjsRef.current, ...manaPickupsRef.current]
            .forEach(o => engine.removeObject(o.id));
        enemiesRef.current = []; playerProjsRef.current = []; enemyProjsRef.current = []; manaPickupsRef.current = [];
        setGameActive(false);
        setGameOver(false);
        startCubeRef.current = null;
    }, []);

    // Space bar → fire toward closest enemy (or forward if none)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code !== "Space") return;
            e.preventDefault();
            const mv = movableRef.current;
            if (!mv) return;
            let target: THREE.Vector3;
            if (enemiesRef.current.length > 0) {
                const closest = enemiesRef.current.reduce((best, en) => {
                    const d = Math.hypot(en.mesh.position.x - mv.mesh.position.x, en.mesh.position.z - mv.mesh.position.z);
                    const bd = Math.hypot(best.mesh.position.x - mv.mesh.position.x, best.mesh.position.z - mv.mesh.position.z);
                    return d < bd ? en : best;
                });
                target = closest.mesh.position.clone();
            } else {
                target = new THREE.Vector3(mv.mesh.position.x, 1, mv.mesh.position.z - 10);
            }
            fireProjectile(target);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [fireProjectile]);

    // Sync mana display every 200 ms
    useEffect(() => {
        const id = setInterval(() => {
            if (gameActiveRef.current) setGameMana(Math.round(manaRef.current));
        }, 200);
        return () => clearInterval(id);
    }, []);

    return {
        // state
        gameActive, gameOver, gameHp, gameMana, gameScore, bestScore,
        setGameOver,
        // actions
        startGame, fireProjectile, stopGame,
        // refs accessible from Home (for loadFace to write startCubeRef)
        startCubeRef,
        // frame tick (called from onFrame in Home)
        gameTick,
    };
}
