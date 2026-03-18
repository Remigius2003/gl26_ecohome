import { useCallback, useRef } from "react";
import * as THREE from "three";
import { ThreeEngineHandle, SceneObject } from "../engine/types";

const DUST_COUNT    = 9;
const DUST_LIFETIME = 700; // ms

interface DustParticle {
    id:   string;
    mesh: THREE.Mesh;
    born: number;
    vx:   number;
    vz:   number;
}

export function useDust(engineRef: React.MutableRefObject<ThreeEngineHandle | null>) {
    const dustRef = useRef<DustParticle[]>([]);

    const spawnDust = useCallback((pos: THREE.Vector3) => {
        const engine = engineRef.current;
        if (!engine) return;
        for (let i = 0; i < DUST_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3.5;
            const size  = 0.07 + Math.random() * 0.11;
            const id    = `dust-${performance.now().toFixed(0)}-${i}-${Math.random().toString(36).slice(2)}`;
            const geo   = new THREE.SphereGeometry(size, 4, 4);
            const mat   = new THREE.MeshBasicMaterial({ color: 0xc8b89a, transparent: true, opacity: 0.85 });
            const mesh  = new THREE.Mesh(geo, mat);
            mesh.position.set(
                pos.x + (Math.random() - 0.5) * 0.8,
                0.06 + Math.random() * 0.35,
                pos.z + (Math.random() - 0.5) * 0.8,
            );
            dustRef.current.push({ id, mesh, born: performance.now(), vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed });
            engine.addObject({ id, mesh } as SceneObject);
        }
    }, [engineRef]);

    const tickDust = useCallback(() => {
        const engine = engineRef.current;
        if (!engine || dustRef.current.length === 0) return;
        const now = performance.now();
        dustRef.current = dustRef.current.filter(p => {
            const age  = now - p.born;
            if (age > DUST_LIFETIME) { engine.removeObject(p.id); return false; }
            const frac = age / DUST_LIFETIME;
            const dt   = 1 / 60; // visual-only: approximate is fine
            (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - frac) * 0.85;
            p.mesh.position.x += p.vx * dt * (1 - frac * 0.8); // slow down over time
            p.mesh.position.z += p.vz * dt * (1 - frac * 0.8);
            p.mesh.position.y  = Math.max(0.02, p.mesh.position.y - dt * 1.6);
            return true;
        });
    }, [engineRef]);

    return { spawnDust, tickDust };
}
