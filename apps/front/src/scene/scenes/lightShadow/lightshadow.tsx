import { Scene, SceneType, Character, Entity, Solid } from "../../core/types";
import { ColorTexture, ImageTexture } from "../../core/texture";
import { Camera } from "../../logic/camera";
import { World } from "../../logic/world";
import {
    createEntity,
    createSolid,
    createCharacter,
    withInteractable,
    withDynamic,
} from "../../logic/factory";
import { PhysicsSystem, PlayerController } from "../../logic/movement";
import { drawDarknessWithLights } from "../../logic/lighting";
import {
    GhostControllerNamed as GhostController,
    type DeviceLike,
} from "../../logic/ghost";
import { LightShadowLevel } from "./types";

type Device = (Entity & Solid) &
    DeviceLike & { lightRadius: number; label: string };

function findSpawn(map: string[]) {
    for (let y = 0; y < map.length; y++)
        for (let x = 0; x < map[y].length; x++)
            if (map[y][x] === "P") return { x, y };
    return { x: 1, y: 1 };
}

function generateWalls(
    map: string[],
    world: World,
    cellSize: number,
    texture: string,
) {
    let id = 0;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== "#") continue;
            world.addEntity(
                createSolid({
                    id: `wall-${id++}`,
                    x: x * cellSize,
                    y: y * cellSize,
                    width: cellSize,
                    height: cellSize,
                    priority: 4,
                    text: new ImageTexture(texture),
                }),
            );
        }
    }
}

function createFloor(
    world: World,
    cols: number,
    rows: number,
    cellSize: number,
    texture: string,
) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            world.addEntity(
                createEntity({
                    id: `floor-${x}-${y}`,
                    x: x * cellSize,
                    y: y * cellSize,
                    width: cellSize,
                    height: cellSize,
                    priority: 0,
                    text: new ImageTexture(texture),
                }),
            );
        }
    }
}

function makeDevice(
    world: World,
    id: string,
    x: number,
    y: number,
    watts: number,
    label: string,
    colorOn: string,
    colorOff: string,
    lightRadius: number,
    interactionCells: number,
    cellSize: number, // <-- Added this
): Device {
    const base = createSolid({
        id,
        x,
        y,
        width: cellSize * 0.65,
        height: cellSize * 0.65,
        priority: 3,
        text: new ColorTexture(colorOff, "rgba(255,255,255,0.6)"),
    }) as any as Device;

    base.isOn = false;
    base.watts = watts;
    base.label = label;
    base.lightRadius = lightRadius;

    base.toggle = (force?: boolean) => {
        const next = typeof force === "boolean" ? force : !base.isOn;
        base.isOn = next;
        base.text = new ColorTexture(
            next ? colorOn : colorOff,
            "rgba(255,255,255,0.6)",
        );
    };

    const pad = interactionCells * cellSize;
    const zone = createEntity({
        id: `${id}-interaction`,
        x: x - pad,
        y: y - pad,
        width: base.width + pad * 2,
        height: base.height + pad * 2,
        priority: -1,
        text: new ColorTexture("rgba(0,0,0,0)"),
    });

    world.addEntity(
        withInteractable(zone, { onInteract: () => base.toggle(false) }),
    );
    world.addEntity(base);

    return base;
}

function makeExit(
    world: World,
    x: number,
    y: number,
    cellSize: number,
    onNext: () => void,
) {
    const door = createEntity({
        id: "exit-door",
        x,
        y,
        width: cellSize * 0.7,
        height: cellSize * 0.9,
        priority: 3,
        text: new ColorTexture(
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.8)",
        ),
    });

    const zone = createEntity({
        id: "exit-door-zone",
        x: x - cellSize * 0.5,
        y: y - cellSize * 0.5,
        width: door.width + cellSize,
        height: door.height + cellSize,
        priority: -1,
        text: new ColorTexture("rgba(0,0,0,0)"),
    });

    world.addEntity(withInteractable(zone, { onInteract: onNext }));
    world.addEntity(door);
}
function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

function fillRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillStyle: string,
) {
    ctx.save();
    ctx.fillStyle = fillStyle;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();
}

function strokeRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    strokeStyle: string,
    lineWidth = 2,
) {
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
}

function drawBackArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
) {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.95)";
    ctx.lineWidth = Math.max(4, size * 0.12);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.85, y + size * 0.5);
    ctx.lineTo(x + size * 0.25, y + size * 0.5);
    ctx.lineTo(x + size * 0.45, y + size * 0.3);
    ctx.moveTo(x + size * 0.25, y + size * 0.5);
    ctx.lineTo(x + size * 0.45, y + size * 0.7);
    ctx.stroke();
    ctx.restore();
}

function drawRingIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    ringColor: string,
    innerDraw?: () => void,
) {
    ctx.save();
    // ring
    ctx.lineWidth = Math.max(4, r * 0.18);
    ctx.strokeStyle = ringColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // inner
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
    ctx.fill();

    if (innerDraw) innerDraw();
    ctx.restore();
}

function drawBolt(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.1, cy - s * 0.48);
    ctx.lineTo(cx + s * 0.08, cy - s * 0.1);
    ctx.lineTo(cx - s * 0.02, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.1, cy + s * 0.48);
    ctx.lineTo(cx - s * 0.1, cy + s * 0.06);
    ctx.lineTo(cx + s * 0.02, cy + s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBulb(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
) {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.lineWidth = Math.max(2, s * 0.08);
    ctx.lineCap = "round";

    // bulb head
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.08, s * 0.33, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // sides down
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.24, cy - s * 0.02);
    ctx.lineTo(cx - s * 0.16, cy + s * 0.2);
    ctx.moveTo(cx + s * 0.24, cy - s * 0.02);
    ctx.lineTo(cx + s * 0.16, cy + s * 0.2);
    ctx.stroke();

    // base
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.18, cy + s * 0.22);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.22);
    ctx.moveTo(cx - s * 0.16, cy + s * 0.3);
    ctx.lineTo(cx + s * 0.16, cy + s * 0.3);
    ctx.stroke();

    ctx.restore();
}

function drawSegmentBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    segments: number,
    ratio: number,
    onColor: string,
    offColor: string,
) {
    const gap = Math.max(2, w * 0.006);
    const segW = (w - gap * (segments - 1)) / segments;
    const filled = Math.round(ratio * segments);

    for (let i = 0; i < segments; i++) {
        const sx = x + i * (segW + gap);
        ctx.fillStyle = i < filled ? onColor : offColor;
        ctx.fillRect(sx, y, segW, h);
    }
}
export default class LightShadowScene implements Scene {
    private world!: World;
    private camera!: Camera;

    private player!: Character;
    private playerController!: PlayerController;

    private levelIndex = 0;
    private currentLevelData!: LightShadowLevel;

    private devices: Device[] = [];
    private ghostControllers: GhostController[] = [];
    private input: Record<string, boolean> = {};

    private elapsed = 0;
    private score = 0;
    private surgeWatts = 0;
    private gameOver = false;
    private win = false;
    private isLoading = true; // Added a loading state

    init(
        canvas: HTMLCanvasElement,
        onSwitchScene: (t: SceneType) => void,
    ): void {
        this.camera = new Camera(canvas.width, canvas.height);
        //this.loadLevel(0); // This is now async, so we just kick it off
    }
    async loadLevel(PartialPath: string) {
        this.isLoading = true;
        this.elapsed = 0;
        this.gameOver = false;
        this.win = false;
        this.devices = [];
        this.ghostControllers = [];

        const path = `/game/lightShadow/niveau${PartialPath}.json`;

        try {
            this.currentLevelData = await LightShadowLevel.unserialise(path);
        } catch (e) {
            console.error(
                `Failed to fetch level at ${path}, using defaults.`,
                e,
            );
            this.currentLevelData = new LightShadowLevel();
        }
        const {
            map,
            cellSize,
            wallTexture,
            floorTexture,
            ghostCount,
            ghostSpeed,
        } = this.currentLevelData;

        const rows = map.length;
        const cols = map[0].length;

        this.world = new World(cols * cellSize, rows * cellSize);

        createFloor(this.world, cols, rows, cellSize, floorTexture);
        generateWalls(map, this.world, cellSize, wallTexture);

        const spawn = findSpawn(map);
        this.player = createCharacter({
            id: "player",
            x: spawn.x * cellSize + cellSize * 0.2,
            y: spawn.y * cellSize + cellSize * 0.2,
            width: cellSize * 0.45,
            height: cellSize * 0.45,
            speed: 600,
            text: new ColorTexture("#4fc3f7", "white"),
        });

        this.playerController = new PlayerController(this.player);
        this.world.addEntity(this.player);

        let did = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const c = map[y][x];
                const devConfig = this.currentLevelData.devicesByChar.get(c);

                if (devConfig) {
                    this.devices.push(
                        makeDevice(
                            this.world,
                            `device-${did++}`,
                            x * cellSize + cellSize * 0.18,
                            y * cellSize + cellSize * 0.18,
                            devConfig.watts,
                            devConfig.label,
                            devConfig.colorOn,
                            devConfig.colorOff,
                            devConfig.lightRadius,
                            devConfig.interactionCells,
                            cellSize,
                        ),
                    );
                }

                if (c === "E") {
                    makeExit(
                        this.world,
                        x * cellSize + cellSize * 0.15,
                        y * cellSize + cellSize * 0.05,
                        cellSize,
                        () => {
                            const next = this.levelIndex + 1;
                            if (
                                this.surgeWatts <
                                this.currentLevelData.surgeMaxWatts * 0.5
                            ) {
                                this.score += 150;
                            }
                            //this.loadLevel(next);
                        },
                    );
                }
            }
        }

        for (let i = 0; i < ghostCount; i++) {
            const g = withDynamic(
                createEntity({
                    id: `ghost-${i}`,
                    x: (cols - 2 - i) * cellSize + cellSize * 0.25,
                    y: (rows - 2) * cellSize + cellSize * 0.25,
                    width: cellSize * 0.38,
                    height: cellSize * 0.38,
                    priority: 3,
                    //text: new ColorTexture("black"),
                    text: new ImageTexture("/game/lightShadow/ghost1.png"),
                }),
                { speed: ghostSpeed },
            );
            this.world.addEntity(g);

            this.ghostControllers.push(
                new GhostController(g, this.world, () => this.devices, {
                    speed: ghostSpeed,
                    retargetEveryMs: 900,
                    arriveDist: 26,
                    interactMs: 650,
                }),
            );
        }

        this.camera.follow(this.player, this.world);
        this.isLoading = false;
    }
    clean(): void {}

    resizeScene(w: number, h: number): void {
        this.camera.resize(w, h);
    }

    handleInput(input: Record<string, boolean>): void {
        this.input = input;
        this.playerController.update(0, input);

        // Interaction: SPACE / ENTER => toggle OFF via zones interactables
        if (input[" "] || input["enter"]) {
            const target = this.world.getInteraction(this.player);
            if (target) {
                target.onInteract();
                // score si tu éteins (anti-surtension)
                this.score += 20;
            }
        }

        // Restart
        if (input["r"]) {
            // reload level
            const idx = this.levelIndex;
            this.levelIndex = idx - 1;
            // hack: re-init via next in update()
        }
    }

    update(deltaTime: number): void {
        if (this.input["r"]) {
            // reload current
            const idx = this.levelIndex;
            this.levelIndex = idx - 1;
            // force reload by jumping next map index + load in init logic:
            // easiest: just re-run init quickly not possible here; so do minimal:
            // (on recharge en avançant puis revenant via MAPS modulo)
            // => simple: setScene via scene engine? pas exposé ici.
            // Donc: on fait un "soft reset" en désactivant win/gameOver et éteignant tout + reposition
            this.gameOver = false;
            this.win = false;
            this.elapsed = 0;
            this.score = 0;
            this.devices.forEach((d) => d.toggle(false));
        }

        if (this.gameOver || this.win) return;

        this.elapsed += deltaTime;

        // player movement
        PhysicsSystem.move(this.player, deltaTime, this.world);

        // ghosts
        for (const gc of this.ghostControllers) gc.update(deltaTime);

        // move other dynamics
        this.world.dynamics.forEach((e) => {
            if (e.id === "player") return;
            if (String(e.id).startsWith("ghost-")) return; // ghost already moved in controller
            PhysicsSystem.move(e, deltaTime, this.world);
        });

        this.camera.follow(this.player, this.world);

        // compute surge
        this.surgeWatts = 0;
        for (const d of this.devices) if (d.isOn) this.surgeWatts += d.watts;

        if (this.surgeWatts >= this.currentLevelData.surgeMaxWatts) {
            this.gameOver = true;
            return;
        }

        if (this.elapsed >= this.currentLevelData.winTimeMs) {
            this.win = true;
            this.score += 500;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        // HARD RESET canvas state (évite bugs de composite/alpha/transform)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        // background écran
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // --- WORLD (camera space)
        this.camera.apply(ctx);
        this.world.render(ctx);

        //const ghostLights = this.world.dynamics
        //    .filter((e) => String(e.id).startsWith("ghost-"))
        //    .map((g) => ({
        //        x: g.x + g.width / 2,
        //        y: g.y + g.height / 2,
        //        radius: 1,
        //    }));

        const deviceLights = this.devices
            .filter((d) => d.isOn)
            .map((d) => ({
                x: d.x + d.width / 2,
                y: d.y + d.height / 2,
                radius: d.lightRadius * 0.4,
            }));
        const size = this.world.getSize();
        drawDarknessWithLights(
            ctx,
            size.width,
            size.height,
            this.world.solids,
            [...deviceLights], //...ghostLights,
            0.78,
        );

        this.camera.release(ctx);

        // --- UI overlay (screen space) : style Figma ---
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        const pad = 18;
        const top = 14;

        // Back arrow (visuel)
        drawBackArrow(ctx, pad, top + 2, 44);

        // Right pill "LEVEL / SCORE"
        const pillW = 210;
        const pillH = 34;
        const pillX = W - pad - pillW;
        const pillY = top;
        fillRoundRect(
            ctx,
            pillX,
            pillY,
            pillW,
            pillH,
            18,
            "rgba(255,255,255,0.25)",
        );
        strokeRoundRect(
            ctx,
            pillX,
            pillY,
            pillW,
            pillH,
            18,
            "rgba(255,255,255,0.65)",
            2,
        );

        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "600 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            `LEVEL ${this.levelIndex + 1}   SCORE`,
            pillX + pillW / 2,
            pillY + pillH / 2,
        );
        ctx.restore();

        // Bars position (center top)
        const barsX = Math.max(100, (W - 560) / 2);
        const barsY = top + 6;

        // --- Surge bar (cyan) with bolt ring ---
        const ringR = 18;
        const ringCx = barsX + ringR;
        const ringCy = barsY + ringR;

        drawRingIcon(ctx, ringCx, ringCy, ringR, "rgba(0,210,210,0.95)", () => {
            drawBolt(ctx, ringCx, ringCy, ringR * 1.2);
        });

        const bar1X = ringCx + ringR + 10;
        const bar1Y = barsY + 6;
        const bar1W = 230;
        const bar1H = 16;

        fillRoundRect(
            ctx,
            bar1X,
            bar1Y,
            bar1W,
            bar1H,
            8,
            "rgba(255,255,255,0.25)",
        );

        const surgeRatio = Math.max(
            0,
            Math.min(1, this.surgeWatts / this.currentLevelData.surgeMaxWatts),
        );
        drawSegmentBar(
            ctx,
            bar1X + 4,
            bar1Y + 3,
            bar1W - 8,
            bar1H - 6,
            14,
            surgeRatio,
            "rgba(0,220,220,0.95)",
            "rgba(0,220,220,0.25)",
        );

        // --- Secondary bar (grey) with red ring (bulb)
        const bar2X = bar1X + bar1W + 50;
        const bar2Y = bar1Y;
        const bar2W = 240;
        const bar2H = bar1H;

        const redRingCx = bar2X - 26;
        const redRingCy = ringCy;

        drawRingIcon(
            ctx,
            redRingCx,
            redRingCy,
            ringR,
            "rgba(255,70,70,0.95)",
            () => {
                drawBulb(ctx, redRingCx, redRingCy, ringR * 1.2);
            },
        );

        fillRoundRect(
            ctx,
            bar2X,
            bar2Y,
            bar2W,
            bar2H,
            8,
            "rgba(220,220,220,0.65)",
        );

        // Small numeric W info
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
            `W ${Math.floor(this.surgeWatts)}/${this.currentLevelData.surgeMaxWatts}`,
            bar1X + bar1W + 10,
            bar1Y + bar1H / 2,
        );
        ctx.restore();

        // Bottom hint
        const interaction = this.world.getInteraction(this.player);
        if (interaction && !this.gameOver && !this.win) {
            ctx.save();
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("SPACE: éteindre", W / 2, H - 20);
            ctx.restore();
        }

        // Game Over / Win overlay
        if (this.gameOver || this.win) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "28px Arial";
            ctx.fillText(
                this.gameOver ? "GAME OVER" : "VICTOIRE",
                W / 2,
                H / 2 - 10,
            );

            ctx.font = "16px Arial";
            ctx.fillText("Appuie sur R pour rejouer", W / 2, H / 2 + 24);
        }
    }
}
