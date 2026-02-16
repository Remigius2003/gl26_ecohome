import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";

export default function Trilogique() {
    console.log("trilogique");
    const scene: SceneType = "trilogique";
    return <SceneCanvas scene={scene} />;
}
