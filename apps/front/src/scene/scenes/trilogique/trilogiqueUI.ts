import { Group, Dynamic } from "../../core/types";

export class TrilogiqueUI {
    static renderPlayerMessage(
        ctx: CanvasRenderingContext2D,
        player: Group & Dynamic,
        playerSize: number,
        message: string | null,
        timer: number,
    ) {
        if (!message || timer <= 0) return;

        const maxWidth = 250;
        const lineHeight = 18;
        const padding = 12;

        ctx.font = "bold 14px Arial";

        // 1. Calculate text lines (Word Wrapping)
        const words = message.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== "") {
                lines.push(currentLine);
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // 2. Calculate Box Dimensions
        let maxLineWidth = 0;
        for (const line of lines) {
            const w = ctx.measureText(line.trim()).width;
            if (w > maxLineWidth) maxLineWidth = w;
        }

        const bubbleWidth = maxLineWidth + padding * 2;
        const bubbleHeight = lines.length * lineHeight + padding * 2;

        // Position above player (Centered)
        const px = player.x + playerSize / 2;
        const py = player.y - 15; // Gap above player head

        const bx = px - bubbleWidth / 2;
        const by = py - bubbleHeight;

        // 3. Draw Bubble Background
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.rect(bx, by, bubbleWidth, bubbleHeight);
        ctx.fill();
        ctx.stroke();

        // 4. Draw Pointer
        ctx.beginPath();
        ctx.moveTo(px - 10, by + bubbleHeight);
        ctx.lineTo(px + 10, by + bubbleHeight);
        ctx.lineTo(px, by + bubbleHeight + 15);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px - 9, by + bubbleHeight);
        ctx.lineTo(px + 9, by + bubbleHeight);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // 5. Draw Text
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            ctx.fillText(line.trim(), px, by + padding + i * lineHeight);
        });
    }

    static renderHUD(
        ctx: CanvasRenderingContext2D,
        currentPoints: number,
        targetPoints: number,
        currentTime: number,
        isGameOver: boolean,
    ) {
        const barHeight = 50;
        const width = ctx.canvas.width;

        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, barHeight);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, barHeight - 2, width, 2);

        ctx.font = "bold 20px 'Courier New', sans-serif";
        ctx.textBaseline = "middle";

        // Points
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "left";
        ctx.fillText(
            `GOAL: ${currentPoints} / ${targetPoints}`,
            20,
            barHeight / 2,
        );

        // Time
        ctx.fillStyle = currentTime < 30000 ? "#FF4444" : "#00FFFF";
        ctx.textAlign = "right";
        ctx.fillText(
            `TIME: ${Math.ceil(currentTime / 1000)}`,
            width - 20,
            barHeight / 2,
        );

        if (isGameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, width, ctx.canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            const msg = currentPoints >= targetPoints ? "VICTORY!" : "TIME UP!";
            ctx.fillText(msg, width / 2, ctx.canvas.height / 2);
        }
    }
}
