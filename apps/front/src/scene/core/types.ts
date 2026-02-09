import { GroupTexture } from './texture';

export type SceneType =
	| 'home'
	| 'home2'
	| 'trilogique'
	| 'ecogrid'
	| 'lightshadow';
export type EntityId = string;

export interface Texture {
	draw(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
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
	/**
	 * Render priority:
	 * 0 - Deep background
	 * 1 - Background
	 * 2 - Ground
	 * 3 - Foreground
	 * 4 - Deep foreground
	 **/
	priority: number;
}
export const GroupTag = Symbol('Group');
export const SolidTag = Symbol('Solid');
export const InteractableTag = Symbol('Interactable');
export const DynamicTag = Symbol('Dynamic');

export interface Group extends Entity {
	readonly [GroupTag]: true;
	childrens: Entity[];

	add(e: Entity): void;
	remove(id: EntityId): void;
	getChild(id: EntityId): Entity | undefined;
	getChildrens(): Entity[];
}

export interface Solid {
	readonly [SolidTag]: true;
}

export interface Interactable {
	readonly [InteractableTag]: true;
	onInteract: () => void;
}

export interface Dynamic {
	readonly [DynamicTag]: true;
	speed: number;
	vx: number;
	vy: number;
}

export type Character = Entity & Dynamic & Solid;

export function isGroup(e: Entity): e is Group {
	return GroupTag in e;
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

export interface Controller<T extends Entity = Entity> {
	readonly entity: T;
	update(dt: number, input?: InputState): void;
}

export interface Scene {
	init(
		canvas: HTMLCanvasElement,
		onSwitchScene: (type: SceneType) => void,
	): void;
	clean(): void;
	update(deltaTime: number): void;
	render(ctx: CanvasRenderingContext2D): void;
	handleInput(input: InputState): void;
	resizeScene(w: number, h: number): void;
}

export type InputState = Record<string, boolean>;
