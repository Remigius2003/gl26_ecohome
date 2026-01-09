import { checkAABB, computeMovementFractionAABB } from "../core/collision";
import {
  Entity,
  Solid,
  Dynamic,
  Interactable,
  EntityId,
  isSolid,
  isInteractable,
  IsDynamic,
} from "../core/types";

export class World {
  private entities = new Map<EntityId, Entity>();
  private renderables: Entity[] = [];
  private height: number = 0;
  private width: number = 0;

  interactibles: (Entity & Interactable)[] = [];
  dynamics: (Entity & Dynamic)[] = [];
  solids: (Entity & Solid)[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  addEntity(e: Entity) {
    this.entities.set(e.id, e);
    this.renderables.push(e);

    if (isSolid(e)) this.solids.push(e);
    if (isInteractable(e)) this.interactibles.push(e);
    if (IsDynamic(e)) this.dynamics.push(e);
  }

  removeEntity(id: EntityId) {
    const e = this.entities.get(id);
    if (!e) return;

    this.entities.delete(id);

    this.removeFromArray(this.renderables, e);
    if (isSolid(e)) this.removeFromArray(this.solids, e);
    if (isInteractable(e)) this.removeFromArray(this.interactibles, e);
    if (IsDynamic(e)) this.removeFromArray(this.dynamics, e);
  }

  private removeFromArray<T>(arr: T[], item: T) {
    const i = arr.indexOf(item);
    if (i === -1) return;

    const last = arr[arr.length - 1];
    arr[i] = last;
    arr.pop();
  }

  resolveMovement(
    ent: Entity,
    dx: number,
    dy: number
  ): { dx: number; dy: number } {
    if (ent.y + dy < 0 || ent.y + ent.height + dy > this.height) dy = 0;
    if (ent.x + dx < 0 || ent.x + ent.width + dx > this.width) dx = 0;
    if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };

    let ffx = 1,
      ffy = 1;

    console.log("start loop debug");
    for (const solid of this.solids) {
      if (solid === ent) continue;
      if (ffx === 0 && ffy === 0) break;
      const { fx, fy } = computeMovementFractionAABB(ent, solid, dx, dy);
      ffx = Math.min(ffx, fx);
      ffy = Math.min(ffy, fy);
    }

    return { dx: dx * ffx, dy: dy * ffy };
  }

  getInteraction(target: Entity): (Entity & Interactable) | null {
    for (const e of this.interactibles) if (checkAABB(target, e)) return e;
    return null;
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const e of this.renderables)
      e.text.draw(ctx, e.x, e.y, e.width, e.height);
  }
}
