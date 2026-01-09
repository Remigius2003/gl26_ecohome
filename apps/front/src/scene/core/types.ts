export type SceneType = "home" | "trilogique" | "ecogrid" | "lightshadow";

export type EntityId = string;

export interface Texture {
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void;
}

export interface Square {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity extends Square {
  id: EntityId;
  text: Texture;
}

export const SolidTag = Symbol("Solid");
export const InteractableTag = Symbol("Interactable");
export const DynamicTag = Symbol("Dynamic");

export interface Solid {
  [SolidTag]: true;
}

export interface Interactable {
  [InteractableTag]: true;
  onInteract: () => void;
}

export interface Dynamic {
  [DynamicTag]: true;
  speed: number;
  vx: number;
  vy: number;
}

export function isSolid(e: Entity): e is Entity & Solid {
  return SolidTag in e;
}

export function isInteractable(e: Entity): e is Entity & Interactable {
  return InteractableTag in e;
}

export function IsDynamic(e: Entity): e is Entity & Dynamic {
  return DynamicTag in e;
}

export type Player = Entity & Dynamic & Solid;

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
