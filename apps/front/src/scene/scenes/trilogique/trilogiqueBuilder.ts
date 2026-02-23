import { World } from "../../logic/world";
import { createEntity, createSolid } from "../../logic/factory";
import { ImageTexture, ColorTexture } from "../../core/texture";
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

        const createBorderBlock = (
            x: number,
            y: number,
            width: number,
            height: number,
            id: string,
        ) => {
            const block = createSolid({
                id: `border-${id}`,
                x: x * cellSize,
                y: y * cellSize,
                width: width * cellSize,
                height: height * cellSize,
                text: new ColorTexture("black"),
                priority: 100,
            });
            world.addEntity(block);
        };

        createBorderBlock(0, 0, w + 2, 1, "top");
        createBorderBlock(0, h - 1, w + 2, 1, "bottom");
        createBorderBlock(0, 0, 1, h, "left");
        createBorderBlock(w, 0, 1, h, "right");
    }

    static setupStaticMap(
        world: World,
        gameWorldData: GameWorld,
        cellSize: number,
    ) {
        Object.values(gameWorldData.priorities).forEach((entityData: any) => {
            const texturePath =
                entityData.text || entityData.image || "wall.png";

            const config = {
                id: entityData.id || "decor",
                x: entityData.x * cellSize,
                y: entityData.y * cellSize,
                width: (entityData.width || 1) * cellSize,
                height: (entityData.height || 1) * cellSize,
                text: new ImageTexture(texturePath),
                priority: entityData.priority || (entityData.walkable ? 1 : 10),
            };

            const ent = entityData.walkable
                ? createEntity(config)
                : createSolid(config);
            world.addEntity(ent);
        });
    }
}
