import { Scene } from '../core/types';

const EcoGrid: Scene = {
	init(canvas: HTMLCanvasElement): void {},
	clean(canvas: HTMLCanvasElement): void {},
	update(deltaTime: number): void {},
	render(ctx: CanvasRenderingContext2D): void {},
	handleInput(input: Record<string, boolean>): void {},
};

export default EcoGrid;
