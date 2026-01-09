import { Scene, SceneType, Entity } from "../core/types";
import { TopDownMovement } from "../logic/topdown";
import { checkAABB } from "../core/collision";

interface Portal extends Entity {
  target: SceneType;
  label: string;
}

export default class HomeScene implements Scene {
  private movement!: TopDownMovement;
  private canvas!: HTMLCanvasElement;
  private onSwitchScene!: (type: SceneType) => void;

  private portals: Portal[] = [
    {
      x: 150,
      y: 100,
      width: 100,
      height: 80,
      target: "trilogique",
      label: "Trilogique",
      color: "#ffca28",
    },
    {
      x: 550,
      y: 100,
      width: 100,
      height: 80,
      target: "ecogrid",
      label: "Eco-Grid",
      color: "#42a5f5",
    },
    {
      x: 350,
      y: 450,
      width: 100,
      height: 80,
      target: "lightshadow",
      label: "L & S",
      color: "#ab47bc",
    },
  ];

  private playerSize = 40;

  init(canvas: HTMLCanvasElement, onSwitchScene: (type: SceneType) => void) {
    this.canvas = canvas;
    this.onSwitchScene = onSwitchScene;

    this.movement = new TopDownMovement(canvas.width / 2, canvas.height / 2);
  }

  clean() {}

  handleInput(input: Record<string, boolean>) {
    this.movement.update(16, input);

    this.movement.x = Math.max(
      0,
      Math.min(this.canvas.width - this.playerSize, this.movement.x)
    );
    this.movement.y = Math.max(
      0,
      Math.min(this.canvas.height - this.playerSize, this.movement.y)
    );

    if (input["enter"] || input[" "]) {
      this.checkInteraction();
    }
  }

  checkInteraction() {
    const playerRect = {
      x: this.movement.x,
      y: this.movement.y,
      width: this.playerSize,
      height: this.playerSize,
    };

    for (const portal of this.portals) {
      if (checkAABB(playerRect, portal)) {
        console.log("Switching to", portal.target);
        this.onSwitchScene(portal.target);
        break;
      }
    }
  }

  update(dt: number) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.portals.forEach((portal) => {
      ctx.fillStyle = portal.color || "#666";
      ctx.fillRect(portal.x, portal.y, portal.width, portal.height);

      const playerRect = {
        x: this.movement.x,
        y: this.movement.y,
        width: this.playerSize,
        height: this.playerSize,
      };

      if (checkAABB(playerRect, portal)) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.strokeRect(
          portal.x - 5,
          portal.y - 5,
          portal.width + 10,
          portal.height + 10
        );

        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.fillText("Press SPACE", portal.x, portal.y - 10);
      }

      ctx.fillStyle = "white";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        portal.label,
        portal.x + portal.width / 2,
        portal.y + portal.height / 2
      );
    });

    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.arc(
      this.movement.x + this.playerSize / 2,
      this.movement.y + this.playerSize / 2,
      this.playerSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      "You",
      this.movement.x + this.playerSize / 2,
      this.movement.y - 10
    );
  }
}
