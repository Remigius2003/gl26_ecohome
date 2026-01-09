import { Scene, SceneType } from "./types";
import { InputHandler } from "./input";

export class Engine {
  private scenes: Partial<Record<SceneType, Scene>> = {};
  private currentSceneType: SceneType = "home";
  private inputHandler: InputHandler;
  private canvas: HTMLCanvasElement;
  private isRunning = false;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputHandler = new InputHandler();
  }

  updateCanvas(newCanvas: HTMLCanvasElement) {
    this.canvas = newCanvas;
    if (this.scenes[this.currentSceneType]) {
      this.scenes[this.currentSceneType]!.init(this.canvas, (t) =>
        this.setScene(t)
      );
    }
  }

  registerScene(type: SceneType, scene: Scene) {
    this.scenes[type] = scene;
  }

  setScene(type: SceneType) {
    if (!this.scenes[type]) return;

    if (this.scenes[this.currentSceneType])
      this.scenes[this.currentSceneType]!.clean();

    this.currentSceneType = type;
    this.scenes[type]!.init(this.canvas, (newType) => this.setScene(newType));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    if (this.scenes[this.currentSceneType])
      this.scenes[this.currentSceneType]!.init(this.canvas, (t) =>
        this.setScene(t)
      );

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  clean() {
    this.isRunning = false;
    this.scenes[this.currentSceneType]?.clean();
    this.inputHandler.clean();
  }

  private gameLoop(timestamp: number) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    const ctx = this.canvas.getContext("2d")!;
    const inputState = this.inputHandler.getState();

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const activeScene = this.scenes[this.currentSceneType];
    if (activeScene) {
      activeScene.handleInput(inputState);
      activeScene.update(deltaTime);
      activeScene.render(ctx);
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
