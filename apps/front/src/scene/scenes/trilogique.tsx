import { Scene } from '../core/types';

const TriLogique: Scene = {
	init(canvas: HTMLCanvasElement): void {},
	clean(): void {},
	update(deltaTime: number): void {},
	render(ctx: CanvasRenderingContext2D): void {},
	handleInput(input: Record<string, boolean>): void {},
};

export default TriLogique;
