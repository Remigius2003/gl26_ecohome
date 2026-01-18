import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";

export default function EcoGrid() {
  const scene: SceneType = "ecogrid";
  return <SceneCanvas scene={scene} />;
}
