export interface Object {
	x: number;
	y: number;
	width?: number;
	height?: number;
	render(ctx: CanvasRenderingContext2D): void;
}

export interface Scene {
	init(canvas: HTMLCanvasElement): void;
	clean(): void;
	update(deltaTime: number): void;
	render(ctx: CanvasRenderingContext2D): void;
	handleInput(input: Record<string, boolean>): void;
}

export type SceneType = 'home' | 'trilogique' | 'ecogrid' | 'lightshadow';
