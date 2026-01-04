export class TopDown {
	constructor(
		private position: { x: number; y: number },
		private speed: number = 200
	) {}

	update(deltaTime: number, input: Record<string, boolean>) {
		const moveSpeed = this.speed * (deltaTime / 1000);

		if (input['ArrowUp'] || input['w']) this.position.y -= moveSpeed;
		if (input['ArrowDown'] || input['s']) this.position.y += moveSpeed;
		if (input['ArrowLeft'] || input['a']) this.position.x -= moveSpeed;
		if (input['ArrowRight'] || input['d']) this.position.x += moveSpeed;
	}
}
