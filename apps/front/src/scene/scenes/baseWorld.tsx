import { Entity, Scene, SceneType } from '../core/types';
import { ImageTexture, Sprite, TransparentTexture } from '../core/texture';
import { Camera } from '../logic/camera';
import { World } from '../logic/world';
import { createEntity, createSolid, withInteractable } from '../logic/factory';
import {
	PhysicsSystem,
	PlayerController,
	NPCController,
} from '../logic/movement';
import { createFloorTile, createPlayer } from './home.entities';
import { createEffect, onCleanup } from 'solid-js';
import { ensureSkinsInitialized, sharedSkins } from '@api/manageSkin';

export interface MapData {
	ASCII_MAP: string[];
	CELL_SIZE: number;
	GRID_COLS: number;
	GRID_ROWS: number;
	generateWalls: Function;
	generateThings: Function;
	findSpawn: Function;
}

const GameState = {
	playerPosition: null as { x: number; y: number } | null,
	savePosition(x: number, y: number) {
		this.playerPosition = { x, y };
	},

	resetPosition() {
		this.playerPosition = null;
	},
};

export abstract class BaseWorldScene implements Scene {
	protected world!: World;
	protected camera!: Camera;
	protected player!: any;
	protected playerController!: PlayerController;
	protected npcControllers: NPCController[] = [];

	// Abstract property: each scene must provide its own map data
	protected abstract mapData: MapData;

	async init(canvas: HTMLCanvasElement, onSwitchScene: (t: SceneType) => void) {
		const { GRID_COLS, GRID_ROWS, CELL_SIZE, ASCII_MAP } = this.mapData;

		this.world = new World(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
		this.camera = new Camera(canvas.width, canvas.height);

		// 1. Build Floor
		for (let y = 0; y < GRID_ROWS; y++) {
			for (let x = 0; x < GRID_COLS; x++) {
				this.world.addEntity(
					createFloorTile(
						`floor-${x}-${y}`,
						x * CELL_SIZE,
						y * CELL_SIZE,
						CELL_SIZE,
					),
				);
			}
		}

		// 2. Build Objects/Interactions
		this.mapData.generateThings(
			ASCII_MAP,
			CELL_SIZE,
			(
				id,
				x,
				y,
				w,
				h,
				texture,
				solid,
				priority,
				areaOfInteraction,
				onInteract, //this should be one line for less red
			) => {
				const baseEntity = this.createStandardEntity(
					id,
					x,
					y,
					w,
					h,
					texture,
					solid,
					priority,
				);

				if (areaOfInteraction >= 0) {
					const padding = areaOfInteraction * CELL_SIZE;
					const interactionZone = withInteractable(
						createEntity({
							id: `${id}-interaction`,
							x: x - padding,
							y: y - padding,
							width: w + padding * 2,
							height: h + padding * 2,
							priority: -1,
							text: new TransparentTexture(),
						}),
						{ onInteract },
					);
					this.world.addEntity(interactionZone);
				}
				this.world.addEntity(baseEntity);
			},
		);

		// 3. Build Walls
		this.mapData.generateWalls(
			ASCII_MAP,
			CELL_SIZE,
			(id, x, y, w, h, priority, texturePath) => {
				this.world.addEntity(
					createSolid({
						id,
						x,
						y,
						width: w,
						height: h,
						priority: 2,
						text: new ImageTexture(texturePath),
					}),
				);
			},
		);

		// 4. Setup Player with Persistence logic
		const spawn = this.mapData.findSpawn(ASCII_MAP);
		const PLAYER_SIZE = CELL_SIZE * 0.7;

		// CHECK PERSISTENCE: Use GameState if it exists, otherwise use Map Spawn
		const initialX = GameState.playerPosition
			? GameState.playerPosition.x
			: spawn.x * CELL_SIZE;
		const initialY = GameState.playerPosition
			? GameState.playerPosition.y
			: spawn.y * CELL_SIZE;

		this.player = createPlayer(initialX, initialY, PLAYER_SIZE);
		await this.applySkins(this.player, PLAYER_SIZE);

		this.player.speed = 1000;
		this.playerController = new PlayerController(this.player);
		this.world.addEntity(this.player);

		this.addExtraEntities();
	}

	// Helper to create entity with texture logic
	private createStandardEntity(
		id: string,
		x: number,
		y: number,
		w: number,
		h: number,
		texture: string | null,
		solid: boolean,
		priority: number,
	) {
		const config = {
			id,
			x,
			y,
			width: w,
			height: h,
			priority,
			text: texture ? new ImageTexture(texture) : new TransparentTexture(),
		};
		return solid ? createSolid(config) : createEntity(config);
	}

	private activeSkinEntities: Entity[] = [];
	private async applySkins(player: any, size: number) {
		await ensureSkinsInitialized();

		createEffect(() => {
			this.activeSkinEntities.forEach((ent) => player.remove?.(ent.id));
			this.activeSkinEntities = [];
			Object.entries(sharedSkins.equipped).forEach(([typeName, skin]) => {
				if (!skin?.frames?.length) return;

				const skinEntity = createEntity({
					id: `skin_${typeName}`,
					width: 2 * size,
					height: 2 * size,
					priority: skin.frames.length > 1 ? 4 : 3,
					text: new Sprite(skin.frames),
				});

				this.activeSkinEntities.push(skinEntity);
				player.add(skinEntity);
			});

			onCleanup(() => {
				this.activeSkinEntities.forEach((ent) => player.remove?.(ent));
			});
		});
	}

	protected addExtraEntities() {}

	handleInput(input: Record<string, boolean>) {
		this.playerController.update(0, input);
		if (input[' '] || input['enter']) {
			const target = this.world.getInteraction(this.player);
			if (target) {
				target.onInteract();
				input['enter'] = false;
				input[' '] = false;
			}
		}
	}

	update(dt: number) {
		PhysicsSystem.move(this.player, dt, this.world);
		GameState.savePosition(this.player.x, this.player.y);

		this.npcControllers.forEach((ctrl) => ctrl.update(dt));
		this.world.dynamics.forEach((e) => PhysicsSystem.move(e, dt, this.world));
		this.camera.follow(this.player, this.world);
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = '#1a1a1a';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.camera.apply(ctx);
		this.world.render(ctx);

		const interaction = this.world.getInteraction(this.player);
		if (interaction) {
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(
				'Press SPACE',
				this.player.x + this.player.width / 2,
				this.player.y - 10,
			);
		}
		this.camera.release(ctx);
	}

	resizeScene(w: number, h: number) {
		this.camera.resize(w, h);
	}
	clean() {
		if (this.player) {
			GameState.savePosition(this.player.x, this.player.y);
		}
	}
}
