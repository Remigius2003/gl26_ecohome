import { Frame } from "@api/SkinParser";
import { Group, Texture } from "./types";

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
    private img: HTMLImageElement;
    private loaded = false;

    private symX = false;
    private symY = false;

    constructor(src: string) {
        this.img = new Image();
        this.img.src = src;
        this.img.onload = () => (this.loaded = true);
    }

    setSymX(value: boolean) {
        this.symX = value;
    }

    setSymY(value: boolean) {
        this.symY = value;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        if (!this.loaded) return;

        ctx.save();
        ctx.translate(x + (this.symX ? w : 0), y + (this.symY ? h : 0));

        ctx.scale(this.symX ? -1 : 1, this.symY ? -1 : 1);

        ctx.drawImage(this.img, 0, 0, w, h);
        ctx.restore();
    }
}

export class Sprite implements Texture {
    private imgs: HTMLImageElement[] = [];
    private loaded = false;

    private index = 0;
    private counter = 0;
    private ratio = 15;

    private symX = false;
    private symY = false;

    constructor(srcOrFrames: string | Frame[], additional?: string[]) {
        const sources: string[] = [];

        if (Array.isArray(srcOrFrames) && srcOrFrames[0] instanceof Frame) {
            sources.push(...srcOrFrames.map((f) => f.image));
        } else if (typeof srcOrFrames === "string") {
            sources.push(srcOrFrames);
            if (additional) sources.push(...additional);
        } else {
            throw new Error("Invalid SwapTexture constructor parameters");
        }

        let loadedCount = 0;
        for (const s of sources) {
            const img = new Image();
            img.src = s;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === sources.length) this.loaded = true;
            };
            this.imgs.push(img);
        }
    }

    setTexture(index: number) {
        if (index < 0 || index >= this.imgs.length) return;
        this.index = index;
    }

    nextTexture() {
        if (!this.loaded) return;

        this.counter++;
        if (this.counter >= this.ratio) {
            this.index = (this.index + 1) % this.imgs.length;
            this.counter = 0;
        }
    }

    setSymX(value: boolean) {
        this.symX = value;
    }

    setSymY(value: boolean) {
        this.symY = value;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        if (!this.loaded) return;
        const img = this.imgs[this.index];

        ctx.save();
        ctx.translate(x + (this.symX ? w : 0), y + (this.symY ? h : 0));

        ctx.scale(this.symX ? -1 : 1, this.symY ? -1 : 1);

        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
    }
}

export class TransparentTexture implements Texture {
    draw() {}
}

export class TiledTexture implements Texture {
    private img: HTMLImageElement;
    private loaded = false;
    private pattern: CanvasPattern | null = null;

    constructor(
        src: string,
        public offsetX: number = 0,
        public offsetY: number = 0,
        public scale: number = 1,
    ) {
        this.img = new Image();
        this.img.src = src;
        this.img.onload = () => (this.loaded = true);
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        if (!this.loaded) return;
        if (!this.pattern) {
            this.pattern = ctx.createPattern(this.img, "repeat");
            if (!this.pattern) return;
        }

        ctx.save();

        const matrix = new DOMMatrix()
            .translate(x + this.offsetX, y + this.offsetY)
            .scale(this.scale);

        this.pattern.setTransform(matrix);
        ctx.fillStyle = this.pattern;
        ctx.fillRect(x, y, w, h);

        ctx.restore();
    }
}

export class GroupTexture implements Texture {
    constructor(private grp: Group) {}

    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        const sorted = [...this.grp.getChildrens()].sort(
            (a, b) => a.priority - b.priority,
        );

        for (const child of sorted)
            child.text.draw(
                ctx,
                x + child.x,
                y + child.y,
                child.width,
                child.height,
            );
    }
}
