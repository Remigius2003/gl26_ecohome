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

type AsciiObjectDef = {
    width: number;
    height: number;
    texture: string;
    solid?: boolean;
};

type AsciiInteractionDef = {
    width: number;
    height: number;
    onInteract: () => void;
    texture?: string; // optional visual
};

const OBJECT_DEFS: Record<string, AsciiObjectDef> = {
    T: {
        width: 3,
        height: 3,
        texture: "house/furniture/table.png",
        solid: true,
    },
    E: {
        width: 1,
        height: 1,
        texture: "house/furniture/esc.png",
        solid: false,
    },
};
const INTERACTION_DEFS: Record<string, AsciiInteractionDef> = {
    S: {
        width: 1,
        height: 2,
        texture: "none",
        onInteract: () => {
            console.log("Go upstairs");
            //navigate("../home2");
        },
    },
};

export default class HomeScene implements Scene {
    private playerController!: PlayerController;
    private npcControllers: NPCController[] = [];
    private camera!: Camera;
    private player!: Character;
    private world!: World;

    init(canvas: HTMLCanvasElement, onSwitchScene: (type: SceneType) => void) {
        function generateWallsFromAscii(
            map: string[],
            addWall: (
                id: string,
                x: number,
                y: number,
                w: number,
                h: number,
            ) => void,
        ) {
            const rows = map.length;
            const cols = map[0].length;
            let wallId = 0;

            for (let y = 0; y < rows; y++) {
                let x = 0;

                while (x < cols) {
                    if (map[y][x] === "#") {
                        const startX = x;

                        while (x < cols && map[y][x] === "#") {
                            x++;
                        }

                        const width = x - startX;

                        addWall(
                            `wall-${wallId++}`,
                            startX * CELL_SIZE,
                            y * CELL_SIZE,
                            width * CELL_SIZE,
                            CELL_SIZE,
                        );
                    } else {
                        x++;
                    }
                }
            }
        }

        function generateObjectsFromAscii(
            map: string[],
            addObject: (
                id: string,
                x: number,
                y: number,
                w: number,
                h: number,
                texture: string,
                solid: boolean,
            ) => void,
        ) {
            const rows = map.length;
            const cols = map[0].length;
            let objectId = 0;

            const visited = Array.from({ length: rows }, () =>
                Array(cols).fill(false),
            );

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const char = map[y][x];

                    if (!OBJECT_DEFS[char] || visited[y][x]) continue;

                    const def = OBJECT_DEFS[char];

                    // mark occupied cells
                    for (let dy = 0; dy < def.height; dy++) {
                        for (let dx = 0; dx < def.width; dx++) {
                            if (map[y + dy]?.[x + dx] === char) {
                                visited[y + dy][x + dx] = true;
                            }
                        }
                    }

                    addObject(
                        `object-${char}-${objectId++}`,
                        x * CELL_SIZE,
                        y * CELL_SIZE,
                        def.width * CELL_SIZE,
                        def.height * CELL_SIZE,
                        def.texture,
                        def.solid ?? false,
                    );
                }
            }
        }
        function generateInteractionsFromAscii(
            map: string[],
            addInteraction: (
                id: string,
                x: number,
                y: number,
                w: number,
                h: number,
                texture: string | undefined,
                onInteract: () => void,
            ) => void,
        ) {
            const rows = map.length;
            const cols = map[0].length;
            let interactionId = 0;

            const visited = Array.from({ length: rows }, () =>
                Array(cols).fill(false),
            );

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const char = map[y][x];

                    if (!INTERACTION_DEFS[char] || visited[y][x]) continue;

                    const def = INTERACTION_DEFS[char];

                    // mark occupied cells
                    for (let dy = 0; dy < def.height; dy++) {
                        for (let dx = 0; dx < def.width; dx++) {
                            if (map[y + dy]?.[x + dx] === char) {
                                visited[y + dy][x + dx] = true;
                            }
                        }
                    }

                    addInteraction(
                        `interaction-${char}-${interactionId++}`,
                        x * CELL_SIZE,
                        y * CELL_SIZE,
                        def.width * CELL_SIZE,
                        def.height * CELL_SIZE,
                        def.texture,
                        def.onInteract,
                    );
                }
            }
        }

        function findPlayerSpawn(map: string[]) {
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (map[y][x] === "P") {
                        return { x, y };
                    }
                }
            }
            return { x: 1, y: 1 };
        }

        const GRID_COLS = 32;
        const GRID_ROWS = 32;

        const CELL_SIZE = 96;

        // world size now comes from the grid
        const WORLD_WIDTH = GRID_COLS * CELL_SIZE;
        const WORLD_HEIGHT = GRID_ROWS * CELL_SIZE;

        this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);
        this.camera = new Camera(canvas.width, canvas.height);

        // Outer walls
        const WALL = 1;
        const ASCII_MAP = [
            "################################",
            "#......................EEEEEEEE#",
            "#......................EEEEEEEE#",
            "#..........#..........##########",
            "#..........#..........#........#",
            "#...TTT....#..........#........#",
            "#...TTT....#..........#........#",
            "#...TTT....#...................#",
            "#..........#...................#",
            "#..........#..........#........#",
            "#..........#..........#........#",
            "#..........#..........#........#",
            "#..........#..........##########",
            "############...................#",
            "#..............................#",
            "#..............................#",
            "#..............................#",
            "#..............................#",
            "#........######...#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#........#............#",
            "#........#....P...#............#",
            "#........#........#............#",
            "################################",
        ];
        generateObjectsFromAscii(
            ASCII_MAP,
            (id, x, y, w, h, texture, solid) => {
                this.world.addEntity(
                    solid
                        ? createSolid({
                              id,
                              x,
                              y,
                              width: w,
                              height: h,
                              priority: 1,
                              text: new ImageTexture(texture),
                          })
                        : createEntity({
                              id,
                              x,
                              y,
                              width: w,
                              height: h,
                              priority: 1,
                              text: new ImageTexture(texture),
                          }),
                );
            },
        );
        generateInteractionsFromAscii(
            ASCII_MAP,
            (id, x, y, w, h, texture, onInteract) => {
                const entity = withInteractable(
                    createEntity({
                        id,
                        x,
                        y,
                        width: w,
                        height: h,
                        priority: 1,
                        text: texture
                            ? new ImageTexture(texture)
                            : new ImageTexture("undefined"),
                    }),
                    { onInteract },
                );

                this.world.addEntity(entity);
            },
        );

        generateWallsFromAscii(ASCII_MAP, (id, x, y, w, h) => {
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
        });

        const spawn = findPlayerSpawn(ASCII_MAP);

        this.player = createCharacter({
            id: "player",
            x: spawn.x * CELL_SIZE,
            y: spawn.y * CELL_SIZE,
            width: CELL_SIZE * 0.5,
            height: CELL_SIZE * 0.5,
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
        //const stairs = withInteractable(
        //    createEntity({
        //        id: "stairs-up",
        //        x: HOUSE_X + HOUSE_WIDTH / 2 + 60,
        //        y: HOUSE_Y + HOUSE_HEIGHT / 2 + 100,
        //        width: 80,
        //        height: 120,
        //        priority: 1,
        //        text: new ImageTexture("house/stairs/stairs_up.png"),
        //    }),
        //    {
        //        onInteract: () => {
        //            console.log("Go upstairs");
        //            this.player.x = 300;
        //            this.player.y = 150;
        //        },
        //    },
        //);
        //this.world.addEntity(stairs);

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
