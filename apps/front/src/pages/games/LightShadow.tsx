import { createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import SceneCanvas from "@components/SceneCanvas";
import { setLightShadowLevel, type SceneType } from "@scene";

export default function LightShadowPage() {
    const params = useParams();
    const scene: SceneType = "lightshadow";
    createEffect(() => {
        if (params.gamePath) {
            console.log("Setting Trilogique level to:", params.gamePath);
            setLightShadowLevel(params.gamePath);
        }
    });

    return <SceneCanvas scene={scene} />;
}
