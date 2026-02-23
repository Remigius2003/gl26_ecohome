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
    y2: number,
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
    solids: (Entity & Solid)[],
): Point {
    let bestT = maxDist;
    let hit: Point = {
        x: origin.x + dir.x * maxDist,
        y: origin.y + dir.y * maxDist,
    };

    for (const s of solids) {
        const x = s.x,
            y = s.y,
            w = s.width,
            h = s.height;

        // rectangle edges
        const edges: [number, number, number, number][] = [
            [x, y, x + w, y], // top
            [x + w, y, x + w, y + h], // right
            [x + w, y + h, x, y + h], // bottom
            [x, y + h, x, y], // left
        ];

        for (const [x1, y1, x2, y2] of edges) {
            const inter = raySegmentIntersection(
                origin.x,
                origin.y,
                dir.x,
                dir.y,
                x1,
                y1,
                x2,
                y2,
            );
            if (!inter) continue;
            if (inter.t < bestT) {
                bestT = inter.t;
                hit = {
                    x: origin.x + dir.x * bestT,
                    y: origin.y + dir.y * bestT,
                };
            }
        }
    }

    return hit;
}

export function computeVisibilityPolygon(
    origin: Point,
    radius: number,
    solids: (Entity & Solid)[],
    rays: number = 220,
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
    darknessAlpha: number = 0.85, // Slightly darker to make the colored lights pop
) {
    ctx.save();

    // 1) draw darkness over the whole world
    ctx.globalAlpha = darknessAlpha;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    for (const l of lights) {
        if (!l.radius || l.radius <= 0) continue;

        const poly = computeVisibilityPolygon(
            { x: l.x, y: l.y },
            l.radius,
            solids,
        );

        // --- STEP A: Cut the hole (Restricted to walls) ---
        ctx.save();
        ctx.beginPath();
        if (poly.length > 0) {
            ctx.moveTo(poly[0].x, poly[0].y);
            for (let i = 1; i < poly.length; i++)
                ctx.lineTo(poly[i].x, poly[i].y);
        }
        ctx.closePath();
        ctx.clip(); // Keep the "clearing" inside the room

        ctx.globalCompositeOperation = "destination-out";
        const cutGradient = ctx.createRadialGradient(
            l.x,
            l.y,
            0,
            l.x,
            l.y,
            l.radius,
        );
        cutGradient.addColorStop(0, "rgba(0,0,0,0.9)");
        cutGradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cutGradient;
        ctx.fillRect(
            l.x - l.radius,
            l.y - l.radius,
            l.radius * 2,
            l.radius * 2,
        );
        ctx.restore(); // <--- CLIP ENDS HERE

        // --- STEP B: The Atmospheric Glow (Spills over borders) ---
        // We draw this OUTSIDE the clip so it bleeds onto the black mask over walls
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        let tintCenter: string;
        if (l.radius > 200) tintCenter = "rgba(255,50,50,0.3)";
        else if (l.radius >= 100) tintCenter = "rgba(255,140,0,0.25)";
        else tintCenter = "rgba(255,240,200,0.2)";

        const colorGradient = ctx.createRadialGradient(
            l.x,
            l.y,
            0,
            l.x,
            l.y,
            l.radius * 1.5,
        ); // 20% larger glow
        colorGradient.addColorStop(0, tintCenter);
        colorGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = colorGradient;
        // We draw a slightly larger area for the glow to spill out
        ctx.fillRect(
            l.x - l.radius * 1.2,
            l.y - l.radius * 1.2,
            l.radius * 2.4,
            l.radius * 2.4,
        );
        ctx.restore();
    }

    ctx.restore(); // Restores global context
}
