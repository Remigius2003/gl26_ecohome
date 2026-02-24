import type { Controller, Dynamic, Entity } from "../core/types";
import { PhysicsSystem } from "./movement";
import type { World } from "./world";

export type DeviceLike = Entity & {
    isOn: boolean;
    watts: number;
    toggle: (force?: boolean) => void;
};
export class GhostController implements Controller<Entity & Dynamic> {
    private _target: DeviceLike | null = null;
    private retargetT = 0;
    private interactT = 0;
    private sulkT = 0; // Prevents camping the same spot
    private lastTargetId: string | null = null;
    private wanderAngle = Math.random() * Math.PI * 2; // For smooth wandering

    constructor(
        public readonly entity: Entity & Dynamic,
        private readonly world: World,
        private readonly getDevices: () => DeviceLike[],
        private readonly getOtherGhosts: () => GhostController[] = () => [],
        private readonly opts: {
            retargetEveryMs?: number;
            arriveDist?: number;
            interactMs?: number;
            speed?: number;
            wanderSpeed?: number;
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
            this._target == null ||
            this._target.isOn ||
            this.retargetT <= 0 ||
            this.sulkT > 0
        ) {
            const prevTarget = this._target;
            this._target = this.pickSmartTarget();

            // If our target was just turned OFF while we were on it, start sulking
            if (prevTarget && !prevTarget.isOn && this._target !== prevTarget) {
                this.sulkT = 1500; // Don't come back to this area for 1.5s
            }

            this.retargetT = retargetEveryMs + Math.random() * 500; // Desync ghosts
            this.interactT = 0;
        }

        if (!this._target || this.sulkT > 0) {
            // Wander aimlessly with smooth steering
            const wanderSpeed = this.opts.wanderSpeed ?? 0.8;
            this.wanderAngle += (Math.random() - 0.5) * 0.3; // Smooth random steering
            this.entity.vx = Math.cos(this.wanderAngle) * wanderSpeed;
            this.entity.vy = Math.sin(this.wanderAngle) * wanderSpeed;
            PhysicsSystem.move(this.entity, dt, this.world);
            return;
        }

        const ex = this.entity.x + this.entity.width / 2;
        const ey = this.entity.y + this.entity.height / 2;
        const tx = this._target.x + this._target.width / 2;
        const ty = this._target.y + this._target.height / 2;

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
            this._target.toggle(true);
            this.interactT = 0;
            this.retargetT = 0;
        }
    }

    get target(): DeviceLike | null {
        return this._target;
    }

    private pickSmartTarget(): DeviceLike | null {
        const devs = this.getDevices().filter((d) => !d.isOn);
        if (!devs.length) return null;

        const ex = this.entity.x + this.entity.width / 2;
        const ey = this.entity.y + this.entity.height / 2;

        // Get what other ghosts are targeting
        const otherTargets = new Set<DeviceLike>();
        for (const ghost of this.getOtherGhosts()) {
            if (ghost !== this && ghost.target) {
                otherTargets.add(ghost.target);
            }
        }

        const weightedDevs = devs.map((d) => {
            const dx = d.x + d.width / 2 - ex;
            const dy = d.y + d.height / 2 - ey;
            const dist = Math.hypot(dx, dy);
            const chaos = Math.random() * 200;

            // Heavily penalize targets other ghosts are already pursuing
            const targetConflict = otherTargets.has(d) ? 5000 : 0;

            return { device: d, score: dist + chaos + targetConflict };
        });

        weightedDevs.sort((a, b) => a.score - b.score);

        return weightedDevs[0].device;
    }
}
