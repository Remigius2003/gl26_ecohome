// world-id-serial.ts
// ID-first model to avoid cycles. Uses fetch to POST/GET JSON payloads.

import { Entity } from "@scene/core/types";

/* -------------------------
   Domain types (ID-first)
   ------------------------- */

export interface Item {
    id: string;
    categoryIds: string[];
    weight: number;
    image: string;
}

export interface Category {
    id: string;
    itemIds: string[];
    image: string;
    name: string;
}

export interface Effect {
    points?: number;
    time?: number;
    [key: string]: any;
}

export type ResourceRef = {
    id: string;
    type: "item" | "category";
};

export interface Transformer {
    id: string;
    craft: Array<{
        source: ResourceRef;
        resultItemId: string;
        quantity: number;
    }>;
    image: string;
}

export interface Receiver {
    id: string;
    process: Array<{ source: ResourceRef; effect: Effect }>;
    image: string;
}

export interface Position {
    x: number;
    y: number;
}

/* -------------------------
   World payload shape (JSON-friendly)
   ------------------------- */

export interface WorldPayload {
    worldSizeX: number;
    worldSizeY: number;
    playerSpawn: Position;
    priorities: Record<number, Entity>;

    items: Item[];
    categories: Category[];
    receivers: Array<{ receiver: Receiver; position: Position }>;
    transformers: Array<{ transformer: Transformer; position: Position }>;

    // spawn areas expressed with item ids
    itemsPerSpawnArea: Array<{ itemIds: string[]; positions: Position[] }>;
}

/* -------------------------
   GameWorld runtime class
   ------------------------- */

export interface WorldPayload {
    worldSizeX: number;
    worldSizeY: number;

    initialTime: number;
    finalPoints: number;

    playerSpawn: Position;
    priorities: Record<number, Entity>;
    items: Item[];
    categories: Category[];
    receivers: Array<{ receiver: Receiver; position: Position }>;
    transformers: Array<{ transformer: Transformer; position: Position }>;
    itemsPerSpawnArea: Array<{ itemIds: string[]; positions: Position[] }>;
}
/* -------------------------
   GameWorld runtime class
   ------------------------- */
export class GameWorld {
    worldSizeX: number;
    worldSizeY: number;

    // CONFIGURATION
    initialTime: number;
    finalPoints: number;

    playerSpawn: Position;
    priorities: Record<number, Entity>;
    items: Item[];
    categories: Category[];
    receivers: Array<{ receiver: Receiver; position: Position }>;
    transformers: Array<{ transformer: Transformer; position: Position }>;
    itemsPerSpawnArea: Array<{ itemIds: string[]; positions: Position[] }>;

    itemsById: Map<string, Item>;
    categoriesById: Map<string, Category>;
    receiversById: Map<string, Receiver>;
    transformersById: Map<string, Transformer>;

    constructor(payload?: Partial<WorldPayload>) {
        this.worldSizeX = payload?.worldSizeX ?? 100;
        this.worldSizeY = payload?.worldSizeY ?? 100;

        // Defaults
        this.initialTime = payload?.initialTime ?? 300000;
        this.finalPoints = payload?.finalPoints ?? 100;

        this.playerSpawn = payload?.playerSpawn ?? { x: 0, y: 0 };
        this.priorities = payload?.priorities ?? {};

        this.items = payload?.items ?? [];
        this.categories = payload?.categories ?? [];
        this.receivers = payload?.receivers ?? [];
        this.transformers = payload?.transformers ?? [];
        this.itemsPerSpawnArea = payload?.itemsPerSpawnArea ?? [];

        // Build lookups
        this.itemsById = new Map(this.items.map((it) => [it.id, it]));
        this.categoriesById = new Map(this.categories.map((c) => [c.id, c]));
        this.receiversById = new Map(
            this.receivers.map(({ receiver }) => [receiver.id, receiver]),
        );
        this.transformersById = new Map(
            this.transformers.map(({ transformer }) => [
                transformer.id,
                transformer,
            ]),
        );

        this._syncCategoryItemEdges();
    }

    private _syncCategoryItemEdges() {
        // Ensure category.itemIds lists all items that reference a category
        const map: Record<string, string[]> = {};
        for (const it of this.items) {
            for (const cid of it.categoryIds) {
                if (!map[cid]) map[cid] = [];
                map[cid].push(it.id);
            }
        }
        for (const cat of this.categories) {
            cat.itemIds = map[cat.id] ?? [];
        }
    }

    /* -------------------------
     Serialise: POST/PUT JSON to server
     ------------------------- */
    static async serialise(
        path: string,
        gw: GameWorld,
        method: "POST" | "PUT" = "POST",
    ): Promise<Response> {
        const payload: WorldPayload = {
            worldSizeX: gw.worldSizeX,
            worldSizeY: gw.worldSizeY,
            initialTime: gw.initialTime,
            finalPoints: gw.finalPoints,
            playerSpawn: gw.playerSpawn,
            priorities: gw.priorities,
            items: gw.items,
            categories: gw.categories,
            receivers: gw.receivers,
            transformers: gw.transformers,
            itemsPerSpawnArea: gw.itemsPerSpawnArea,
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
     Unserialise: GET JSON from server and return GameWorld
     ------------------------- */
    static async unserialise(path: string): Promise<GameWorld> {
        const res = await fetch(path, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
        if (!res.ok)
            throw new Error(
                `Failed to fetch world JSON: ${res.status} ${res.statusText}`,
            );
        const data = (await res.json()) as WorldPayload;

        if (!Array.isArray(data.items) || !Array.isArray(data.categories)) {
            throw new Error(
                "Invalid world payload: items and categories arrays are required.",
            );
        }

        // Reconstruct the GameWorld instance (constructor will create lookups and sync edges)
        const gw = new GameWorld({
            worldSizeX: data.worldSizeX,
            worldSizeY: data.worldSizeY,
            playerSpawn: data.playerSpawn,
            priorities: data.priorities,
            items: data.items,
            categories: data.categories,
            receivers: data.receivers,
            transformers: data.transformers,
            itemsPerSpawnArea: data.itemsPerSpawnArea,
        });

        return gw;
    }

    /* -------------------------
     Helpers: resolve a ResourceRef to the actual object
     ------------------------- */
    getResourceByRef(ref: ResourceRef): Item | Category | undefined {
        if (ref.type === "item") return this.itemsById.get(ref.id);
        return this.categoriesById.get(ref.id);
    }
}
