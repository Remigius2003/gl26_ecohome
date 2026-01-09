import { Texture } from "./types";

export class ColorTexture implements Texture {
  constructor(
    public color: string,
    public stroke?: string
  ) {}
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, w, h);
    if (this.stroke) {
      ctx.strokeStyle = this.stroke;
      ctx.strokeRect(x, y, w, h);
    }
  }
}

export class ImageTexture implements Texture {
  private img: HTMLImageElement;
  private loaded = false;

  constructor(src: string) {
    this.img = new Image();
    this.img.src = src;
    this.img.onload = () => (this.loaded = true);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (this.loaded) {
      ctx.drawImage(this.img, x, y, w, h);
    } else {
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y, w, h);
    }
  }
}
