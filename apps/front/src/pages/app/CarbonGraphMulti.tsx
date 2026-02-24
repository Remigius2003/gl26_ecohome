import { createEffect } from 'solid-js';

export type CategorySeries = {
	label: string;
	color: string;
	data: { date: Date; emission: number }[];
};

export default function CarbonGraphMulti(props: { series: CategorySeries[] }) {
	let canvas!: HTMLCanvasElement;

	createEffect(() => {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const width = rect.width;
		const height = rect.height;
		const padding = { top: 20, right: 20, bottom: 60, left: 50 };
		const chartW = width - padding.left - padding.right;
		const chartH = height - padding.top - padding.bottom;

		// ── Collect all unique dates across every series, last 7 ──
		const dateSet = new Set<string>();
		for (const s of props.series) {
			for (const pt of s.data) {
				dateSet.add(pt.date.toISOString().slice(0, 10));
			}
		}
		const sortedDates = Array.from(dateSet)
			.sort()
			.slice(-7)
			.map((d) => new Date(d));

		ctx.clearRect(0, 0, width, height);

		if (sortedDates.length === 0) {
			ctx.fillStyle = '#888';
			ctx.font = '14px system-ui';
			ctx.textAlign = 'center';
			ctx.fillText('Pas assez de données', width / 2, height / 2);
			return;
		}

		// ── Build stacked values per date ──
		// For each date, compute cumulative bottom/top per series.
		// A series with no data on a date contributes 0.
		const seriesCount = props.series.length;

		// stackedTops[dateIdx][seriesIdx] = top of this band on this date
		const stackedTops: number[][] = sortedDates.map((d) => {
			const key = d.toISOString().slice(0, 10);
			let acc = 0;
			return props.series.map((s) => {
				const pt = s.data.find((p) => p.date.toISOString().slice(0, 10) === key);
				acc += pt?.emission ?? 0;
				return acc;
			});
		});

		// stackedBottoms[dateIdx][seriesIdx] = bottom of this band
		const stackedBottoms: number[][] = sortedDates.map((_, di) =>
			props.series.map((_, si) => (si === 0 ? 0 : stackedTops[di][si - 1])),
		);

		// Global max = highest total across all dates
		const maxVal = Math.ceil(
			Math.max(...stackedTops.map((tops) => tops[seriesCount - 1]), 10) / 10,
		) * 10;

		const getX = (i: number) =>
			padding.left +
			(sortedDates.length === 1 ? chartW / 2 : (i / (sortedDates.length - 1)) * chartW);

		const getY = (v: number) =>
			padding.top + (1 - v / maxVal) * chartH;

		// ── Grid lines & Y labels ──
		ctx.setLineDash([]);
		ctx.strokeStyle = 'rgba(0,0,0,0.06)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let i = 0; i <= 4; i++) {
			const y = padding.top + chartH * (i / 4);
			ctx.moveTo(padding.left, y);
			ctx.lineTo(width - padding.right, y);
			const labelVal = Math.round(maxVal * (1 - i / 4));
			ctx.fillStyle = '#999';
			ctx.font = '10px system-ui';
			ctx.textAlign = 'right';
			ctx.fillText(labelVal.toString(), padding.left - 6, y + 3);
		}
		ctx.stroke();

		// ── X axis date labels ──
		ctx.textAlign = 'center';
		ctx.fillStyle = '#999';
		ctx.font = '10px system-ui';
		sortedDates.forEach((d, i) => {
			ctx.fillText(
				d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
				getX(i),
				padding.top + chartH + 14,
			);
		});

		// ── Draw stacked areas (back to front) ──
		for (let si = seriesCount - 1; si >= 0; si--) {
			const series = props.series[si];
			const color = series.color;

			// Build the polygon: top edge left→right, bottom edge right→left
			ctx.beginPath();
			// Top edge
			sortedDates.forEach((_, di) => {
				const x = getX(di);
				const y = getY(stackedTops[di][si]);
				if (di === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			// Bottom edge (reversed)
			for (let di = sortedDates.length - 1; di >= 0; di--) {
				ctx.lineTo(getX(di), getY(stackedBottoms[di][si]));
			}
			ctx.closePath();

			// Fill with transparency so lower stacks stay visible
			ctx.globalAlpha = 0.55;
			ctx.fillStyle = color;
			ctx.fill();
			ctx.globalAlpha = 1;

			// Top stroke line
			ctx.beginPath();
			sortedDates.forEach((_, di) => {
				const x = getX(di);
				const y = getY(stackedTops[di][si]);
				if (di === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.lineJoin = 'round';
			ctx.setLineDash([]);
			ctx.stroke();

			// Dots on top edge
			sortedDates.forEach((_, di) => {
				const x = getX(di);
				const y = getY(stackedTops[di][si]);
				ctx.beginPath();
				ctx.arc(x, y, 3.5, 0, Math.PI * 2);
				ctx.fillStyle = '#fff';
				ctx.fill();
				ctx.strokeStyle = color;
				ctx.lineWidth = 1.5;
				ctx.stroke();
			});
		}

		// ── Top "global" line (total) — prominent ──
		ctx.beginPath();
		sortedDates.forEach((_, di) => {
			const x = getX(di);
			const y = getY(stackedTops[di][seriesCount - 1]);
			if (di === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.strokeStyle = '#222';
		ctx.lineWidth = 2.5;
		ctx.lineJoin = 'round';
		ctx.setLineDash([4, 3]);
		ctx.stroke();
		ctx.setLineDash([]);

		// ── Legend ──
		const legendY = padding.top + chartH + 38;
		const itemW = chartW / seriesCount;
		props.series.forEach((s, si) => {
			const lx = padding.left + si * itemW;
			// Color swatch
			ctx.globalAlpha = 0.75;
			ctx.fillStyle = s.color;
			ctx.fillRect(lx, legendY - 7, 12, 10);
			ctx.globalAlpha = 1;
			ctx.strokeStyle = s.color;
			ctx.lineWidth = 1;
			ctx.strokeRect(lx, legendY - 7, 12, 10);
			// Label
			ctx.fillStyle = '#555';
			ctx.font = '10px system-ui';
			ctx.textAlign = 'left';
			ctx.fillText(s.label, lx + 15, legendY + 2);
		});

		// Global total legend entry at far right
		ctx.setLineDash([4, 3]);
		ctx.strokeStyle = '#222';
		ctx.lineWidth = 2;
		ctx.beginPath();
		const gx = padding.left + chartW - 60;
		ctx.moveTo(gx, legendY - 2);
		ctx.lineTo(gx + 14, legendY - 2);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = '#222';
		ctx.font = '10px system-ui';
		ctx.textAlign = 'left';
		ctx.fillText('Total', gx + 18, legendY + 2);
	});

	return (
		<div style={{ width: '100%', height: '240px', position: 'relative' }}>
			<canvas ref={canvas} style={{ width: '100%', height: '100%' }} />
		</div>
	);
}
