
import { SceneType } from "./core/types";
import { Engine } from "./core/engine";

// Scenes Imports
import HomeScene from "./scenes/home";
import Home2Scene from "./scenes/home2";
import EcoGrid from "./scenes/ecogrid";
import TrilogiqueScene from "./scenes/trilogique/trilogique";
import LightShadow from "./scenes/lightshadow";

let engine: Engine | null = null;
export type { SceneType };

export const initializeScene = (canvas: HTMLCanvasElement) => {
    if (engine) {
        engine.updateCanvas(canvas);
        return engine;
    }

    engine = new Engine(canvas);
    engine.registerScene("home", new HomeScene());
    engine.registerScene("home2", new Home2Scene());
    engine.registerScene("ecogrid", new EcoGrid());
    engine.registerScene("trilogique", new TrilogiqueScene());
    engine.registerScene("lightshadow", new LightShadow());

    return engine;
};

export const startScene = () => engine?.start();
export const cleanScene = () => engine?.clean();
export const switchScene = (sceneType: SceneType) =>
    engine?.setScene(sceneType);
export const resizeWindow = (w: number, h: number) => engine?.resize(w, h);
