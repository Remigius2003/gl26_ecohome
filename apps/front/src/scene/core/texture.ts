import { Console, log } from "console";
import { Texture } from "./types";

export class ColorTexture implements Texture {
    constructor(
        public color: string,
        public stroke?: string,
    ) {}
    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
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
    private imgs: HTMLImageElement[];
    private loaded = false;
    private index = 2;
    private sym = false;
    private ratio = 15;
    private counter = 0;

    constructor(src: string, additionnal?: string[]) {
        this.imgs = [new Image()];
        this.imgs[0].src = src;
        this.imgs[0].onload = () => (this.loaded = true);

        if (additionnal) {
            for (let i = 0; i < additionnal.length; i++) {
                const img = new Image();
                img.src = additionnal[i];
                img.onload = () => {
                    if (this.imgs.every((img) => img.complete)) {
                        this.loaded = true;
                    }
                };
                this.imgs.push(img);
            }
        }
    }

    setTexture(index: number) {
        if (index >= this.imgs.length) {
            console.log("now?");
        } else {
            this.index = index;
        }
    }
    nextTexture() {
        this.counter += 1;
        if (this.ratio < this.counter) {
            this.index = (this.index + 1) % this.imgs.length;
            this.counter = 0;
        }
    }

    setSymetrie(True: boolean) {
        this.sym = True;
    }
    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        if (!this.loaded) {
            ctx.fillStyle = "#333";
            ctx.fillRect(x, y, w, h);
            return;
        }
        const img =
            this.imgs.length === 1 ? this.imgs[0] : this.imgs[this.index];

        if (!this.sym) {
            ctx.drawImage(img, x, y, w, h);
            return;
        }

        ctx.save();
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
    }
}
