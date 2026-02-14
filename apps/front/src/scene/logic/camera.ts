import { Square } from "../core/types";
import { World } from "./world";

export class Camera {
  private x: number = 0;
  private y: number = 0;

  constructor(
    private width: number,
    private height: number,
    private scale: number = 1,
    private deadZone: number = 0.2,
  ) {}

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  setScale(scale: number) {
    this.scale = Math.max(0.05, scale);
  }

  follow(target: Square, world: World) {
    const viewWidth = this.width / this.scale;
    const viewHeight = this.height / this.scale;

    const tarX = target.x + target.width / 2;
    const tarY = target.y + target.height / 2;

    const deadZoneWidth = viewWidth * this.deadZone;
    const deadZoneHeight = viewHeight * this.deadZone;

    const deadZoneLeft = this.x + (viewWidth - deadZoneWidth) / 2;
    const deadZoneRight = deadZoneLeft + deadZoneWidth;
    const deadZoneTop = this.y + (viewHeight - deadZoneHeight) / 2;
    const deadZoneBottom = deadZoneTop + deadZoneHeight;

    if (tarX < deadZoneLeft) this.x -= deadZoneLeft - tarX;
    if (tarX > deadZoneRight) this.x += tarX - deadZoneRight;
    if (tarY < deadZoneTop) this.y -= deadZoneTop - tarY;
    if (tarY > deadZoneBottom) this.y += tarY - deadZoneBottom;

    const { width, height } = world.getSize();
    this.x = Math.max(0, Math.min(this.x, width - viewWidth));
    this.y = Math.max(0, Math.min(this.y, height - viewHeight));
  }

  screenToWorld(screenX: number, screenY: number) {
    return {
      x: screenX / this.scale + this.x,
      y: screenY / this.scale + this.y,
    };
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.scale(this.scale, this.scale);
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  release(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }
}
