import { Character } from "../core/types";
import { ColorTexture, ImageTexture } from "../core/texture";
import { createCharacter } from "../logic/factory";
import { createEntity } from "../logic/factory";

export function createFloorTile(
    id: string,
    x: number,
    y: number,
    size: number,
) {
    return createEntity({
        id,
        x,
        y,
        width: size,
        height: size,
        priority: 0,
        text: new ImageTexture("/house/floor/wood.png"),
    });
}

export function createPlayer(x: number, y: number, size: number): Character {
    return createCharacter({
        id: "player",
        x,
        y,
        width: size * 0.5,
        height: size * 0.5,
        speed: 400,
        text: new ColorTexture("#4fc3f7", "white"),
    });
}

export function createGuideNPC(): Character {
    return createCharacter({
        id: "guide-npc",
        x: 300,
        y: 200,
        width: 60,
        height: 60,
        speed: 150,
        text: new ImageTexture("/scene/npc.png"),
    });
}
