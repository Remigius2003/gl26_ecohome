// scenes/trilogique/TrilogiqueScene.ts

import { Scene, SceneType, Dynamic, Entity } from "../../core/types";
import {
    ColorTexture,
    ImageTexture,
    Sprite,
    TransparentTexture,
} from "../../core/texture";
import { Camera } from "../../logic/camera";
import { World } from "../../logic/world";
import {
    createEntity,
    createSolid,
    withInteractable,
    withDynamic,
} from "../../logic/factory";
import {
    PhysicsSystem,
    PlayerController,
    NPCController,
} from "../../logic/movement";
import { Group } from "@scene/core/group";

import {
    GameWorld,
    Item,
    ResourceRef,
    Transformer,
    Receiver,
    Position,
} from "./types";
import { createPlayer } from "../home.entities";
import { Skins } from "@api/manageSkin";

const BG_OPTIONS = [
    { src: "/game/trilogique/images/env/grass1.png", weight: 0.1 }, // Rare
    { src: "/game/trilogique/images/env/grass2.png", weight: 0.2 },
    { src: "/game/trilogique/images/env/grass3.png", weight: 0.01 },
    { src: "/game/trilogique/images/env/grass4.png", weight: 0.5 }, // Common
];
const CELL_SIZE = 100;

export default class TrilogiqueScene implements Scene {
    private world!: World;
    private camera!: Camera;

    // Player
    private player!: Group & Dynamic;
    private playerController!: PlayerController;
    private baseSpeed: number = 1000;

    // Trilogique State
    private gameWorldData: GameWorld | null = null;
    private heldItemData: Item | null = null;
    private heldEntity: Entity | null = null;

    // GAME STATE
    private currentTime: number = 0;
    private currentPoints: number = 0; // Starts at 0
    private targetPoints: number = 100; // Goal from JSON
    private isGameOver: boolean = false;
    private lastInteractPressed = false;

    // SPAWNING STATE
    private spawnTimer: number = 0;
    private readonly SPAWN_INTERVAL: number = 4000; // Spawn every 4 seconds

    // Callbacks
    private onSwitchScene?: (t: SceneType) => void;

    private isLoading = true;
    private debugLog: string[] = [];

    init(canvas: HTMLCanvasElement, onSwitchScene: (t: SceneType) => void) {
        this.camera = new Camera(canvas.width, canvas.height);
        this.world = new World(1000, 1000);
        this.onSwitchScene = onSwitchScene; // Save callback for redirection
        this.loadLevel(canvas);
    }

    async loadLevel(canvas: HTMLCanvasElement) {
        try {
            this.gameWorldData = await GameWorld.unserialise(
                "/game/trilogique/niveau1.json",
            );

            this.world = new World(
                this.gameWorldData.worldSizeX * CELL_SIZE,
                this.gameWorldData.worldSizeY * CELL_SIZE,
            );

            this.currentTime = this.gameWorldData.initialTime;
            this.targetPoints = this.gameWorldData.finalPoints;
            this.currentPoints = 0;

            this.setupBackground();
            this.setupBoundaries();
            this.setupPlayer(this.gameWorldData.playerSpawn);
            this.setupStaticMap();
            this.setupMachines();

            // Initial items
            for (let i = 0; i < 3; i++) this.spawnRandomItemFromData();

            this.isLoading = false;
        } catch (e) {
            console.error(e);
        }
    }

    private setupPlayer(spawn: Position) {
        const PLAYER_SIZE = CELL_SIZE * 0.7;
        this.player = createPlayer(
            spawn.x * CELL_SIZE,
            spawn.y * CELL_SIZE,
            PLAYER_SIZE,
        );

        const skinsManager = new Skins();
        const allEquippedEntries = Object.entries(skinsManager.equipped);

        allEquippedEntries.forEach(([typeName, skin]) => {
            if (!skin) return;

            const frames = skin.frames;
            if (frames.length === 0) return;

            this.player.add(
                createEntity({
                    id: typeName,
                    x: 0,
                    y: 0,
                    width: 2 * PLAYER_SIZE,
                    height: 2 * PLAYER_SIZE,
                    priority: frames.length > 1 ? 4 : 3,
                    text: new Sprite(frames),
                }),
            );
        });

        this.world.addEntity(this.player);
        this.player.speed = 1000;
        this.playerController = new PlayerController(this.player);
    }

    private spawnRandomItemFromData() {
        if (
            !this.gameWorldData ||
            this.gameWorldData.itemsPerSpawnArea.length === 0
        )
            return;

        // Pick a random spawn area
        const area =
            this.gameWorldData.itemsPerSpawnArea[
                Math.floor(
                    Math.random() * this.gameWorldData.itemsPerSpawnArea.length,
                )
            ];

        if (area.itemIds.length === 0 || area.positions.length === 0) return;

        // Pick a random item from that area and a random position within it
        const itemId =
            area.itemIds[Math.floor(Math.random() * area.itemIds.length)];
        const pos =
            area.positions[Math.floor(Math.random() * area.positions.length)];

        const itemData = this.gameWorldData.itemsById.get(itemId);

        if (itemData) {
            this.createWorldItem(
                itemData,
                pos.x * CELL_SIZE,
                pos.y * CELL_SIZE,
            );
        }
    }
    private updateWeightPenalty() {
        if (!this.heldItemData) {
            this.player.speed = this.baseSpeed;
            return;
        }
        /**
         * Logic: Reduce speed based on weight.
         * Weight 1 = 90% speed, Weight 5 = 50% speed.
         */
        const penaltyMultiplier = 1 - this.heldItemData.weight * 0.1;
        this.player.speed = this.baseSpeed * Math.max(0.2, penaltyMultiplier);

        this.log(
            `Speed: ${Math.round(this.player.speed)} (Weight: ${this.heldItemData.weight})`,
        );
    }

    private setupBackground() {
        if (!this.gameWorldData) return;

        const totalWeight = BG_OPTIONS.reduce(
            (sum, opt) => sum + opt.weight,
            0,
        );

        const getRandomBgTexture = () => {
            let random = Math.random() * totalWeight;
            for (const option of BG_OPTIONS) {
                if (random < option.weight) return option.src;
                random -= option.weight;
            }
            return BG_OPTIONS[0].src;
        };

        for (let x = 0; x < this.gameWorldData.worldSizeX; x++) {
            for (let y = 0; y < this.gameWorldData.worldSizeY; y++) {
                const floor = createEntity({
                    id: `floor-${x}-${y}`,
                    x: x * CELL_SIZE,
                    y: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    text: new ImageTexture(getRandomBgTexture()),
                    priority: 1,
                });
                this.world.addEntity(floor);
            }
        }
    }
    private setupBoundaries() {
        if (!this.gameWorldData) return;

        const w = this.gameWorldData.worldSizeX;
        const h = this.gameWorldData.worldSizeY;
        const borderThickness = CELL_SIZE;

        // Helper to create a black block
        const createBorderBlock = (
            x: number,
            y: number,
            width: number,
            height: number,
            id: string,
        ) => {
            const block = createSolid({
                id: `border-${id}`,
                x: x * CELL_SIZE,
                y: y * CELL_SIZE,
                width: width * CELL_SIZE,
                height: height * CELL_SIZE,
                text: new ColorTexture("black"),
                priority: 100,
            });
            this.world.addEntity(block);
        };

        createBorderBlock(0, 0, w + 2, 1, "top");
        createBorderBlock(0, h - 1, w + 2, 1, "bottom");
        createBorderBlock(0, 0, 1, h, "left");
        createBorderBlock(w, 0, 1, h, "right");
    }

    private setupStaticMap() {
        if (!this.gameWorldData) return;

        Object.values(this.gameWorldData.priorities).forEach(
            (entityData: any) => {
                const texturePath =
                    entityData.text || entityData.image || "wall.png";

                const ent = createSolid({
                    id: entityData.id || "static",
                    x: entityData.x * CELL_SIZE,
                    y: entityData.y * CELL_SIZE,
                    width: (entityData.width || 1) * CELL_SIZE,
                    height: (entityData.height || 1) * CELL_SIZE,
                    text: new ImageTexture(texturePath),
                    priority: entityData.priority || 1,
                });
                this.world.addEntity(ent);
            },
        );
    }

    private setupMachines() {
        console.log("start setup Machines");
        if (!this.gameWorldData) return;

        // Transformers
        this.gameWorldData.transformers.forEach(({ transformer, position }) => {
            const tEntity = createSolid({
                id: `transformer-${transformer.id}`,
                x: position.x * CELL_SIZE,
                y: position.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                text: new ImageTexture(transformer.image),
            });

            const interactable = withInteractable(tEntity, {
                onInteract: () =>
                    this.handleTransformerInteraction(transformer),
            });

            this.world.addEntity(interactable);
        });

        // Receivers
        this.gameWorldData.receivers.forEach(({ receiver, position }) => {
            const rEntity = createSolid({
                id: `receiver-${receiver.id}`,
                x: position.x * CELL_SIZE,
                y: position.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                text: new ImageTexture(receiver.image),
            });

            const interactable = withInteractable(rEntity, {
                onInteract: () => this.handleReceiverInteraction(receiver),
            });

            this.world.addEntity(interactable);
        });
    }

    /**
     * Creates an item sitting on the ground that can be picked up.
     */
    private createWorldItem(item: Item, x: number, y: number) {
        const entity = createEntity({
            id: `item-${item.id}-${Math.random().toString(36).substr(2, 5)}`,
            x: x,
            y: y,
            width: CELL_SIZE * 0.5,
            height: CELL_SIZE * 0.5,
            text: new ImageTexture(item.image),
            priority: 2,
        });
        const interactable = withInteractable(entity, {
            onInteract: () => {
                if (this.heldItemData) {
                    this.log("Hands full!");
                    return;
                }
                this.pickupItem(item, interactable);
            },
        });

        this.world.addEntity(interactable);
    }

    // --- Interaction Logic ---

    private pickupItem(itemData: Item, worldEntity: Entity) {
        this.world.removeEntity(worldEntity.id);
        this.heldItemData = itemData;

        this.heldEntity = createEntity({
            id: `held-${itemData.id}`,
            x: CELL_SIZE / 2,
            y: CELL_SIZE / 2,
            width: CELL_SIZE / 2,
            height: CELL_SIZE / 2,
            priority: 5,
            text: new ImageTexture(itemData.image),
        });

        this.player.add(this.heldEntity);
        this.updateWeightPenalty();
        this.log(`Picked up ${itemData.id}`);
    }

    private dropCurrentItem() {
        if (this.heldEntity) {
            this.player.remove(this.heldEntity.id);
            this.heldEntity = null;
        }
        this.heldItemData = null;
        this.updateWeightPenalty();
    }

    private handleTransformerInteraction(transformer: Transformer) {
        if (!this.heldItemData) {
            this.log("Transformer: You need an item.");
            return;
        }
        const recipe = transformer.craft.find((r) =>
            this.matchesResource(this.heldItemData!, r.source),
        );

        if (recipe) {
            this.log(
                `Transforming ${this.heldItemData.id} -> ${recipe.resultItemId}`,
            );

            this.dropCurrentItem();

            const resultItemData = this.gameWorldData!.itemsById.get(
                recipe.resultItemId,
            );
            if (resultItemData) {
                // Immediately pick up the result
                // (Note: we pass a dummy entity here because pickupItem usually expects a world entity
                // to remove, but since we are just generating it, we handle the visuals manually)

                this.heldItemData = resultItemData;
                this.heldEntity = createEntity({
                    id: `held-${resultItemData.id}`,
                    x: CELL_SIZE / 2,
                    y: CELL_SIZE / 2,
                    width: CELL_SIZE / 2,
                    height: CELL_SIZE / 2,
                    priority: 5,
                    text: new ImageTexture(resultItemData.image),
                });

                this.player.add(this.heldEntity);
            }
        } else {
            this.log("Transformer: This item doesn't fit.");
        }
    }

    private handleReceiverInteraction(receiver: Receiver) {
        if (!this.heldItemData) {
            this.log("Receiver: Feed me.");
            return;
        }

        const rule = receiver.process.find((r) =>
            this.matchesResource(this.heldItemData!, r.source),
        );

        if (rule) {
            const effect = rule.effect;

            if (effect.points) {
                this.currentPoints += effect.points;
                this.log(`+${effect.points} Points`);
            }

            if (effect.time) {
                this.currentTime += effect.time;
                this.log(`+${effect.time}s Time`);
            }

            this.dropCurrentItem();
            if (this.currentPoints >= this.targetPoints) {
                this.winGame();
            }
        } else {
            this.log("Receiver: Invalid input.");
        }
    }
    private winGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.log("VICTORY!");

        setTimeout(() => {
            if (this.onSwitchScene) {
                window.location.href = "/";
            }
        }, 1500);
    }

    private loseGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.log("TIME UP!");
        setTimeout(() => {
            window.location.reload();
        }, 4000);
    }

    private matchesResource(item: Item, ref: ResourceRef): boolean {
        if (ref.type === "item") {
            return item.id === ref.id;
        } else if (ref.type === "category") {
            return item.categoryIds.includes(ref.id);
        }
        return false;
    }

    // --- Engine Boilerplate ---

    resizeScene(w: number, h: number) {
        this.camera.resize(w, h);
    }

    handleInput(input: Record<string, boolean>) {
        if (this.isLoading || this.isGameOver) return;

        this.playerController.update(0, input);

        const isInteractPressed = input[" "] || input["enter"];

        if (isInteractPressed && !this.lastInteractPressed) {
            const target = this.world.getInteraction(this.player);

            if (target) {
                target.onInteract();
            } else if (this.heldItemData) {
                this.log(`Dropped ${this.heldItemData.id}`);

                this.createWorldItem(
                    this.heldItemData,
                    this.player.x,
                    this.player.y,
                );
                this.dropCurrentItem();
            }
        }

        // Update the last state
        this.lastInteractPressed = isInteractPressed;
    }

    update(dt: number) {
        if (this.isLoading || this.isGameOver) return;

        PhysicsSystem.move(this.player, dt, this.world);
        this.world.dynamics.forEach((e) =>
            PhysicsSystem.move(e, dt, this.world),
        );
        this.camera.follow(this.player, this.world);

        this.currentTime -= dt;
        if (this.currentTime <= 0) {
            this.currentTime = 0;
            this.loseGame();
        }

        this.spawnTimer += dt;
        if (this.spawnTimer >= this.SPAWN_INTERVAL) {
            this.spawnRandomItemFromData();
            this.spawnTimer = 0;
        }
    }
    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (this.isLoading) {
            ctx.fillStyle = "white";
            ctx.fillText("Loading...", 100, 100);
            return;
        }

        this.camera.apply(ctx);
        this.world.render(ctx);
        this.camera.release(ctx);

        this.renderUI(ctx);
    }

    private renderUI(ctx: CanvasRenderingContext2D) {
        const barHeight = 50;
        const width = ctx.canvas.width;

        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, barHeight);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, barHeight - 2, width, 2);

        ctx.font = "bold 20px 'Courier New', sans-serif";
        ctx.textBaseline = "middle";

        // Points (Current / Target)
        ctx.fillStyle = "#FFD700"; // Gold
        ctx.textAlign = "left";
        ctx.fillText(
            `GOAL: ${this.currentPoints} / ${this.targetPoints}`,
            20,
            barHeight / 2,
        );

        // Time (Counting Down)
        // Color changes to Red if time is low (< 30s)
        ctx.fillStyle = this.currentTime < 30 ? "#FF4444" : "#00FFFF";
        ctx.textAlign = "right";
        ctx.fillText(
            `TIME: ${Math.ceil(this.currentTime / 1000)}`,
            width - 20,
            barHeight / 2,
        );

        // Debug Log
        ctx.font = "12px Arial";
        ctx.fillStyle = "lime";
        ctx.textAlign = "left";
        this.debugLog.forEach((msg, i) =>
            ctx.fillText(msg, 10, barHeight + 30 + i * 15),
        );

        // Victory/Loss Overlay
        if (this.isGameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, width, ctx.canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            const msg =
                this.currentPoints >= this.targetPoints
                    ? "VICTORY!"
                    : "TIME UP!";
            ctx.fillText(msg, width / 2, ctx.canvas.height / 2);
        }
    }

    private log(msg: string) {
        this.debugLog.push(msg);
        console.log(msg);
        if (this.debugLog.length > 5) this.debugLog.shift();
    }

    clean() {}
}
