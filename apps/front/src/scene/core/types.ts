export type SceneType = "home" | "trilogique" | "ecogrid" | "lightshadow";

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface Scene {
  init(
    canvas: HTMLCanvasElement,
    onSwitchScene: (type: SceneType) => void
  ): void;
  clean(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(input: InputState): void;
}

export type InputState = Record<string, boolean>;
