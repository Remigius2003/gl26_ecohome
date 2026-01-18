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
        const addWall = (
            id: string,
            x: number,
            y: number,
            w: number,
            h: number,
        ) =>
            this.world.addEntity(
                createSolid({
                    id,
                    x,
                    y,
                    width: w,
                    height: h,
                    priority: 2,
                    text: new ImageTexture("house/wall/wood.png"),
                }),
            );

        const addFurniture = (
            id: string,
            x: number,
            y: number,
            w: number,
            h: number,
            texture: string,
        ) =>
            this.world.addEntity(
                createEntity({
                    id,
                    x,
                    y,
                    width: w,
                    height: h,
                    priority: 1,
                    text: new ImageTexture(texture),
                }),
            );

        this.world = new World(3 * canvas.width, 3 * canvas.height); // need to be fix to something like that on computer
        this.camera = new Camera(canvas.width, canvas.height);

        //parametres
        const DOOR_WIDTH = 140;
        const WALL_THICKNESS = 20;

        const HOUSE_X = 0;
        const HOUSE_Y = 0;
        const HOUSE_WIDTH = 3000;
        const HOUSE_HEIGHT = 3000;

        // Outer walls
        addWall("house-top", HOUSE_X, HOUSE_Y, HOUSE_WIDTH, WALL_THICKNESS);
        addWall(
            "house-bottom",
            HOUSE_X,
            HOUSE_Y + HOUSE_HEIGHT - WALL_THICKNESS,
            HOUSE_WIDTH,
            WALL_THICKNESS,
        );
        addWall("house-left", HOUSE_X, HOUSE_Y, WALL_THICKNESS, HOUSE_HEIGHT);
        addWall(
            "house-right",
            HOUSE_X + HOUSE_WIDTH - WALL_THICKNESS,
            HOUSE_Y,
            WALL_THICKNESS,
            HOUSE_HEIGHT,
        );

        //Inner wall
        const X_1_3 = 1000;
        const X_1_2 = 1500;
        const X_2_3 = 2000;

        const Y_2_5 = 1200;
        const Y_2_3 = 2000;
        const Y_1_2 = 1500;
        const Y_1_4 = 750;

        // Upper horizontal wall (at 2/5 height)
        addWall("inner-h-upper", 0, Y_2_5, X_1_3, WALL_THICKNESS);

        // Upper vertical walls (left and right), with bottom doors
        addWall(
            "inner-v-upper-left",
            X_1_3,
            DOOR_WIDTH,
            WALL_THICKNESS,
            Y_2_5 - DOOR_WIDTH,
        );
        addWall(
            "inner-v-upper-right",
            X_2_3,
            DOOR_WIDTH,
            WALL_THICKNESS,
            Y_2_5 - DOOR_WIDTH,
        );

        // Lower horizontal wall
        addWall(
            "inner-h-lower-left",
            DOOR_WIDTH,
            Y_2_3,
            X_1_3 - DOOR_WIDTH,
            WALL_THICKNESS,
        );

        // Mid-right horizontal wall
        addWall(
            "inner-h-mid-right",
            X_2_3,
            Y_1_2,
            HOUSE_WIDTH - X_2_3,
            WALL_THICKNESS,
        );

        // Mid-right up horizontal wall
        addWall(
            "inner-h-mid-right",
            X_2_3,
            Y_1_4,
            HOUSE_WIDTH - X_2_3,
            WALL_THICKNESS,
        );

        // Left lower vertical wall
        addWall(
            "inner-v-lower-left",
            X_1_3,
            Y_2_3,
            WALL_THICKNESS,
            HOUSE_HEIGHT - Y_2_3,
        );

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

        // NPC
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

        // Stairs
        const stairs = withInteractable(
            createEntity({
                id: "stairs-up",
                x: HOUSE_X + HOUSE_WIDTH / 2 + 60,
                y: HOUSE_Y + HOUSE_HEIGHT / 2 + 100,
                width: 80,
                height: 120,
                priority: 1,
                text: new ImageTexture("house/stairs/stairs_up.png"),
            }),
            {
                onInteract: () => {
                    console.log("Go upstairs");
                    this.player.x = 300;
                    this.player.y = 150;
                },
            },
        );

        this.world.addEntity(stairs);

        //const games: { type: SceneType; x: number; color: string }[] = [
        //    { type: "trilogique", x: 200, color: "#f44336" },
        //    { type: "ecogrid", x: 400, color: "#4caf50" },
        //    { type: "lightshadow", x: 600, color: "#9c27b0" },
        //];

        //games.forEach((game) => {
        //    const portal = withInteractable(
        //        createEntity({
        //            id: `portal-${game.type}`,
        //            x: game.x,
        //            y: 50,
        //            width: 60,
        //            height: 60,
        //            priority: 1, // backgroundground
        //            text: new ColorTexture(game.color, "white"),
        //        }),
        //        {
        //            onInteract: () => onSwitchScene(game.type),
        //        },
        //    );
        //
        //    this.world.addEntity(portal);
        //});
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
                "Press SPACE to enter",
                this.player.x + this.player.width / 2,
                this.player.y - 10,
            );
        }
    }

    clean() {}
}
