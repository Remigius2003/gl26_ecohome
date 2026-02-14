import SceneCanvas from "@components/SceneCanvas";
import type { SceneType } from "@scene";
import { useNavigate } from "@solidjs/router";
import { setGlobalNavigate, setGlobalSceneSwitch } from "../App";
import { switchScene } from "@scene";

export default function Home2() {
    const navigate = useNavigate();
    setGlobalNavigate(navigate);
    setGlobalSceneSwitch(switchScene);
    //const scene: SceneType = "home2";

    //return <SceneCanvas scene={scene} />;
}
