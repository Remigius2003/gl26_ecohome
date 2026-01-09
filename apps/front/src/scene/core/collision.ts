import { Entity } from "./types";

export function checkAABB(rect1: Entity, rect2: Entity): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function getDistSquared(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
}

export function getDist(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(getDistSquared(p1, p2));
}
