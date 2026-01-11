import { Square } from './types';

export function checkAABB(ent1: Square, ent2: Square): boolean {
	return (
		ent1.x < ent2.x + ent2.width &&
		ent1.x + ent1.width > ent2.x &&
		ent1.y < ent2.y + ent2.height &&
		ent1.y + ent1.height > ent2.y
	);
}

export function computeMovementAABB(
	ent: Square,
	tar: Square,
	dx: number,
	dy: number
): { ax: number; ay: number } {
	let ax = dx;
	let ay = dy;

	let leftGap = ent.x + ent.width - tar.x;
	let topGap = ent.y + ent.height - tar.y;
	let rightGap = tar.x + tar.width - ent.x;
	let bottomGap = tar.y + tar.height - ent.y;

	const overlaps = (a: number, b: number, c: number) => a > 0 && b > 0 && c > 0;
	if (dx > 0 && leftGap + dx >= 0 && overlaps(rightGap, topGap, bottomGap))
		ax = Math.min(ax, Math.max(0, -leftGap));

	if (dx < 0 && rightGap - dx >= 0 && overlaps(leftGap, topGap, bottomGap))
		ax = Math.max(ax, Math.min(0, rightGap));

	if (dy < 0 && bottomGap - dy >= 0 && overlaps(leftGap, topGap, rightGap))
		ay = Math.max(ay, Math.min(0, bottomGap));

	if (dy > 0 && topGap + dy >= 0 && overlaps(leftGap, bottomGap, rightGap))
		ay = Math.min(ay, Math.max(0, -topGap));

	return { ax, ay };
}

export function computeMovementFractionAABB(
	ent: Square,
	tar: Square,
	dx: number,
	dy: number
): { fx: number; fy: number } {
	const { ax, ay } = computeMovementAABB(ent, tar, dx, dy);
	return { fx: dx === 0 ? 1 : ax / dx, fy: dy === 0 ? 1 : ay / dy };
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
