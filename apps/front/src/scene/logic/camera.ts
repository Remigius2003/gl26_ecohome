import { Square } from "../core/types";
import { World } from "./world";

export class Camera {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  follow(target: Square, world: World) {
    const tarX = target.x + target.width / 2;
    const tarY = target.y + target.height / 2;

    const deadZonePerc = 0.2; // 60% deadZone
    const deadZoneTop = this.y + (this.height - this.height * deadZonePerc) / 2;
    const deadZoneLeft = this.x + (this.width - this.width * deadZonePerc) / 2;
    const deadZoneRight = deadZoneLeft + this.width * deadZonePerc;
    const deadZoneBottom = deadZoneTop + this.height * deadZonePerc;

    if (tarX < deadZoneLeft) this.x -= deadZoneLeft - tarX;
    if (tarX > deadZoneRight) this.x += tarX - deadZoneRight;
    if (tarY < deadZoneTop) this.y -= deadZoneTop - tarY;
    if (tarY > deadZoneBottom) this.y += tarY - deadZoneBottom;

    const { width, height } = world.getSize();
    this.x = Math.max(0, Math.min(this.x, width - this.width));
    this.y = Math.max(0, Math.min(this.y, height - this.height));
  }

  screenToWorld(screenX: number, screenY: number) {
    return { x: screenX + this.x, y: screenY + this.y };
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  release(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }
}
