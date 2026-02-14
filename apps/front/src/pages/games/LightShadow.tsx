import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";



export default function LightShadowPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", margin: "0", padding: "0" }}>
      <SceneCanvas scene="lightshadow" />
    </div>
  );
}
