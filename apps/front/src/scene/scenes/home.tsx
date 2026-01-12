import { Scene, SceneType, Character } from "../core/types";
import { ColorTexture, ImageTexture } from "../core/texture";
import { Camera } from "../logic/camera";
import { World } from "../logic/world";
import {
  createCharacter,
  createEntity,
  createSolid,
  withInteractable,
} from "../logic/factory";
import {
  PhysicsSystem,
  PlayerController,
  NPCController,
} from "../logic/movement";

export default class HomeScene implements Scene {
  private playerController!: PlayerController;
  private npcControllers: NPCController[] = [];
  private camera!: Camera;
  private player!: Character;
  private world!: World;

  init(canvas: HTMLCanvasElement, onSwitchScene: (type: SceneType) => void) {
    this.world = new World(3 * canvas.width, 3 * canvas.height);
    this.camera = new Camera(canvas.width, canvas.height);

    this.player = createCharacter({
      id: "player",
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      speed: 400,
      text: new ColorTexture("#4fc3f7", "white"),
    });

    this.playerController = new PlayerController(this.player);
    this.world.addEntity(this.player);

    const npc = createCharacter({
      id: "guide-npc",
      x: 300,
      y: 200,
      width: 60,
      height: 60,
      speed: 150,
      text: new ImageTexture("/public/scene/npc.png"),
    });

    this.world.addEntity(npc);
    this.npcControllers.push(new NPCController(npc));
    const games: { type: SceneType; x: number; color: string }[] = [
      { type: "trilogique", x: 200, color: "#f44336" },
      { type: "ecogrid", x: 400, color: "#4caf50" },
      { type: "lightshadow", x: 600, color: "#9c27b0" },
    ];

    games.forEach((game) => {
      const portal = withInteractable(
        createEntity({
          id: `portal-${game.type}`,
          x: game.x,
          y: 50,
          width: 60,
          height: 60,
          priority: 1, // backgroundground
          text: new ColorTexture(game.color, "white"),
        }),
        {
          onInteract: () => onSwitchScene(game.type),
        }
      );

      this.world.addEntity(portal);
    });

    const wall = createSolid({
      id: "wall-1",
      x: 300,
      y: 300,
      width: 400,
      height: 200,
      text: new ColorTexture("#555"),
    });

    this.world.addEntity(wall);
  }

  resizeScene(w: number, h: number) {
    this.camera.resize(w, h);
  }

  handleInput(input: Record<string, boolean>) {
    this.playerController.update(0, input);

    if (input[" "] || input["enter"]) {
      const target = this.world.getInteraction(this.player);
      if (target) target.onInteract();
    }
  }

  update(dt: number) {
    PhysicsSystem.move(this.player, dt, this.world);
    this.npcControllers.forEach((ctrl) => ctrl.update(dt));
    this.world.dynamics.forEach((e) => PhysicsSystem.move(e, dt, this.world));
    this.camera.follow(this.player, this.world);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.camera.apply(ctx);
    this.world.render(ctx);
    this.camera.release(ctx);

    const interaction = this.world.getInteraction(this.player);
    if (interaction) {
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press SPACE to enter",
        this.player.x + this.player.width / 2,
        this.player.y - 10
      );
    }
  }

  clean() {}
}
