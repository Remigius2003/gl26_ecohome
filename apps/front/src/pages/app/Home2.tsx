import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";
import { useNavigate } from "@solidjs/router";
import { switchScene } from "@scene";

export default function Home2() {
    const navigate = useNavigate();
    const scene: SceneType = "home2";

    return <SceneCanvas scene={scene} />;
}
