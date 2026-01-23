import { OBJECT_DEFS, INTERACTION_DEFS } from "./home.objects";

export function findPlayerSpawn(map: string[]) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === "P") return { x, y };
        }
    }
    return { x: 1, y: 1 };
}

export function generateWallsFromAscii(
    map: string[],
    cellSize: number,
    addWall: (
        id: string,
        x: number,
        y: number,
        w: number,
        h: number,
        priority: number,
        texturePath: string, // NEW
    ) => void,
) {
    let id = 0;

    const height = map.length;

    map.forEach((row, y) =>
        [...row].forEach((char, x) => {
            if (char !== "#") return;

            const hasWallAbove = y > 0 && map[y - 1][x] === "#";
            const hasWallBelow = y < height - 1 && map[y + 1][x] === "#";

            const texturePath =
                hasWallAbove && hasWallBelow
                    ? "house/wall/wood2.png"
                    : "house/wall/wood.png";

            addWall(
                `wall-${id++}`,
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize,
                4,
                texturePath,
            );
        }),
    );
}

export function generateObjectsFromAscii(
    map: string[],
    cellSize: number,
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
    const visited = map.map((row) => Array(row.length).fill(false));
    let id = 0;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const char = map[y][x];
            const def = OBJECT_DEFS[char];
            if (!def || visited[y][x]) continue;

            for (let dy = 0; dy < def.height; dy++) {
                for (let dx = 0; dx < def.width; dx++) {
                    const vy = y + dy;
                    const vx = x + dx;

                    if (visited[vy] && visited[vy][vx] !== undefined) {
                        visited[vy][vx] = true;
                    }
                }
            }

            addObject(
                `object-${char}-${id++}`,
                x * cellSize,
                y * cellSize,
                def.width * cellSize,
                def.height * cellSize,
                def.texture,
                !!def.solid,
            );
        }
    }
}

export function generateInteractionsFromAscii(
    map: string[],
    cellSize: number,
    addInteraction: (
        id: string,
        x: number,
        y: number,
        w: number,
        h: number,
        texture: string | undefined,
        priority: number,
        onInteract: () => void,
    ) => void,
) {
    const visited = map.map((row) => Array(row.length).fill(false));
    let id = 0;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const char = map[y][x];
            const def = INTERACTION_DEFS[char];
            if (!def || visited[y][x]) continue;

            for (let dy = 0; dy < def.height; dy++) {
                for (let dx = 0; dx < def.width; dx++) {
                    const vy = y + dy;
                    const vx = x + dx;

                    if (visited[vy] && visited[vy][vx] !== undefined) {
                        visited[vy][vx] = true;
                    }
                }
            }

            addInteraction(
                `interaction-${char}-${id++}`,
                x * cellSize,
                y * cellSize,
                def.width * cellSize,
                def.height * cellSize,
                def.texture,
                def.priority,
                def.onInteract,
            );
        }
    }
}
