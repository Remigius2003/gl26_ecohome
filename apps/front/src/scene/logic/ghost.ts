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

  constructor(
    public readonly entity: Entity & Dynamic,
    private readonly world: World,
    private readonly getDevices: () => DeviceLike[],
    private readonly opts: {
      retargetEveryMs?: number;
      arriveDist?: number;
      interactMs?: number;
      speed?: number;
    } = {}
  ) {
    if (this.opts.speed) this.entity.speed = this.opts.speed;
  }

  update(dt: number) {
    const retargetEveryMs = this.opts.retargetEveryMs ?? 900;
    const arriveDist = this.opts.arriveDist ?? 22;
    const interactMs = this.opts.interactMs ?? 700;

    this.retargetT -= dt;

    if (
      this.target == null ||
      this.target.isOn ||
      this.retargetT <= 0
    ) {
      this.target = this.pickNearestOff();
      this.retargetT = retargetEveryMs;
      this.interactT = 0;
    }

    if (!this.target) return;

    const ex = this.entity.x + this.entity.width / 2;
    const ey = this.entity.y + this.entity.height / 2;
    const tx = this.target.x + this.target.width / 2;
    const ty = this.target.y + this.target.height / 2;

    const dx = tx - ex;
    const dy = ty - ey;
    const dist = Math.hypot(dx, dy);

    if (dist > arriveDist) {
      this.entity.vx = dx / (dist || 1);
      this.entity.vy = dy / (dist || 1);
      this.interactT = 0;
      PhysicsSystem.move(this.entity, dt, this.world);
      return;
    }

    // "hack" the device (turn ON after a small time)
    this.interactT += dt;
    if (this.interactT >= interactMs) {
      this.target.toggle(true); // force ON
      this.interactT = 0;
      this.retargetT = 0; // retarget quickly
    }
  }

  private pickNearestOff(): DeviceLike | null {
    const devs = this.getDevices().filter(d => !d.isOn);
    if (!devs.length) return null;

    let best: DeviceLike | null = null;
    let bestD = Infinity;

    const ex = this.entity.x + this.entity.width / 2;
    const ey = this.entity.y + this.entity.height / 2;

    for (const d of devs) {
      const dx = (d.x + d.width / 2) - ex;
      const dy = (d.y + d.height / 2) - ey;
      const dist = Math.hypot(dx, dy);
      if (dist < bestD) {
        bestD = dist;
        best = d;
      }
    }
    return best;
  }
}
export { GhostController as GhostControllerNamed };
