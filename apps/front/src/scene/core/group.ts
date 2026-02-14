import { GroupTag, Entity, EntityId, Texture } from './types';
import { GroupTexture } from './texture';

export class Group implements Group {
	private boundsDirty = false;
	readonly [GroupTag] = true;
	childrens: Entity[] = [];

	id: EntityId;
	x: number;
	y: number;
	width: number = 0;
	height: number = 0;
	priority: number;
	text: Texture;

	constructor(id: EntityId, x: number, y: number, priority: number = 2) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.priority = priority;
		this.text = new GroupTexture(this);
	}

	add(e: Entity): void {
		this.childrens.push(e);
		this.boundsDirty = true;
		this.updateBounds();
	}

	remove(id: EntityId): void {
		this.childrens = this.childrens.filter((c) => c.id !== id);
		this.boundsDirty = true;
		this.updateBounds();
	}

	getChild(id: EntityId): Entity | undefined {
		const direct = this.childrens.find((c) => c.id === id);
		if (direct) return direct;

		for (const c of this.childrens) {
			if (GroupTag in c) {
				const found = (c as unknown as Group).getChild(id);
				if (found) return found;
			}
		}

		return undefined;
	}

	getChildrens(): Entity[] {
		return this.childrens;
	}

	updateBounds() {
		if (this.childrens.length === 0) {
			this.width = 0;
			this.height = 0;
			return;
		}

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		for (const child of this.childrens) {
			if (child.x < minX) minX = child.x;
			if (child.y < minY) minY = child.y;
			if (child.x + child.width > maxX) maxX = child.x + child.width;
			if (child.y + child.height > maxY) maxY = child.y + child.height;
		}

		if (minX < 0 || minY < 0) {
			const offsetX = minX < 0 ? minX : 0;
			const offsetY = minY < 0 ? minY : 0;

			this.x += offsetX;
			this.y += offsetY;

			for (const child of this.childrens) {
				child.x -= offsetX;
				child.y -= offsetY;
			}

			maxX -= offsetX;
			maxY -= offsetY;
		}

		this.width = maxX;
		this.height = maxY;
		this.boundsDirty = false;
	}
}
