import { createEffect } from "solid-js";
import type { CompleteInfo, CarbonRange } from "../../quizz/Types";

function normalizeCarbon(value?: CarbonRange): number | null {
    if (value == null) return null;
    if (typeof value === "number") return value;
    return (value[0] + value[1]) / 2;
}

export default function CarbonGraph(props: { emissions: CompleteInfo[] }) {
    let canvas!: HTMLCanvasElement;

    createEffect(() => {
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        // ✅ Sort emissions by date (oldest → newest)
        const sortedEmissions = [...props.emissions].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );

        const values = sortedEmissions
            .map((i) => normalizeCarbon(i.emission))
            .filter((v): v is number => v !== null);

        const padding = 40;
        const w = canvas.width;
        const h = canvas.height;

        if (values.length < 1) {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#666";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Aucune donnée à afficher", w / 2, h / 2);
            return;
        }

        const graphWidth = w - padding * 2;
        const graphHeight = h - padding * 2;

        const min = 0;
        const max = Math.max(...values);
        const range = max - min || 1;

        ctx.clearRect(0, 0, w, h);

        /* ===== AXES ===== */
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        /* ===== GRAPH LINE ===== */
        ctx.strokeStyle = "#4CAF50";
        ctx.lineWidth = 3;
        ctx.beginPath();

        const points: { x: number; y: number }[] = [];

        values.forEach((value, index) => {
            const x =
                padding + (index / Math.max(1, values.length - 1)) * graphWidth;
            const y =
                padding + graphHeight - ((value - min) / range) * graphHeight;

            points.push({ x, y });
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        /* ===== CROIX SUR CHAQUE POINT ===== */
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        points.forEach(({ x, y }) => {
            const size = 5;
            ctx.beginPath();
            ctx.moveTo(x - size, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.moveTo(x - size, y + size);
            ctx.lineTo(x + size, y - size);
            ctx.stroke();
        });

        /* ===== Y LABELS ===== */
        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        ctx.fillText(`${max.toFixed(1)}`, padding - 5, padding);
        ctx.fillText(`kg/sem`, padding - 2, padding + 10);
        ctx.fillText(`${min.toFixed(1)}`, padding - 5, h - padding);
    });

    return <canvas ref={canvas} width={500} height={250} />;
}
