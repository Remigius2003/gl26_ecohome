const MAP_KEY = "home_map_v2";
const FLOOR_KEY = "home_floor_v1";
const WALL_KEY = "home_wall_v1";
const FLOOR_LAYER_KEY = "home_floor_layer_v1";

export const GRID_COLS = 32;
export const GRID_ROWS = 32;
export const CELL_SIZE = 96;

export const DEFAULT_ASCII_MAP: string[] = [
    "#################d##############",
    "#UU....MM..#...........EEEEEEEE#",
    "#UU....MM..#...........EEEEEEEE#",
    "#UU........#........############",
    "#..........#........#........OO#",
    "#..........#........#........OO#",
    "#..........#........#..........#",
    "#..........#........#.....TTT..#",
    "#................... .....TTT..#",
    "#.........................TTT..#",
    "#####I######........############",
    "#DD........#........#.......JJJ#",
    "#DD........#........#.......JJJ#",
    "#..............................#",
    "#..............................#",
    "#...BBBB...#........#..........#",
    "#...BBBB...#........#..........#",
    "#...BBBB...#........#..........#",
    "#...BBBB...#........#..........#",
    "#..........#........#..........#",
    "#..........#........#..........#",
    "#..........#.......p#..........#",
    "#..........#.......p#..........#",
    "#..........#........#.....V....#",
    "#..........#l.......#..........#",
    "#..........#........#.....SS...#",
    "#..........#........#..........#",
    "#..........#....P...#..........#",
    "#tt........#........#..........#",
    "#tt........#...RR...#..........#",
    "#..........#...RR...#..........#",
    "################################",
];

const DEFAULT_FLOOR_LAYER: string[] = Array(GRID_ROWS).fill(
    ".".repeat(GRID_COLS),
);

export interface TextureOption {
    id: string;
    label: string;
    path: string;
    preview: string;
}

export const FLOOR_OPTIONS: TextureOption[] = [
    {
        id: "wood",
        label: "Parquet",
        path: "house/floor/wood.png",
        preview: "#d4a96a",
    },
    {
        id: "dark",
        label: "Parquet foncé",
        path: "house/floor/dark-wood.png",
        preview: "#8B5e3c",
    },
    {
        id: "tile",
        label: "Carrelage",
        path: "house/floor/tile.png",
        preview: "#cfd8dc",
    },
    {
        id: "carpet",
        label: "Moquette",
        path: "house/floor/carpet.png",
        preview: "#7986cb",
    },
    {
        id: "marble",
        label: "Marbre",
        path: "house/floor/marble.png",
        preview: "#eceff1",
    },
];

export const WALL_OPTIONS: TextureOption[] = [
    {
        id: "wood",
        label: "Bois clair",
        path: "house/wall/wood.png",
        preview: "#a1887f",
    },
    {
        id: "brick",
        label: "Brique",
        path: "house/wall/brick.png",
        preview: "#b55339",
    },
    {
        id: "stone",
        label: "Pierre",
        path: "house/wall/stone.png",
        preview: "#90a4ae",
    },
    {
        id: "plaster",
        label: "Plâtre",
        path: "house/wall/plaster.png",
        preview: "#f5f0eb",
    },
];

export const FLOOR_CHARS = [".", "w", "d", "t", "c", "m"] as const;
export type FloorChar = (typeof FLOOR_CHARS)[number];

export const FLOOR_CHAR_TO_PATH: Record<FloorChar, string | null> = {
    ".": null,
    w: "house/floor/wood.png",
    d: "house/floor/dark-wood.png",
    t: "house/floor/tile.png",
    c: "house/floor/carpet.png",
    m: "house/floor/marble.png",
};

export const FLOOR_CHAR_PREVIEW: Record<FloorChar, string> = {
    ".": "#d4a96a",
    w: "#d4a96a",
    d: "#8B5e3c",
    t: "#cfd8dc",
    c: "#7986cb",
    m: "#eceff1",
};

export const FLOOR_CHAR_LABEL: Record<FloorChar, string> = {
    ".": "Défaut",
    w: "Parquet",
    d: "Parquet foncé",
    t: "Carrelage",
    c: "Moquette",
    m: "Marbre",
};

export function getAsciiMap(): string[] {
    try {
        const raw = localStorage.getItem(MAP_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed) && parsed.length === GRID_ROWS)
                return parsed;
        }
    } catch {}
    return [...DEFAULT_ASCII_MAP];
}
export function saveAsciiMap(map: string[]) {
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
}
export function resetAsciiMap() {
    localStorage.removeItem(MAP_KEY);
}

export function getFloorLayerMap(): string[] {
    try {
        const raw = localStorage.getItem(FLOOR_LAYER_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed) && parsed.length === GRID_ROWS)
                return parsed;
        }
    } catch {}
    return [...DEFAULT_FLOOR_LAYER];
}
export function saveFloorLayerMap(map: string[]) {
    localStorage.setItem(FLOOR_LAYER_KEY, JSON.stringify(map));
}
export function resetFloorLayerMap() {
    localStorage.removeItem(FLOOR_LAYER_KEY);
}

export function getFloorTexture(): TextureOption {
    const id = localStorage.getItem(FLOOR_KEY) ?? "wood";
    return FLOOR_OPTIONS.find((f) => f.id === id) ?? FLOOR_OPTIONS[0];
}
export function saveFloorTexture(id: string) {
    localStorage.setItem(FLOOR_KEY, id);
}

export function getWallTexture(): TextureOption {
    const id = localStorage.getItem(WALL_KEY) ?? "wood";
    return WALL_OPTIONS.find((w) => w.id === id) ?? WALL_OPTIONS[0];
}
export function saveWallTexture(id: string) {
    localStorage.setItem(WALL_KEY, id);
}

export const ASCII_MAP = DEFAULT_ASCII_MAP;
