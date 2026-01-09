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

  follow(target: Square, world: World) {
    this.x = target.x + target.width / 2 - this.width / 2;
    this.y = target.y + target.height / 2 - this.height / 2;

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
