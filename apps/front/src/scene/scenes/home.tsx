import {
	Scene,
	SceneType,
	Entity,
	Player,
	SolidTag,
	DynamicTag,
	InteractableTag,
} from '../core/types';
import { World } from '../logic/world';
import {
	PhysicsSystem,
	PlayerController,
	NPCController,
} from '../logic/movement';
import { ColorTexture, ImageTexture } from '../core/texture';
import { Camera } from '../logic/camera';

export default class HomeScene implements Scene {
	private playerController!: PlayerController;
	private npcControllers: NPCController[] = [];
	private camera!: Camera;
	private player!: Player;
	private world!: World;

	init(canvas: HTMLCanvasElement, onSwitchScene: (type: SceneType) => void) {
		this.world = new World(canvas.width, canvas.height);
		this.camera = new Camera(canvas.width, canvas.height);

		this.player = {
			id: 'player',
			x: 100,
			y: 100,
			width: 40,
			height: 40,
			vx: 0,
			vy: 0,
			speed: 400,
			text: new ColorTexture('#4fc3f7', 'white'),
			[DynamicTag]: true,
			[SolidTag]: true,
		} as Player;

		this.playerController = new PlayerController(this.player);
		this.world.addEntity(this.player);

		// const npc = {
		//   id: "guide-npc",
		//   x: 300,
		//   y: 200,
		//   width: 40,
		//   height: 40,
		//   vx: 0,
		//   vy: 0,
		//   speed: 100,
		//   text: new ImageTexture("/assets/npc_sprite.png"),
		//   [DynamicTag]: true,
		//   [SolidTag]: true,
		// } as Entity & any;
		//
		// this.world.addEntity(npc);
		// this.npcControllers.push(new NPCController(npc));

		const games: { type: SceneType; x: number; color: string }[] = [
			{ type: 'trilogique', x: 200, color: '#f44336' },
			{ type: 'ecogrid', x: 400, color: '#4caf50' },
			{ type: 'lightshadow', x: 600, color: '#9c27b0' },
		];

		games.forEach((game) => {
			const portal = {
				id: `portal-${game.type}`,
				x: game.x,
				y: 50,
				width: 60,
				height: 60,
				text: new ColorTexture(game.color, 'white'),
				[InteractableTag]: true,
				onInteract: () => onSwitchScene(game.type),
			} as Entity & any;
			this.world.addEntity(portal);
		});

		const wall = {
			id: 'wall-1',
			x: 300,
			y: 300,
			width: 400,
			height: 200,
			text: new ColorTexture('#555'),
			[SolidTag]: true,
		} as Entity & any;
		this.world.addEntity(wall);
	}

	handleInput(input: Record<string, boolean>) {
		this.playerController.update(input);

		if (input[' '] || input['enter']) {
			const target = this.world.getInteraction(this.player);
			if (target) target.onInteract();
		}
	}

	update(dt: number) {
		PhysicsSystem.move(this.player, dt, this.world);
		this.npcControllers.forEach((ctrl, i) => ctrl.update(dt));
		this.world.dynamics.forEach((e) => PhysicsSystem.move(e, dt, this.world));
		this.camera.follow(this.player, this.world);
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = '#1a1a1a';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		this.camera.apply(ctx);
		this.world.render(ctx);
		this.camera.release(ctx);

		const interaction = this.world.getInteraction(this.player);
		if (interaction) {
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(
				'Press SPACE to enter',
				this.player.x + this.player.width / 2,
				this.player.y - 10
			);
		}
	}

	clean() {}
}
