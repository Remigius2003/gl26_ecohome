import {
	Dynamic,
	DynamicTag,
	Entity,
	Interactable,
	InteractableTag,
	Solid,
	SolidTag,
} from '../core/types';

export type PartialDynamic = Partial<Dynamic>;
export type PartialInteractable = Pick<Interactable, 'onInteract'>;
export type PartialEntity = Partial<Entity> & Pick<Entity, 'id' | 'text'>;
export type PartialCharacter = PartialEntity & PartialDynamic & Partial<Solid>;

export function createEntity(init: PartialEntity): Entity {
	return {
		id: init.id,
		x: init.x ?? 0,
		y: init.y ?? 0,
		width: init.width ?? 32,
		height: init.height ?? 32,
		priority: init.priority ?? 0,
		text: init.text,
	};
}

export function withDynamic<T extends Entity>(
	entity: T,
	init: PartialDynamic = {},
): T & Dynamic {
	const e = entity as any;
	e.vx = init.vx ?? 0;
	e.vy = init.vy ?? 0;
	e.speed = init.speed ?? 100;
	e[DynamicTag] = true;
	return e;
}

export function withSolid<T extends Entity>(entity: T): T & Solid {
	const e = entity as any;
	e[SolidTag] = true;
	return e as T & Solid;
}

export function withInteractable<T extends Entity>(
	entity: T,
	init: PartialInteractable,
): T & Interactable {
	const e = entity as any;
	e.onInteract = init.onInteract;
	e[InteractableTag] = true;
	return e as T & Interactable;
}

export function createCharacter(
	init: PartialCharacter,
): Entity & Dynamic & Solid {
	let entity = createEntity({
		...init,
		priority: 2,
	});

	withSolid(entity);
	withDynamic(entity, init);

	return entity as Entity & Dynamic & Solid;
}

export function createSolid(
	init: PartialEntity & PartialDynamic,
): Entity & Solid {
	let entity = createEntity({
		...init,
		priority: 1,
	});

	withSolid(entity);
	return entity as Entity & Solid;
}

// Deep background (parallax, skybox, far scenery)
export function createDeepBackground(init: PartialEntity): Entity {
	return createEntity({
		...init,
		priority: 0,
	});
}

// Foreground decoration (trees, fog, overlays)
export function createForeground(init: PartialEntity): Entity {
	return createEntity({
		...init,
		priority: 4,
	});
}
