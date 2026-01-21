import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";
import { useNavigate } from "@solidjs/router";
import { setGlobalNavigate } from "../App";

export default function Home() {
    const navigate = useNavigate();
    setGlobalNavigate(navigate);
    const scene: SceneType = "home";

    return <SceneCanvas scene={scene} />;
}
