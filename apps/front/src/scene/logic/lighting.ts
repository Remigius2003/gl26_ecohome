import type { Entity, Solid } from "../core/types";

type Point = { x: number; y: number };

function raySegmentIntersection(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { t: number; u: number } | null {
  // Ray: O + t*D, Segment: A + u*(B-A)
  const rdx = dx;
  const rdy = dy;
  const sdx = x2 - x1;
  const sdy = y2 - y1;

  const denom = rdx * sdy - rdy * sdx;
  if (Math.abs(denom) < 1e-9) return null;

  const ax = x1 - ox;
  const ay = y1 - oy;

  const t = (ax * sdy - ay * sdx) / denom;
  const u = (ax * rdy - ay * rdx) / denom;

  if (t >= 0 && u >= 0 && u <= 1) return { t, u };
  return null;
}

function castRayToSolids(
  origin: Point,
  dir: Point,
  maxDist: number,
  solids: (Entity & Solid)[]
): Point {
  let bestT = maxDist;
  let hit: Point = { x: origin.x + dir.x * maxDist, y: origin.y + dir.y * maxDist };

  for (const s of solids) {
    const x = s.x, y = s.y, w = s.width, h = s.height;

    // rectangle edges
    const edges: [number, number, number, number][] = [
      [x, y, x + w, y],         // top
      [x + w, y, x + w, y + h], // right
      [x + w, y + h, x, y + h], // bottom
      [x, y + h, x, y],         // left
    ];

    for (const [x1, y1, x2, y2] of edges) {
      const inter = raySegmentIntersection(origin.x, origin.y, dir.x, dir.y, x1, y1, x2, y2);
      if (!inter) continue;
      if (inter.t < bestT) {
        bestT = inter.t;
        hit = { x: origin.x + dir.x * bestT, y: origin.y + dir.y * bestT };
      }
    }
  }

  return hit;
}

export function computeVisibilityPolygon(
  origin: Point,
  radius: number,
  solids: (Entity & Solid)[],
  rays: number = 220
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const dir = { x: Math.cos(a), y: Math.sin(a) };
    pts.push(castRayToSolids(origin, dir, radius, solids));
  }
  return pts;
}

export function drawDarknessWithLights(
  ctx: CanvasRenderingContext2D,
  worldWidth: number,
  worldHeight: number,
  solids: (Entity & Solid)[],
  lights: { x: number; y: number; radius: number }[],
  darknessAlpha: number = 0.78
) {
  ctx.save();

  // 1) draw darkness over whole world
  ctx.globalAlpha = darknessAlpha;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, worldWidth, worldHeight);

  // 2) cut holes where light exists (occluded by solids)
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";

  for (const l of lights) {
    const poly = computeVisibilityPolygon({ x: l.x, y: l.y }, l.radius, solids);

    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
    ctx.fill();

    // small soft edge (optional)
    const g = ctx.createRadialGradient(l.x, l.y, l.radius * 0.65, l.x, l.y, l.radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
