import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";

export default function LightShadow() {
  const scene: SceneType = "lightshadow";
  return <SceneCanvas scene={scene} />;
}
