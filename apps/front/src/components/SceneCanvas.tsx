import {
  initializeScene,
  startScene,
  cleanScene,
  switchScene,
  SceneType,
} from "@scene";
import { onMount, onCleanup } from "solid-js";

export default function SceneCanvas(props: { scene: SceneType }) {
  let canvasRef: HTMLCanvasElement | undefined;

  const resizeCanvas = () => {
    if (!canvasRef) return;
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvasRef.width = Math.floor(width * dpr);
    canvasRef.height = Math.floor(height * dpr);

    canvasRef.style.width = `${width}px`;
    canvasRef.style.height = `${height}px`;
  };

  onMount(() => {
    if (!canvasRef) return;

    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    resizeCanvas();
    initializeScene(canvasRef);
    switchScene(props.scene);
    startScene();

    window.addEventListener("resize", resizeCanvas);

    onCleanup(() => {
      window.removeEventListener("resize", resizeCanvas);
      cleanScene();

      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    });
  });

  return (
    <div
      class="scene-container"
      style={{
        position: "fixed",
        inset: "0",
        overflow: "hidden",
      }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />

      <div
        class="scene-info"
        style={{
          position: "absolute",
          color: "white",
          "pointer-events": "none",
        }}>
        {props.scene === "lightshadow" &&
          "Find and turn off ghost-activated appliances!"}
        {props.scene === "trilogique" && "Sort waste into correct bins!"}
        {props.scene === "ecogrid" && "Connect energy producers to consumers!"}
        {props.scene === "home" && "Use arrow keys to navigate."}
      </div>
    </div>
  );
}
