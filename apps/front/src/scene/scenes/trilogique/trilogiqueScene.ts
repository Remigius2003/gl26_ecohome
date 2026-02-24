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
import { PhysicsSystem, PlayerController } from "../../logic/movement";
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

import { TrilogiqueUI } from "./trilogiqueUI";
import { TrilogiqueBuilder } from "./trilogiqueBuilder";

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
    private readonly MESSAGE_DURATION: number = 5000;

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

            // DELEGATED TO BUILDER
            TrilogiqueBuilder.setupBackground(
                this.world,
                this.gameWorldData,
                CELL_SIZE,
            );
            TrilogiqueBuilder.setupBoundaries(
                this.world,
                this.gameWorldData,
                CELL_SIZE,
            );
            TrilogiqueBuilder.setupStaticMap(
                this.world,
                this.gameWorldData,
                CELL_SIZE,
            );

            await this.setupPlayer(this.gameWorldData.playerSpawn);
            this.setupMachines();

            for (let i = 0; i < 3; i++) this.spawnRandomItemFromData();

            this.isLoading = false;
        } catch (e) {
            console.error(`Failed to load level ${levelId}`, e);
            this.log("Error loading level");
        }
    }

    private async setupPlayer(spawn: Position) {
        this.player = createPlayer(
            spawn.x * CELL_SIZE,
            spawn.y * CELL_SIZE,
            this.playerSize,
        );

        const skinsManager = new Skins();
        await skinsManager.init();

        Object.entries(skinsManager.equipped).forEach(([typeName, skin]) => {
            if (!skin || skin.frames.length === 0) return;
            this.player.add(
                createEntity({
                    id: typeName,
                    x: 0,
                    y: 0,
                    width: 2 * this.playerSize,
                    height: 2 * this.playerSize,
                    priority: skin.frames.length > 1 ? 4 : 3,
                    text: new Sprite(skin.frames),
                }),
            );
        });

        this.world.addEntity(this.player);
        this.player.speed = 1000;
        this.playerController = new PlayerController(this.player);
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
    private showPlayerMessage(msg: string) {
        this.playerMessage = msg;
        this.playerMessageTimer = this.MESSAGE_DURATION;
        this.log(msg);
    }

    private updateWeightPenalty() {
        if (!this.heldItemData) {
            this.player.speed = this.baseSpeed;
            return;
        }
        const penaltyMultiplier = 1 - this.heldItemData.weight * 0.1;
        this.player.speed = this.baseSpeed * Math.max(0.2, penaltyMultiplier);
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

        const rejectList = (receiver as any).rejects;
        if (rejectList) {
            const rejection = rejectList.find((r: any) =>
                this.matchesResource(this.heldItemData!, r.source),
            );
            if (rejection) {
                this.showPlayerMessage(rejection.message);
                return;
            }
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

            this.showPlayerMessage("Bon travail !");
            this.dropCurrentItem();

            if (this.currentPoints >= this.targetPoints) this.winGame();
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
            if (this.onSwitchScene) window.location.href = "/lobby/trilogique";
        }, 2500);
    }

    private loseGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.log("TIME UP!");
        setTimeout(() => window.location.reload(), 4000);
    }

    private matchesResource(item: Item, ref: ResourceRef): boolean {
        if (ref.type === "item") return item.id === ref.id;
        if (ref.type === "category") return item.categoryIds.includes(ref.id);
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
        this.lastInteractPressed = isInteractPressed;
    }

    update(dt: number) {
        if (this.isLoading || this.isGameOver) return;

        PhysicsSystem.move(this.player, dt, this.world);
        this.world.dynamics.forEach((e) =>
            PhysicsSystem.move(e, dt, this.world),
        );
        this.camera.follow(this.player, this.world);

        if (this.playerMessageTimer > 0) {
            this.playerMessageTimer -= dt;
            if (this.playerMessageTimer <= 0) this.playerMessage = null;
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

        TrilogiqueUI.renderPlayerMessage(
            ctx,
            this.player,
            this.playerSize,
            this.playerMessage,
            this.playerMessageTimer,
        );

        this.camera.release(ctx);

        TrilogiqueUI.renderHUD(
            ctx,
            this.currentPoints,
            this.targetPoints,
            this.currentTime,
            this.isGameOver,
        );
    }

    private log(msg: string) {
        this.debugLog.push(msg);
        console.log(msg);
        if (this.debugLog.length > 5) this.debugLog.shift();
    }

    clean() {}
}
