import { checkAABB, computeMovementAABB } from '../core/collision';
import {
	Entity,
	Solid,
	Dynamic,
	Interactable,
	EntityId,
	isSolid,
	isInteractable,
	IsDynamic,
	isGroup,
	Group,
} from '../core/types';

export class World {
	private entities = new Map<EntityId, Entity>();
	private renderables: Entity[][] = [];
	private height: number = 0;
	private width: number = 0;

	interactibles: (Entity & (Interactable | Group))[] = [];
	collidables: (Entity & (Solid | Group))[] = [];
	dynamics: (Entity & Dynamic)[] = [];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	getSize(): { width: number; height: number } {
		return { width: this.width, height: this.height };
	}

	addEntity(e: Entity) {
		if (!this.renderables[e.priority]) this.renderables[e.priority] = [];
		this.renderables[e.priority].push(e);
		this.entities.set(e.id, e);

		if (isInteractable(e) || isGroup(e)) this.interactibles.push(e);
		if (isSolid(e) || isGroup(e)) this.collidables.push(e);
		if (IsDynamic(e)) this.dynamics.push(e);
	}

	removeEntity(id: EntityId) {
		const e = this.entities.get(id);
		if (!e) return;

		this.entities.delete(id);
		const layer = this.renderables[e.priority];
		if (layer) this.removeFromArray(layer, e);

		if (isInteractable(e) || isGroup(e))
			this.removeFromArray(this.interactibles, e);
		if (isSolid(e) || isGroup(e)) this.removeFromArray(this.collidables, e);
		if (IsDynamic(e)) this.removeFromArray(this.dynamics, e);
	}

	private removeFromArray<T>(arr: T[], item: T) {
		const i = arr.indexOf(item);
		if (i === -1) return;

		const last = arr[arr.length - 1];
		arr[i] = last;
		arr.pop();
	}

	private recursiveCollide(
		ent: Entity,
		obs: Entity,
		move: { dx: number; dy: number },
		ox: number = 0,
		oy: number = 0,
	) {
		if (move.dx == 0 && move.dy == 0) return;

		let absX = obs.x + ox;
		let absY = obs.y + oy;

		if (isGroup(obs)) {
			for (const child of obs.getChildrens())
				if (ent !== obs) this.recursiveCollide(ent, child, move, absX, absY);
		}
		if (isSolid(obs)) {
			const { ax, ay } = computeMovementAABB(
				ent,
				{ ...obs, x: absX, y: absY },
				move.dx,
				move.dy,
			);
			move.dx = move.dx < 0 ? Math.max(move.dx, ax) : Math.min(move.dx, ax);
			move.dy = move.dy < 0 ? Math.max(move.dy, ay) : Math.min(move.dy, ay);
		}
	}

	resolveMovement(
		ent: Entity,
		dx: number,
		dy: number,
	): { dx: number; dy: number } {
		if (ent.y + dy < 0 || ent.y + ent.height + dy > this.height) dy = 0;
		if (ent.x + dx < 0 || ent.x + ent.width + dx > this.width) dx = 0;
		if (!isSolid(ent) && !isGroup(ent)) return { dx, dy };
		if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };

		let result = { dx, dy };

		for (const obstacle of this.collidables) {
			if (obstacle === ent) continue;
			this.recursiveCollide(ent, obstacle, result);
		}

		return result;
	}

	private recursiveInteract(
		target: Entity,
		obs: Entity,
		ox: number = 0,
		oy: number = 0,
	): (Entity & Interactable) | null {
		let absX = obs.x + ox;
		let absY = obs.y + oy;

		if (!checkAABB(target, { ...obs, x: absX, y: absY })) return null;

		if (isGroup(obs))
			for (const child of obs.getChildrens()) {
				const found = this.recursiveInteract(target, child, absX, absY);
				if (found) return found;
			}

		return isInteractable(obs) ? obs : null;
	}

	getInteraction(target: Entity): (Entity & Interactable) | null {
		for (const e of this.interactibles) {
			const hit = this.recursiveInteract(target, e);
			if (hit) return hit;
		}

		return null;
	}

	render(ctx: CanvasRenderingContext2D) {
		for (const layer of this.renderables) {
			if (!layer) continue;
			for (const e of layer) e.text.draw(ctx, e.x, e.y, e.width, e.height);
		}
	}
}
