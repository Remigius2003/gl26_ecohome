import { Dynamic, Entity, Texture } from '../core/types';
import { ImageTexture, Sprite, TransparentTexture } from '../core/texture';
import { withDynamic, withSolid, createEntity } from '../logic/factory';
import { Group } from '@scene/core/group';
import {
	getFloorLayerMap,
	getFloorTexture,
	FLOOR_CHAR_TO_PATH,
	type FloorChar,
} from './home.map';
import { ensureSkinsInitialized } from '@api/manageSkin';

export function createFloorTile(
	id: string,
	x: number,
	y: number,
	size: number,
) {
	const cellX = Math.round(x / size);
	const cellY = Math.round(y / size);

	const layerMap = getFloorLayerMap();
	const char = (layerMap[cellY]?.[cellX] ?? '.') as FloorChar;

	const path =
		char !== '.' && FLOOR_CHAR_TO_PATH[char]
			? FLOOR_CHAR_TO_PATH[char]!
			: getFloorTexture().path;

	return createEntity({
		id,
		x,
		y,
		width: size,
		height: size,
		priority: 0,
		text: new ImageTexture(`/${path}`),
	});
}

export type EntNode = {
	x?: number;
	y?: number;
	w?: number;
	h?: number;
	speed?: number;
	text?: Texture;
	solid?: boolean;
	priority?: number;
	childrens?: Record<string, EntNode>;
};

export function createCharacter(id: string, opts: EntNode): Group & Dynamic {
	const grp = withDynamic(
		new Group(id, opts.x ?? 0, opts.y ?? 0, opts.priority ?? 2),
		{ speed: opts.speed },
	);

	const isSolid = (solid: boolean, ent: Entity) =>
		(solid && withSolid(ent)) || ent;

	const InvText = new TransparentTexture();
	const parseNode = (node: EntNode) => {
		if (!node.childrens) return;
		for (const [key, child] of Object.entries(node.childrens)) {
			if (child.childrens) parseNode(child);
			else
				grp.add(
					isSolid(
						child.solid ?? false,
						createEntity({
							id: `${id}_${key}`,
							x: child.x,
							y: child.y,
							width: child.w,
							height: child.h,
							priority: child.priority,
							text: child.text ?? InvText,
						}),
					),
				);
		}
	};

	parseNode(opts);
	return grp;
}

export function createPlayer(x: number, y: number, size: number) {
	ensureSkinsInitialized().catch(() => {});

	const playerGroup = createCharacter('player', {
		x,
		y,
		speed: 400,
		childrens: {
			hitbox: {
				x: size / 2,
				y: size,
				w: size,
				h: size,
				solid: true,
				priority: 0,
			},
			body: {
				x: 0,
				y: 0,
				w: size * 2,
				h: size * 2,
				priority: 2,
				text: new Sprite('/chara/bodyStanding.png', [
					'/chara/bodyW.png',
					'/chara/bodyStanding.png',
					'/chara/bodyW2.png',
				]),
			},
		},
	});

	return playerGroup;
}
