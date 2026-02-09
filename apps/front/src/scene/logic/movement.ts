import { SwapTexture } from '@scene/core/texture';
import {
	Controller,
	Dynamic,
	Entity,
	InputState,
	isGroup,
} from '../core/types';
import { World } from './world';

export class PhysicsSystem {
	static move(entity: Entity & Dynamic, dt: number, world: World) {
		let { vx, vy } = entity;

		// Normalize
		if (vx !== 0 || vy !== 0) {
			const len2 = vx * vx + vy * vy;
			if (len2 > 1) {
				const inv = 1 / Math.sqrt(len2);
				vx *= inv;
				vy *= inv;
			}
		}

		const vvx = vx * entity.speed * (dt * 0.001); // ms to s
		const vvy = vy * entity.speed * (dt * 0.001); // ms to s
		const { dx, dy } = world.resolveMovement(entity, vvx, vvy);

		entity.x += dx;
		entity.y += dy;

		entity.vx = 0;
		entity.vy = 0;
	}
}

export class PlayerController implements Controller<Entity & Dynamic> {
	constructor(public readonly entity: Entity & Dynamic) {}

	update(_: number, input?: InputState) {
		if (!input) return;

		this.entity.vx = 0;
		this.entity.vy = 0;

		const e = isGroup(this.entity)
			? this.entity.getChild('player')
			: this.entity;
		if (!e) return;
		const text = e.text instanceof SwapTexture ? e.text : null;

		if (input['arrowup'] || input['z']) {
			this.entity.vy = -1;
			if (text) text.nextTexture();
		}
		if (input['arrowdown'] || input['s']) {
			this.entity.vy = 1;
			if (text) text.nextTexture();
		}
		if (input['arrowleft'] || input['q']) {
			this.entity.vx = -1;
			if (text) {
				text.setSymX(false);
				text.nextTexture();
			}
		}
		if (input['arrowright'] || input['d']) {
			this.entity.vx = 1;
			if (text) {
				text.setSymX(true);
				text.nextTexture();
			}
		}
	}
}

export class NPCController implements Controller<Entity & Dynamic> {
	private moveDir = { x: 0, y: 0 };
	private timer = 0;

	constructor(public readonly entity: Entity & Dynamic) {}

	update(dt: number) {
		this.timer -= dt;

		if (this.timer <= 0) {
			this.timer = 1000 + Math.random() * 2000;
			const r = Math.random();
			if (r < 0.2) this.moveDir = { x: 0, y: -1 };
			else if (r < 0.4) this.moveDir = { x: 0, y: 1 };
			else if (r < 0.6) this.moveDir = { x: -1, y: 0 };
			else if (r < 0.8) this.moveDir = { x: 1, y: 0 };
			else this.moveDir = { x: 0, y: 0 };
		}

		this.entity.vx = this.moveDir.x;
		this.entity.vy = this.moveDir.y;
	}
}
