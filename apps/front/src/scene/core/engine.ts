import { Scene, SceneType } from './types';

export class Engine {
	private scenes: Record<SceneType, Scene> = {} as any;
	private inputState: Record<string, boolean> = {};
	private currentScene: SceneType = 'home';
	private lastTime = 0;

	constructor(private canvas: HTMLCanvasElement) {
		this.setupInputListeners();
	}

	registerScene(type: SceneType, scene: Scene) {
		this.scenes[type] = scene;
		if (Object.keys(this.scenes).length === 1) {
			this.setScene(type);
		}
	}

	setScene(type: SceneType) {
		this.currentScene = type;
		this.scenes[type].init(this.canvas);
	}

	private setupInputListeners() {
		window.addEventListener('keydown', (e) => {
			this.inputState[e.key] = true;
		});
		window.addEventListener('keyup', (e) => {
			this.inputState[e.key] = false;
		});
	}

	start() {
		this.gameLoop(0);
	}

	clean() {
		this.scenes[this.currentScene]?.clean(this.canvas);
	}

	private gameLoop(timestamp: number) {
		const ctx = this.canvas.getContext('2d')!;
		const deltaTime = timestamp - this.lastTime;
		this.lastTime = timestamp;

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.scenes[this.currentScene].handleInput(this.inputState);
		this.scenes[this.currentScene].update(deltaTime);
		this.scenes[this.currentScene].render(ctx);

		requestAnimationFrame(this.gameLoop.bind(this));
	}
}
