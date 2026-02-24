import { Frame } from '@api/SkinParser';
import { Group, Texture } from './types';

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
	setSymX(v: boolean) {
		this.symX = v;
	}
	setSymY(v: boolean) {
		this.symY = v;
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

interface SpriteData {
	img: HTMLImageElement;
	offsetX: number;
	offsetY: number;
	ratio: number;
}

export class Sprite {
	private frames: SpriteData[] = [];
	private loaded = false;
	private index = 0;
	private counter = 0;
	private symX = false;
	private symY = false;

	constructor(srcOrFrames: string | string[] | Frame[], additional?: string[]) {
		const inputFrames: Frame[] = [];
		if (typeof srcOrFrames === 'string') {
			inputFrames.push(new Frame(srcOrFrames));
			if (additional) additional.forEach((s) => inputFrames.push(new Frame(s)));
		} else {
			for (const item of srcOrFrames as any[]) {
				if (typeof item === 'string') inputFrames.push(new Frame(item));
				else if (item instanceof Frame) inputFrames.push(item);
			}
		}
		this._load(inputFrames);
	}

	private _load(inputFrames: Frame[]) {
		this.frames = [];
		this.loaded = false;
		this.index = 0;
		this.counter = 0;
		let n = 0;
		for (const f of inputFrames) {
			const img = new Image();
			img.src = f.image;
			img.onload = () => {
				n++;
				if (n === inputFrames.length) this.loaded = true;
			};
			this.frames.push({
				img,
				offsetX: f.offsetX,
				offsetY: f.offsetY,
				ratio: f.ratio,
			});
		}
	}

	setTexture(index: number) {
		if (index >= 0 && index < this.frames.length) {
			this.index = index;
			this.counter = 0;
		}
	}
	nextTexture() {
		if (!this.loaded || this.frames.length <= 1) return;
		this.counter++;
		if (this.counter >= this.frames[this.index].ratio) {
			this.index = (this.index + 1) % this.frames.length;
			this.counter = 0;
		}
	}
	setSymX(v: boolean) {
		this.symX = v;
	}
	setSymY(v: boolean) {
		this.symY = v;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
	) {
		if (!this.loaded || !this.frames.length) return;
		const f = this.frames[this.index];
		ctx.save();
		ctx.translate(
			x + f.offsetX + (this.symX ? w : 0),
			y + f.offsetY + (this.symY ? h : 0),
		);
		ctx.scale(this.symX ? -1 : 1, this.symY ? -1 : 1);
		ctx.drawImage(f.img, 0, 0, w, h);
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
		public offsetX = 0,
		public offsetY = 0,
		public scale = 1,
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
			this.pattern = ctx.createPattern(this.img, 'repeat');
			if (!this.pattern) return;
		}
		ctx.save();
		this.pattern.setTransform(
			new DOMMatrix()
				.translate(x + this.offsetX, y + this.offsetY)
				.scale(this.scale),
		);
		ctx.fillStyle = this.pattern;
		ctx.fillRect(x, y, w, h);
		ctx.restore();
	}
}

export class GroupTexture implements Texture {
	constructor(private grp: Group) {}
	draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const sorted = [...this.grp.getChildrens()].sort(
			(a, b) => a.priority - b.priority,
		);
		for (const child of sorted)
			child.text.draw(ctx, x + child.x, y + child.y, child.width, child.height);
	}
}
