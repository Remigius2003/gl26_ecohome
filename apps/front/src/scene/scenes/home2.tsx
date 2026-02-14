import { Scene, SceneType, Character } from "../core/types";
import { ImageTexture, TransparentTexture } from "../core/texture";
import { Camera } from "../logic/camera";
import { World } from "../logic/world";
import { createEntity, createSolid, withInteractable } from "../logic/factory";
import {
    PhysicsSystem,
    PlayerController,
    NPCController,
} from "../logic/movement";

import { ASCII_MAP, CELL_SIZE, GRID_COLS, GRID_ROWS } from "./home2.map";

import {
    generateWallsFromAscii,
    generateThingsFromAscii,
    findPlayerSpawn,
} from "./home2.ascii";

import { createFloorTile } from "./home.entities";

export default class Home2Scene implements Scene {
    private world!: World;
    private camera!: Camera;
    private player!: Character;
    private playerController!: PlayerController;
    private npcControllers: NPCController[] = [];

    init(canvas: HTMLCanvasElement, onSwitchScene: (t: SceneType) => void) {
        this.world = new World(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
        this.camera = new Camera(canvas.width, canvas.height);

        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                const tile = createFloorTile(
                    `floor-${x}-${y}`,
                    x * CELL_SIZE,
                    y * CELL_SIZE,
                    CELL_SIZE,
                );
                this.world.addEntity(tile);
            }
        }
        generateThingsFromAscii(
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
                onInteract,
            ) => {
                // Create base object
                const baseEntity = solid
                    ? createSolid({
                          id,
                          x,
                          y,
                          width: w,
                          height: h,
                          priority,
                          text: texture
                              ? new ImageTexture(texture)
                              : new TransparentTexture(),
                      })
                    : createEntity({
                          id,
                          x,
                          y,
                          width: w,
                          height: h,
                          priority,
                          text: texture
                              ? new ImageTexture(texture)
                              : new TransparentTexture(),
                      });

                // No interaction
                if (areaOfInteraction < 0) {
                    this.world.addEntity(baseEntity);
                    return;
                }

                // Expand interaction area
                const padding = areaOfInteraction * CELL_SIZE;

                const interactionEntity = createEntity({
                    id: `${id}-interaction`,
                    x: x - padding,
                    y: y - padding,
                    width: w + padding * 2,
                    height: h + padding * 2,
                    priority: -1,
                    text: new TransparentTexture(),
                });

                this.world.addEntity(
                    withInteractable(interactionEntity, {
                        onInteract: onInteract,
                    }),
                );

                // Add the visible/solid object separately
                this.world.addEntity(baseEntity);
            },
        );

        generateWallsFromAscii(
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

        const spawn = findPlayerSpawn(ASCII_MAP);
        this.player = createPlayer(
            spawn.x * CELL_SIZE,
            spawn.y * CELL_SIZE,
            CELL_SIZE,
        );

        this.playerController = new PlayerController(this.player);
        this.world.addEntity(this.player);

        const npc = createGuideNPC();
        this.world.addEntity(npc);
        this.npcControllers.push(new NPCController(npc));
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
        this.world.dynamics.forEach((e) =>
            PhysicsSystem.move(e, dt, this.world),
        );
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
                "Press SPACE to interact",
                this.player.x + this.player.width / 2,
                this.player.y - 10,
            );
        }
    }

    clean() {}
}
