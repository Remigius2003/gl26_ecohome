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
  console.log("==== DEBUG START ====");

  let fx = 1;
  let fy = 1;

  // --- STEP 1: Edges of both boxes ---
  const aLeft = ent1.x;
  const aRight = ent1.x + ent1.width;
  const aTop = ent1.y;
  const aBottom = ent1.y + ent1.height;

  const bLeft = ent2.x;
  const bRight = ent2.x + ent2.width;
  const bTop = ent2.y;
  const bBottom = ent2.y + ent2.height;

  console.log("A edges:", { aLeft, aRight, aTop, aBottom });
  console.log("B edges:", { bLeft, bRight, bTop, bBottom });
  console.log("Delta move:", { dx, dy });

  // --- STEP 2: Swept ranges (future position) ---
  const sweptALeft = dx > 0 ? aLeft : aLeft + dx;
  const sweptARight = dx > 0 ? aRight + dx : aRight;
  const sweptATop = dy > 0 ? aTop : aTop + dy;
  const sweptABottom = dy > 0 ? aBottom + dy : aBottom;

  console.log("Swept A range:", {
    sweptALeft,
    sweptARight,
    sweptATop,
    sweptABottom,
  });

  // --- STEP 3: Check if obstacle is relevant for movement ---
  const obstacleOnXPath = sweptALeft < bRight && sweptARight > bLeft;
  const obstacleOnYPath = sweptATop < bBottom && sweptABottom > bTop;

  console.log("Obstacle intersects path?", {
    obstacleOnXPath,
    obstacleOnYPath,
  });

  // --- STEP 4: X axis sweep ---
  if (dx !== 0) {
    console.log("---- Testing X sweep ----");

    // Obstacle matters only if Y ranges currently overlap
    const yIntersects = aTop < bBottom && aBottom > bTop;
    console.log("Current Y intersection:", yIntersects);

    if (!yIntersects) {
      console.log("No Y intersection → X free");
      fx = 1;
    } else {
      if (dx > 0) {
        const dist = bLeft - aRight;
        console.log("Distance to hit RIGHT:", dist);
        if (dist <= 0) {
          // Already touching → slide allowed unless fully inside
          if (aLeft >= bLeft && aRight <= bRight) {
            console.log("Fully inside obstacle on X → BLOCK");
            fx = 0;
          }
        } else if (dist < dx) {
          fx = dist / dx;
          console.log("Impact fraction X:", fx);
        }
      }

      if (dx < 0) {
        const dist = bRight - aLeft;
        console.log("Distance to hit LEFT:", dist);
        if (dist >= 0) {
          if (aLeft >= bLeft && aRight <= bRight) {
            console.log("Fully inside obstacle on X → BLOCK");
            fx = 0;
          }
        } else if (dist > dx) {
          fx = dist / dx;
          console.log("Impact fraction X:", fx);
        }
      }
    }
  }

  // --- STEP 5: Y axis sweep ---
  if (dy !== 0) {
    console.log("---- Testing Y sweep ----");

    // Obstacle matters only if X ranges currently overlap
    const xIntersects = aLeft < bRight && aRight > bLeft;
    console.log("Current X intersection:", xIntersects);

    if (!xIntersects) {
      console.log("No X intersection → Y free");
      fy = 1;
    } else {
      if (dy > 0) {
        const dist = bTop - aBottom;
        console.log("Distance to hit DOWN:", dist);

        if (dist >= 0 && dist <= dy) {
          console.log("Will hit obstacle this frame → BLOCK");
          fy = dist / dy;
        } else if (dist < 0) {
          console.log("Already overlapping from above → BLOCK");
          fy = 0;
        } else {
          console.log("Obstacle below but too far → movement free");
          fy = 1;
        }
      }

      if (dy < 0) {
        const dist = bBottom - aTop;
        console.log("Distance to hit UP:", dist);

        if (dist <= 0 && dist >= dy) {
          console.log("Will hit obstacle this frame → BLOCK");
          fy = dist / dy;
        } else if (dist > 0) {
          console.log("Obstacle below or not touching → movement free");
          fy = 1;
        }
      }
    }
  }

  // --- STEP 6: Clamp fractions ---
  fx = Math.max(0, Math.min(1, fx));
  fy = Math.max(0, Math.min(1, fy));

  console.log("Final fractions:", { fx, fy });
  console.log("==== DEBUG END ====");

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
