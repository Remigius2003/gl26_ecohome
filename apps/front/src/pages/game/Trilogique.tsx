import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";

export default function Trilogique() {
  const scene: SceneType = "trilogique";
  return <SceneCanvas scene={scene} />;
}
