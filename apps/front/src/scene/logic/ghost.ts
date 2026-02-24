import type { Controller, Dynamic, Entity } from "../core/types";
import { PhysicsSystem } from "./movement";
import type { World } from "./world";

export type DeviceLike = Entity & {
    isOn: boolean;
    watts: number;
    toggle: (force?: boolean) => void;
};
export class GhostController implements Controller<Entity & Dynamic> {
    private target: DeviceLike | null = null;
    private retargetT = 0;
    private interactT = 0;
    private sulkT = 0; // New: prevents camping the same spot
    private lastTargetId: string | null = null;

    constructor(
        public readonly entity: Entity & Dynamic,
        private readonly world: World,
        private readonly getDevices: () => DeviceLike[],
        private readonly opts: {
            retargetEveryMs?: number;
            arriveDist?: number;
            interactMs?: number;
            speed?: number;
        } = {},
    ) {
        if (this.opts.speed) this.entity.speed = this.opts.speed;
    }

    update(dt: number) {
        const retargetEveryMs = this.opts.retargetEveryMs ?? 900;
        const arriveDist = this.opts.arriveDist ?? 22;
        const interactMs = this.opts.interactMs ?? 700;

        this.retargetT -= dt;
        this.sulkT -= dt;

        // 1. Logic for switching targets
        // We retarget if: no target, target is already ON, or we are "sulking"
        if (
            this.target == null ||
            this.target.isOn ||
            this.retargetT <= 0 ||
            this.sulkT > 0
        ) {
            const prevTarget = this.target;
            this.target = this.pickSmartTarget();

            // If our target was just turned OFF while we were on it, start sulking
            if (prevTarget && !prevTarget.isOn && this.target !== prevTarget) {
                this.sulkT = 1500; // Don't come back to this area for 1.5s
            }

            this.retargetT = retargetEveryMs + Math.random() * 500; // Desync ghosts
            this.interactT = 0;
        }

        if (!this.target || this.sulkT > 0) {
            // Wander aimlessly or slow down if no target
            this.entity.vx *= 0.9;
            this.entity.vy *= 0.9;
            PhysicsSystem.move(this.entity, dt, this.world);
            return;
        }

        const ex = this.entity.x + this.entity.width / 2;
        const ey = this.entity.y + this.entity.height / 2;
        const tx = this.target.x + this.target.width / 2;
        const ty = this.target.y + this.target.height / 2;

        let dx = tx - ex;
        let dy = ty - ey;
        const dist = Math.hypot(dx, dy);

        // 2. Separation Force (Prevents Superposition)
        // Look at other ghosts and push away if too close
        for (const other of this.world.dynamics) {
            if (other === this.entity || !String(other.id).startsWith("ghost-"))
                continue;
            const sdx = other.x + other.width / 2 - ex;
            const sdy = other.y + other.height / 2 - ey;
            const sdist = Math.hypot(sdx, sdy);
            if (sdist < 40) {
                // Comfort zone
                dx -= (sdx / sdist) * 50;
                dy -= (sdy / sdist) * 50;
            }
        }

        if (dist > arriveDist) {
            const moveDist = Math.hypot(dx, dy);
            this.entity.vx = dx / (moveDist || 1);
            this.entity.vy = dy / (moveDist || 1);
            this.interactT = 0;
            PhysicsSystem.move(this.entity, dt, this.world);
            return;
        }

        // 3. Hacking logic
        this.interactT += dt;
        if (this.interactT >= interactMs) {
            this.target.toggle(true);
            this.interactT = 0;
            this.retargetT = 0;
        }
    }

    private pickSmartTarget(): DeviceLike | null {
        const devs = this.getDevices().filter((d) => !d.isOn);
        if (!devs.length) return null;

        const ex = this.entity.x + this.entity.width / 2;
        const ey = this.entity.y + this.entity.height / 2;

        const weightedDevs = devs.map((d) => {
            const dx = d.x + d.width / 2 - ex;
            const dy = d.y + d.height / 2 - ey;
            const dist = Math.hypot(dx, dy);
            const chaos = Math.random() * 200;
            return { device: d, score: dist + chaos };
        });

        weightedDevs.sort((a, b) => a.score - b.score);

        return weightedDevs[0].device;
    }
}
