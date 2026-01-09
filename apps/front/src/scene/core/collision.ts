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
  ent1: Square,
  ent2: Square,
  dx: number,
  dy: number
): { fx: number; fy: number } {
  let fx = 1,
    fy = 1;

  console.log("d", dx, dy);

  const overOnXAxis: boolean =
    ent1.x + ent1.width + dx > ent2.x && ent1.x + dx < ent2.x + ent2.width;
  const overOnYAxis: boolean =
    ent1.y + ent1.height + dy > ent2.y && ent1.y + dy < ent2.y + ent2.height;

  if (dx > 0 && overOnYAxis) {
    const gap1 = ent1.x + ent1.width + dx - ent2.x;
    const gap2 = ent1.x + dx - ent2.x - ent2.width;
    console.log("gapXU ", gap1, gap2);
    if (gap1 > 0 && gap2 < 0) fx = Math.min(fx, (dx - gap1) / dx);
  } else if (dx < 0 && overOnYAxis) {
    const gap1 = ent2.x + ent2.width - ent1.x - dx;
    const gap2 = ent1.x + ent1.width + dx - ent2.x;
    console.log("gapXD ", gap1, gap2);
    if (gap1 > 0 && gap2 < 0) fx = Math.min(fx, (dx - gap1) / dx);
  }

  if (dy > 0 && overOnXAxis) {
    const gap1 = ent1.y + ent1.height + dy - ent2.y;
    const gap2 = ent2.height + ent2.y - ent1.y - dy;
    console.log("gapYD ", gap1, gap2);
    if (gap1 > 0 && gap2 < 0) fy = Math.min(fy, (dy - gap1) / dy);
  } else if (dy < 0 && overOnXAxis) {
    const gap1 = ent2.y + ent2.height - ent1.y - dy;
    const gap2 = ent2.y - dy - ent1.y - ent1.height;
    console.log("gapYU ", gap1, gap2);
    if (gap1 > 0 && gap2 < 0) fy = Math.min(fy, (dy - gap1) / dy);
  }

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
