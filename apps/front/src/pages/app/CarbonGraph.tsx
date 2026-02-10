import type { CompleteInfo, CarbonRange } from '../../quizz/Types';
import { createEffect } from 'solid-js';

function normalizeCarbon(value?: CarbonRange): number {
	if (value == null) return 0;
	if (typeof value === 'number') return value;
	return (value[0] + value[1]) / 2;
}

export default function CarbonGraph(props: { emissions: CompleteInfo[] }) {
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
		const padding = { top: 20, right: 20, bottom: 30, left: 40 };

		const data = [...props.emissions]
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(-7);

		if (data.length === 0) {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = '#666';
			ctx.font = '14px system-ui';
			ctx.textAlign = 'center';
			ctx.fillText('Pas assez de données', width / 2, height / 2);
			return;
		}

		const values = data.map((d) => normalizeCarbon(d.emission));
		const maxVal = Math.max(...values, 10);

		ctx.clearRect(0, 0, width, height);

		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, 'rgba(40, 167, 69, 0.5)');
		gradient.addColorStop(1, 'rgba(40, 167, 69, 0.0)');

		const lineColor = '#28a745';
		const gridColor = 'rgba(0,0,0,0.05)';
		const textColor = '#999';

		ctx.beginPath();
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;

		for (let i = 0; i <= 4; i++) {
			const y = padding.top + (height - padding.top - padding.bottom) * (i / 4);
			ctx.moveTo(padding.left, y);
			ctx.lineTo(width - padding.right, y);

			ctx.fillStyle = textColor;
			ctx.font = '10px system-ui';
			ctx.textAlign = 'right';
			const labelVal = Math.round(maxVal - maxVal * (i / 4));
			ctx.fillText(labelVal.toString(), padding.left - 8, y + 3);
		}
		ctx.stroke();

		const getX = (i: number) =>
			padding.left +
			(i / (values.length - 1)) * (width - padding.left - padding.right);
		const getY = (v: number) =>
			padding.top + (1 - v / maxVal) * (height - padding.top - padding.bottom);

		ctx.beginPath();
		ctx.moveTo(getX(0), height - padding.bottom);
		values.forEach((v, i) => ctx.lineTo(getX(i), getY(v)));
		ctx.lineTo(getX(values.length - 1), height - padding.bottom);
		ctx.closePath();
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.beginPath();
		values.forEach((v, i) => {
			if (i === 0) ctx.moveTo(getX(i), getY(v));
			else ctx.lineTo(getX(i), getY(v));
		});
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = 3;
		ctx.lineJoin = 'round';
		ctx.stroke();

		values.forEach((v, i) => {
			const x = getX(i);
			const y = getY(v);

			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fillStyle = '#fff';
			ctx.fill();
			ctx.strokeStyle = lineColor;
			ctx.lineWidth = 2;
			ctx.stroke();
		});

		ctx.textAlign = 'center';
		ctx.fillStyle = textColor;
		data.forEach((d, i) => {
			const dateStr = new Date(d.date).toLocaleDateString('fr-FR', {
				day: 'numeric',
				month: 'short',
			});
			ctx.fillText(dateStr, getX(i), height - 10);
		});
	});

	return (
		<div style={{ width: '100%', height: '200px', position: 'relative' }}>
			<canvas ref={canvas} style={{ width: '100%', height: '100%' }} />
		</div>
	);
}
