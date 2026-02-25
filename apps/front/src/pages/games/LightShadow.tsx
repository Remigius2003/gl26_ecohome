import { createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import SceneCanvas from "@components/SceneCanvas";
import { setLightShadowLevel, type SceneType } from "@scene";

export default function LightShadowPage() {
    const params = useParams();
    const scene: SceneType = "lightshadow";

    // Set synchronously in the render phase so SceneCanvas never mounts
    // with a stale/default level. The effect below handles reactive
    // param changes that happen after the initial mount (e.g. navigation).
    if (params.gamePath) {
        setLightShadowLevel(params.gamePath);
    }

    createEffect(() => {
        if (params.gamePath) {
            console.log("Setting LightShadow level to:", params.gamePath);
            setLightShadowLevel(params.gamePath);
        }
    });

    return <SceneCanvas scene={scene} />;
}
