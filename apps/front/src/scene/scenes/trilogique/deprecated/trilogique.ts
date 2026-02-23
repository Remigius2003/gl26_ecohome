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
import { saveScore } from "@api/score";

const CELL_SIZE = 100;

export default class TrilogiqueScene implements Scene {
    private world!: World;
    private camera!: Camera;

    // Player
    private player!: Group & Dynamic;
    private playerController!: PlayerController;
    private baseSpeed: number = 1000;
    private playerSize: number = CELL_SIZE * 0.7;

    // Speech Bubble State
    private playerMessage: string | null = null;
    private playerMessageTimer: number = 0;
    private readonly MESSAGE_DURATION: number = 5000; // Shows for 5 seconds

    // Trilogique State
    private gameWorldData: GameWorld | null = null;
    private heldItemData: Item | null = null;
    private heldEntity: Entity | null = null;

    // GAME STATE
    private currentTime: number = 0;
    private currentPoints: number = 0;
    private targetPoints: number = 100;
    private isGameOver: boolean = false;
    private lastInteractPressed = false;

    // SPAWNING STATE
    private spawnTimer: number = 0;
    private readonly SPAWN_INTERVAL: number = 4000;

    // Callbacks
    private onSwitchScene?: (t: SceneType) => void;

    private isLoading = true;
    private debugLog: string[] = [];
    private levelId: string = "";

    init(canvas: HTMLCanvasElement, onSwitchScene: (t: SceneType) => void) {
        this.camera = new Camera(canvas.width, canvas.height);
        this.world = new World(1000, 1000);
        this.onSwitchScene = onSwitchScene;
        this.isLoading = true;
    }

    async loadGameLevel(levelId: string) {
        this.levelId = levelId;
        this.isLoading = true;
        this.world = new World(1000, 1000);
        this.gameWorldData = null;
        this.heldItemData = null;
        this.playerMessage = null;

        try {
            console.log(`Loading level: ${levelId}`);
            this.gameWorldData = await GameWorld.unserialise(
                `/game/trilogique/niveau${levelId}.json`,
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
            await this.setupPlayer(this.gameWorldData.playerSpawn);
            this.setupStaticMap();
            this.setupMachines();

            for (let i = 0; i < 3; i++) this.spawnRandomItemFromData();

            this.isLoading = false;
        } catch (e) {
            console.error(`Failed to load level ${levelId}`, e);
            this.log("Error loading level");
        }
    }

    private async setupPlayer(spawn: Position) {
        const PLAYER_SIZE = CELL_SIZE * 0.7;
        this.player = createPlayer(
            spawn.x * CELL_SIZE,
            spawn.y * CELL_SIZE,
            this.playerSize,
        );

        const skinsManager = new Skins();
        await skinsManager.init();
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
                    width: 2 * this.playerSize,
                    height: 2 * this.playerSize,
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

        const area =
            this.gameWorldData.itemsPerSpawnArea[
                Math.floor(
                    Math.random() * this.gameWorldData.itemsPerSpawnArea.length,
                )
            ];

        if (area.itemIds.length === 0 || area.positions.length === 0) return;

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
        const penaltyMultiplier = 1 - this.heldItemData.weight * 0.1;
        this.player.speed = this.baseSpeed * Math.max(0.2, penaltyMultiplier);
    }

    private setupBackground() {
        if (!this.gameWorldData) return;

        const texturePath =
            (this.gameWorldData as any).groundTexture ||
            "/game/trilogique/images/env/grass1.png";

        for (let x = 0; x < this.gameWorldData.worldSizeX; x++) {
            for (let y = 0; y < this.gameWorldData.worldSizeY; y++) {
                const floor = createEntity({
                    id: `floor-${x}-${y}`,
                    x: x * CELL_SIZE,
                    y: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    text: new ImageTexture(texturePath),
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

                if (entityData.walkable) {
                    const ent = createEntity({
                        id: entityData.id || "decor",
                        x: entityData.x * CELL_SIZE,
                        y: entityData.y * CELL_SIZE,
                        width: (entityData.width || 1) * CELL_SIZE,
                        height: (entityData.height || 1) * CELL_SIZE,
                        text: new ImageTexture(texturePath),
                        priority: entityData.priority || 1,
                    });
                    this.world.addEntity(ent);
                } else {
                    const ent = createSolid({
                        id: entityData.id || "static",
                        x: entityData.x * CELL_SIZE,
                        y: entityData.y * CELL_SIZE,
                        width: (entityData.width || 1) * CELL_SIZE,
                        height: (entityData.height || 1) * CELL_SIZE,
                        text: new ImageTexture(texturePath),
                        priority: entityData.priority || 10,
                    });
                    this.world.addEntity(ent);
                }
            },
        );
    }

    private setupMachines() {
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
                    this.showPlayerMessage(
                        "Vous ne pouvez pas porter plusieurs objets !",
                    );
                    return;
                }
                this.pickupItem(item, interactable);
            },
        });

        this.world.addEntity(interactable);
    }

    // --- Interaction Logic ---

    // Triggers a speech bubble above the player
    private showPlayerMessage(msg: string) {
        this.playerMessage = msg;
        this.playerMessageTimer = this.MESSAGE_DURATION;
        this.log(msg); // Also log it just in case
    }

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
            this.showPlayerMessage(
                "Vous devez ramener un objet pour le séparer",
            );
            return;
        }
        const recipe = transformer.craft.find((r) =>
            this.matchesResource(this.heldItemData!, r.source),
        );

        if (recipe) {
            this.log(
                `Separated ${this.heldItemData.id} -> ${recipe.resultItemId}`,
            );
            this.dropCurrentItem();

            const resultItemData = this.gameWorldData!.itemsById.get(
                recipe.resultItemId,
            );
            if (resultItemData) {
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
                this.showPlayerMessage(
                    "Bravo ! Vous pouvez maintenant recycler correctement ",
                );
            }
        } else {
            this.showPlayerMessage("Vous ne pouvez pas utiliser cette machine");
        }
    }

    private handleReceiverInteraction(receiver: Receiver) {
        if (!this.heldItemData) {
            this.showPlayerMessage("Vous devez ramener un objet");
            return;
        }

        // 1. Check if the item is explicitly rejected
        const rejectList = (receiver as any).rejects;
        if (rejectList) {
            const rejection = rejectList.find((r: any) =>
                this.matchesResource(this.heldItemData!, r.source),
            );

            if (rejection) {
                // Trigger the educational speech bubble!
                this.showPlayerMessage(rejection.message);
                return;
            }
        }

        // 2. If not rejected, check if it's accepted
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

            this.showPlayerMessage("Bon travail !");
            this.dropCurrentItem();

            if (this.currentPoints >= this.targetPoints) {
                this.winGame();
            }
        } else {
            this.showPlayerMessage(
                "Attention, vous ne pouvez pas jeter cet objet dans cette poubelle",
            );
        }
    }

    private winGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.log("VICTORY!");
        saveScore("trilogique", this.levelId, this.currentTime);
        setTimeout(() => {
            if (this.onSwitchScene) {
                window.location.href = "/lobby/trilogique";
            }
        }, 11500);
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

    // --- Engine ---

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

        // Update speech bubble timer
        if (this.playerMessageTimer > 0) {
            this.playerMessageTimer -= dt;
            if (this.playerMessageTimer <= 0) {
                this.playerMessage = null;
            }
        }

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

        // Render the bubble in WORLD SPACE (so it attaches to the player)
        this.renderPlayerMessage(ctx);

        this.camera.release(ctx);

        this.renderUI(ctx);
    }

    // --- SPEECH BUBBLE RENDERER ---
    private renderPlayerMessage(ctx: CanvasRenderingContext2D) {
        if (!this.playerMessage || this.playerMessageTimer <= 0) return;

        const maxWidth = 250;
        const lineHeight = 18;
        const padding = 12;

        ctx.font = "bold 14px Arial";

        // 1. Calculate text lines (Word Wrapping)
        const words = this.playerMessage.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== "") {
                lines.push(currentLine);
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // 2. Calculate Box Dimensions
        let maxLineWidth = 0;
        for (const line of lines) {
            const w = ctx.measureText(line.trim()).width;
            if (w > maxLineWidth) maxLineWidth = w;
        }

        const bubbleWidth = maxLineWidth + padding * 2;
        const bubbleHeight = lines.length * lineHeight + padding * 2;

        // Position above player (Centered)
        const px = this.player.x + this.playerSize / 2;
        const py = this.player.y - 15; // Gap above player head

        const bx = px - bubbleWidth / 2;
        const by = py - bubbleHeight;

        // 3. Draw Bubble Background (White Box with border)
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Fallback for older browsers without roundRect: just use regular rect paths
        ctx.rect(bx, by, bubbleWidth, bubbleHeight);
        ctx.fill();
        ctx.stroke();

        // 4. Draw Pointer (Little triangle pointing to player)
        ctx.beginPath();
        ctx.moveTo(px - 10, by + bubbleHeight);
        ctx.lineTo(px + 10, by + bubbleHeight);
        ctx.lineTo(px, by + bubbleHeight + 15);
        ctx.fill();
        ctx.stroke();

        // Remove the stroke line that crosses the base of the triangle
        ctx.beginPath();
        ctx.moveTo(px - 9, by + bubbleHeight);
        ctx.lineTo(px + 9, by + bubbleHeight);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // 5. Draw Text
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            ctx.fillText(line.trim(), px, by + padding + i * lineHeight);
        });
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
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "left";
        ctx.fillText(
            `GOAL: ${this.currentPoints} / ${this.targetPoints}`,
            20,
            barHeight / 2,
        );

        // Time (Counting Down)
        ctx.fillStyle = this.currentTime < 30 ? "#FF4444" : "#00FFFF";
        ctx.textAlign = "right";
        ctx.fillText(
            `TIME: ${Math.ceil(this.currentTime / 1000)}`,
            width - 20,
            barHeight / 2,
        );

        // Removed the messy debugLog from the screen since we have speech bubbles now!

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
