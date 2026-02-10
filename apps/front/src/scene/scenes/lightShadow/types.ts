// world-id-serial.ts
// ID-first model to avoid cycles. Uses fetch to POST/GET JSON payloads.

import { Entity } from "@scene/core/types";

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
    decoration: Record<number, Entity>;
    electrical: Record<number, Entity>;
}
