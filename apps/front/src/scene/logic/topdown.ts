import { InputState } from "../core/types";

export class TopDownMovement {
  speed: number = 200;
  x: number;
  y: number;

  constructor(initialX: number, initialY: number) {
    this.x = initialX;
    this.y = initialY;
  }

  update(dt: number, input: InputState) {
    const seconds = dt / 1000;

    let dx = 0;
    let dy = 0;

    if (input["arrowup"] || input["w"]) dy -= 1;
    if (input["arrowdown"] || input["s"]) dy += 1;
    if (input["arrowleft"] || input["a"]) dx -= 1;
    if (input["arrowright"] || input["d"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    this.x += dx * this.speed * seconds;
    this.y += dy * this.speed * seconds;
  }
}
