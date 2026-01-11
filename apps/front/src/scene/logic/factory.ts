import {
	Dynamic,
	DynamicTag,
	Entity,
	Interactable,
	InteractableTag,
	Solid,
	SolidTag,
} from '../core/types';

export type PartialEntity = Partial<Entity> & Pick<Entity, 'id' | 'text'>;
export type PartialInteractable = Pick<Interactable, 'onInteract'>;

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

export function withDynamic(
	entity: Entity,
	init: Partial<Dynamic> = {}
): Entity & Dynamic {
	return {
		...entity,
		vx: init.vx ?? 0,
		vy: init.vy ?? 0,
		speed: init.speed ?? 100,
		[DynamicTag]: true,
	};
}

export function withSolid(entity: Entity): Entity & Solid {
	return {
		...entity,
		[SolidTag]: true,
	};
}

export function withInteractable(
	entity: Entity,
	init: PartialInteractable
): Entity & Interactable {
	return {
		...entity,
		onInteract: init.onInteract,
		[InteractableTag]: true,
	};
}
