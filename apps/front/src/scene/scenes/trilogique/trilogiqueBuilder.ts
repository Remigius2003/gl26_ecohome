import { World } from "../../logic/world";
import { createEntity, createSolid } from "../../logic/factory";
import { ImageTexture } from "../../core/texture";
import { GameWorld } from "./types";

export class TrilogiqueBuilder {
    static setupBackground(
        world: World,
        gameWorldData: GameWorld,
        cellSize: number,
    ) {
        const texturePath =
            (gameWorldData as any).groundTexture ||
            "/game/trilogique/images/env/grass1.png";

        for (let x = 0; x < gameWorldData.worldSizeX; x++) {
            for (let y = 0; y < gameWorldData.worldSizeY; y++) {
                const floor = createEntity({
                    id: `floor-${x}-${y}`,
                    x: x * cellSize,
                    y: y * cellSize,
                    width: cellSize,
                    height: cellSize,
                    text: new ImageTexture(texturePath),
                    priority: 1,
                });
                world.addEntity(floor);
            }
        }
    }

    static setupBoundaries(
        world: World,
        gameWorldData: GameWorld,
        cellSize: number,
    ) {
        const w = gameWorldData.worldSizeX;
        const h = gameWorldData.worldSizeY;

        // Different images for each side
        const borderImgTop = "/game/trilogique/images/env/mountain_top.png";
        const borderImgBottom = "/game/trilogique/images/env/moutain.png";
        const borderImgLeft = "/game/trilogique/images/env/mountain_left.png";
        const borderImgRight = "/game/trilogique/images/env/mountain_right.png";

        // Different images for the 4 corners
        const borderImgTopLeft = "/game/trilogique/images/env/corner_top.png";
        const borderImgTopRight = "/game/trilogique/images/env/corner_top.png";
        const borderImgBottomLeft = "/game/trilogique/images/env/corner.png";
        const borderImgBottomRight = "/game/trilogique/images/env/corner.png";

        const createBorderTile = (
            x: number,
            y: number,
            imgPath: string,
            id: string,
        ) => {
            const block = createSolid({
                id: `border-${id}`,
                x: x * cellSize,
                y: y * cellSize,
                width: cellSize,
                height: cellSize,
                text: new ImageTexture(imgPath),
                priority: 100,
            });
            world.addEntity(block);
        };

        // 1. Draw the 4 corners individually
        createBorderTile(0, 0, borderImgTopLeft, "top-left");
        createBorderTile(w - 1, 0, borderImgTopRight, "top-right");
        createBorderTile(0, h - 1, borderImgBottomLeft, "bottom-left");
        createBorderTile(w - 1, h - 1, borderImgBottomRight, "bottom-right");

        // 2. Draw TOP and BOTTOM (skipping corners: start at 1, stop at w - 2)
        for (let x = 1; x < w - 1; x++) {
            createBorderTile(x, 0, borderImgTop, `top-${x}`);
            createBorderTile(x, h - 1, borderImgBottom, `bottom-${x}`);
        }

        // 3. Draw LEFT and RIGHT (skipping corners: start at 1, stop at h - 2)
        for (let y = 1; y < h - 1; y++) {
            createBorderTile(0, y, borderImgLeft, `left-${y}`);
            createBorderTile(w - 1, y, borderImgRight, `right-${y}`);
        }
    }

    static setupStaticMap(
        world: World,
        gameWorldData: GameWorld,
        cellSize: number,
    ) {
        Object.values(gameWorldData.priorities).forEach((entityData: any) => {
            const texturePath =
                entityData.text || entityData.image || "wall.png";

            if (entityData.walkable) {
                const ent = createEntity({
                    id: entityData.id || "decor",
                    x: entityData.x * cellSize,
                    y: entityData.y * cellSize,
                    width: (entityData.width || 1) * cellSize,
                    height: (entityData.height || 1) * cellSize,
                    text: new ImageTexture(texturePath),
                    priority: entityData.priority || 1,
                });
                world.addEntity(ent);
            } else {
                const ent = createSolid({
                    id: entityData.id || "static",
                    x: entityData.x * cellSize,
                    y: entityData.y * cellSize,
                    width: (entityData.width || 1) * cellSize,
                    height: (entityData.height || 1) * cellSize,
                    text: new ImageTexture(texturePath),
                    priority: entityData.priority || 10,
                });
                world.addEntity(ent);
            }
        });
    }
}
