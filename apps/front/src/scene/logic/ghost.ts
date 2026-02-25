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
    private wanderAngle = Math.random() * Math.PI * 2;

    // Cooldown per device id after lighting it — prevents the ghost from
    // immediately re-toggling the same device on the next frame before the
    // state has a chance to propagate, while still allowing re-lighting after
    // the player turns it back off and the cooldown expires.
    private recentlyLit = new Map<string | number, number>(); // id → remaining ms
    private readonly recentlyLitMs = 3000;

    // Store as a plain field to avoid "not a function" when called later
    private readonly _getOtherGhosts: () => GhostController[];

    constructor(
        public readonly entity: Entity & Dynamic,
        private readonly world: World,
        private readonly getDevices: () => DeviceLike[],
        getOtherGhosts?: () => GhostController[],
        private readonly opts: {
            retargetEveryMs?: number;
            arriveDist?: number;
            interactMs?: number;
            speed?: number;
            wanderSpeed?: number;
        } = {},
    ) {
        // Defensive: always store a safe callable, never undefined/null
        this._getOtherGhosts =
            typeof getOtherGhosts === "function" ? getOtherGhosts : () => [];

        // Stagger initial retarget so ghosts spawned in the same frame
        // don't all evaluate targets simultaneously and pick the same one.
        this.retargetT = Math.random() * 500;

        if (this.opts.speed) this.entity.speed = this.opts.speed;
    }

    update(dt: number) {
        const retargetEveryMs = this.opts.retargetEveryMs ?? 900;
        const arriveDist = this.opts.arriveDist ?? 22;
        const interactMs = this.opts.interactMs ?? 700;

        this.retargetT -= dt;

        // Tick down per-device cooldowns so they become re-lightable over time
        for (const [id, remaining] of this.recentlyLit) {
            const next = remaining - dt;
            if (next <= 0) {
                this.recentlyLit.delete(id);
            } else {
                this.recentlyLit.set(id, next);
            }
        }

        // Retarget when:
        // - No target yet AND the stagger timer has elapsed (prevents same-frame pile-on)
        // - Current target just got lit (move on immediately)
        // - Periodic timer expired (re-evaluate periodically)
        const shouldRetarget =
            (this._target == null && this.retargetT <= 0) ||
            (this._target != null && this._target.isOn) ||
            this.retargetT <= 0;

        if (shouldRetarget) {
            this._target = this.pickSmartTarget();
            this.retargetT = retargetEveryMs + Math.random() * 500;
            this.interactT = 0;
        }

        if (!this._target) {
            // No available unlit devices — wander smoothly until one appears
            const baseSpeed = this.entity.speed ?? 220;
            const wanderSpeed = this.opts.wanderSpeed ?? baseSpeed * 0.4;
            this.wanderAngle += (Math.random() - 0.5) * 0.3;
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

        // Separation Force — push away from overlapping ghosts
        for (const other of this.world.dynamics) {
            if (other === this.entity || !String(other.id).startsWith("ghost-"))
                continue;
            const sdx = other.x + other.width / 2 - ex;
            const sdy = other.y + other.height / 2 - ey;
            const sdist = Math.hypot(sdx, sdy);
            if (sdist < 40 && sdist > 0) {
                dx -= (sdx / sdist) * 50;
                dy -= (sdy / sdist) * 50;
            }
        }

        if (dist > arriveDist) {
            const moveDist = Math.hypot(dx, dy);
            this.entity.vx = dx / (moveDist || 1);
            this.entity.vy = dy / (moveDist || 1);
            // Do NOT reset interactT here — separation force can nudge the ghost
            // just past arriveDist on every frame, which would reset the timer
            // forever and prevent toggle() from ever being reached.
            PhysicsSystem.move(this.entity, dt, this.world);
            return;
        }

        // Ghost is close enough — accumulate interact timer and light the device
        this.interactT += dt;
        if (this.interactT >= interactMs) {
            this._target.toggle(true); // force ON

            // Start a cooldown on this device so the ghost doesn't immediately
            // re-pick it on the very next frame. Once the cooldown expires the
            // device is fully eligible again (so the player turning it back off
            // will eventually attract the ghost back to it).
            this.recentlyLit.set(this._target.id, this.recentlyLitMs);

            this.interactT = 0;
            // Short delay before hunting the next target — gives state time to
            // propagate and prevents both ghosts landing on the same new target
            // in the same frame.
            this.retargetT = 200 + Math.random() * 300;
        }
    }

    get target(): DeviceLike | null {
        return this._target;
    }

    private pickSmartTarget(): DeviceLike | null {
        // Eligible = currently OFF and not in this ghost's own recentlyLit cooldown
        const devs = this.getDevices().filter(
            (d) => !d.isOn && !this.recentlyLit.has(d.id),
        );

        // If all devices are either ON or on cooldown, fall back to any OFF device
        // so the ghost never gets permanently stuck ignoring available targets.
        const candidates =
            devs.length > 0
                ? devs
                : this.getDevices().filter((d) => !d.isOn);

        if (!candidates.length) return null;

        const ex = this.entity.x + this.entity.width / 2;
        const ey = this.entity.y + this.entity.height / 2;

        // Collect the IDs of devices other ghosts are already pursuing.
        // Using ID comparison instead of object reference avoids stale-reference
        // mismatches when targets were assigned in a previous frame.
        const claimedIds = new Set<string | number>();
        for (const ghost of this._getOtherGhosts()) {
            if (ghost !== this && ghost.target) {
                claimedIds.add(ghost.target.id);
            }
        }

        const scored = candidates.map((d) => {
            const dx = d.x + d.width / 2 - ex;
            const dy = d.y + d.height / 2 - ey;
            const dist = Math.hypot(dx, dy);
            const chaos = Math.random() * 200;

            // Apply conflict penalty only when there is a real alternative.
            // If the device is the sole option, ignore the penalty so the ghost
            // doesn't get stuck refusing to target anything.
            const hasAlternative = candidates.length > 1;
            const conflict = hasAlternative && claimedIds.has(d.id) ? 3000 : 0;

            return { device: d, score: dist + chaos + conflict };
        });

        scored.sort((a, b) => a.score - b.score);
        return scored[0].device;
    }
}
