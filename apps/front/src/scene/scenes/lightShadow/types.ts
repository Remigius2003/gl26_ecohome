// scenes/lightshadow/types.ts

/* -------------------------
   Domain types
   ------------------------- */

export interface DeviceConfig {
    char: string; // The character in the ASCII map (e.g., 'L', 'A')
    watts: number;
    label: string;
    image: string; // Path to image texture (single texture, not on/off)
    imageSize: number; // Size multiplier for the image (0.5 = 50% of cell size)
    lightRadius: number;
    interactionCells: number;
}

/* -------------------------
   Level payload shape (JSON-friendly)
   ------------------------- */

export interface LevelPayload {
    id: string;

    // Grid & Visuals
    cellSize: number;
    wallTexture: string;
    floorTexture: string;

    // Level Rules
    surgeMaxWatts: number;
    winTimeMs: number;
    ghostCount: number;
    ghostSpeed: number;

    // Entity Definitions & Layout
    devices: DeviceConfig[];
    map: string[];
}

/* -------------------------
   LightShadowLevel runtime class
   ------------------------- */
export class LightShadowLevel {
    id: string;
    cellSize: number;
    wallTexture: string;
    floorTexture: string;

    surgeMaxWatts: number;
    winTimeMs: number;
    ghostCount: number;
    ghostSpeed: number;

    devices: DeviceConfig[];
    map: string[];

    // Runtime lookups
    devicesByChar: Map<string, DeviceConfig>;

    constructor(payload?: Partial<LevelPayload>) {
        this.id = payload?.id ?? "default-level";

        // Grid Defaults
        this.cellSize = payload?.cellSize ?? 96;
        this.wallTexture = payload?.wallTexture ?? "/house/wall/wood.png";
        this.floorTexture = payload?.floorTexture ?? "/house/floor/wood.png";

        // Game Rule Defaults
        this.surgeMaxWatts = payload?.surgeMaxWatts ?? 900;
        this.winTimeMs = payload?.winTimeMs ?? 60000;
        this.ghostCount = payload?.ghostCount ?? 1;
        this.ghostSpeed = payload?.ghostSpeed ?? 220;

        // Fallback ASCII map if none is provided
        this.map = payload?.map ?? [
            "################################",
            "#..P...............L......E....#",
            "#...........####...............#",
            "#...........#..#...............#",
            "#.....A.....#..#.....L.........#",
            "################################",
        ];

        // Default device configurations mapped to ASCII characters
        this.devices = payload?.devices ?? [
            {
                char: "L",
                watts: 220,
                label: "Lampe",
                image: "/lights/lamp.png",
                imageSize: 0.7,
                lightRadius: 280,
                interactionCells: 1,
            },
            {
                char: "A",
                watts: 320,
                label: "Appareil",
                image: "/lights/appliance.png",
                imageSize: 0.7,
                lightRadius: 220,
                interactionCells: 1,
            },
        ];

        // Build O(1) lookup for parsing the map
        this.devicesByChar = new Map(this.devices.map((d) => [d.char, d]));
    }

    /* -------------------------
     Serialise: POST/PUT JSON to server
     ------------------------- */
    static async serialise(
        path: string,
        level: LightShadowLevel,
        method: "POST" | "PUT" = "POST",
    ): Promise<Response> {
        const payload: LevelPayload = {
            id: level.id,
            cellSize: level.cellSize,
            wallTexture: level.wallTexture,
            floorTexture: level.floorTexture,
            surgeMaxWatts: level.surgeMaxWatts,
            winTimeMs: level.winTimeMs,
            ghostCount: level.ghostCount,
            ghostSpeed: level.ghostSpeed,
            devices: level.devices,
            map: level.map,
        };

        const res = await fetch(path, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload, null, 2),
        });
        if (!res.ok) throw new Error("Serialise failed");
        return res;
    }

    /* -------------------------
     Unserialise: GET JSON from server and return LightShadowLevel
     ------------------------- */
    static async unserialise(path: string): Promise<LightShadowLevel> {
        const res = await fetch(path, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
        if (!res.ok) {
            throw new Error(
                `Failed to fetch level JSON: ${res.status} ${res.statusText}`,
            );
        }

        const data = (await res.json()) as LevelPayload;

        if (!Array.isArray(data.map) || !Array.isArray(data.devices)) {
            throw new Error(
                "Invalid level payload: map and devices arrays are required.",
            );
        }

        return new LightShadowLevel(data);
    }
}
