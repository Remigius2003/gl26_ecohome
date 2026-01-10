import { Square } from "./types";

export function checkAABB(ent1: Square, ent2: Square): boolean {
  return (
    ent1.x < ent2.x + ent2.width &&
    ent1.x + ent1.width > ent2.x &&
    ent1.y < ent2.y + ent2.height &&
    ent1.y + ent1.height > ent2.y
  );
}

export function computeMovementFractionAABB(
  ent: Square,
  tar: Square,
  dx: number,
  dy: number
): { fx: number; fy: number } {
  let fx = 1,
    fy = 1;

  let leftGap = ent.x + ent.width - tar.x;
  let topGap = ent.y + ent.height - tar.y;
  let rightGap = tar.x + tar.width - ent.x;
  let bottomGap = tar.y + tar.height - ent.y;

  if (
    dx > 0 &&
    leftGap + dx >= 0 &&
    rightGap > 0 &&
    topGap > 0 &&
    bottomGap > 0
  )
    fx = Math.min(fx, -leftGap / dx);

  if (
    dx < 0 &&
    leftGap > 0 &&
    rightGap - dx >= 0 &&
    topGap > 0 &&
    bottomGap > 0
  )
    fx = Math.min(fx, (rightGap - 2 * dx) / dx);

  if (
    dy < 0 &&
    leftGap > 0 &&
    rightGap > 0 &&
    topGap > 0 &&
    bottomGap - dy >= 0
  )
    fy = Math.min(fy, (bottomGap - 2 * dy) / dy);

  if (
    dy > 0 &&
    leftGap > 0 &&
    rightGap > 0 &&
    topGap + dy >= 0 &&
    bottomGap > 0
  )
    fy = Math.min(fy, topGap / dy);

  fx = Math.max(fx, 0);
  fy = Math.max(fy, 0);

  return { fx, fy };
}

export function checkCircle(ent1: Square, ent2: Square): boolean {
  return (
    Math.pow(ent1.x - ent2.x + 0.5 * (ent1.width - ent2.width), 2) +
      Math.pow(ent1.y - ent2.y + 0.5 * (ent1.height - ent2.height), 2) <
    0.25 * Math.pow(ent1.width + ent2.width, 2) +
      0.25 * Math.pow(ent1.height + ent2.height, 2)
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
