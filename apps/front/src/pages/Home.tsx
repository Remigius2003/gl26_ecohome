import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";

export default function Home() {
  const scene: SceneType = "home";

  return <SceneCanvas scene={scene} />;
}
