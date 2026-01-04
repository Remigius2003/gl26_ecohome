export class InputHandler {
	private keys: Record<string, boolean> = {};

	constructor() {
		window.addEventListener('keydown', (e) => {
			this.keys[e.key] = true;
		});
		window.addEventListener('keyup', (e) => {
			this.keys[e.key] = false;
		});
	}

	isKeyPressed(key: string): boolean {
		return this.keys[key] || false;
	}

	reset() {
		this.keys = {};
	}
}
