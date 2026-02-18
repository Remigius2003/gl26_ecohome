import { createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import SceneCanvas from "@components/SceneCanvas";
import { SceneType, setTrilogiqueLevel } from "@scene";

export default function TrilogiqueGame() {
    const params = useParams();

    const scene: SceneType = "trilogique";
    createEffect(() => {
        if (params.gamePath) {
            console.log("Setting Trilogique level to:", params.gamePath);
            setTrilogiqueLevel(params.gamePath);
        }
    });

    return <SceneCanvas scene={scene} />;
}
