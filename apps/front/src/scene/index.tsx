import { SceneType } from "./core/types";
import { Engine } from "./core/engine";

import HomeScene from "./scenes/Home";
import Home2Scene from "./scenes/home2";
import EcoGrid from "./scenes/ecogrid";
import TrilogiqueScene from "./scenes/trilogique/trilogiqueScene";
import LightShadow from "./scenes/lightShadow/lightshadow";

let engine: Engine | null = null;

const trilogiqueInstance = new TrilogiqueScene();
const lightShadowInstance = new LightShadow();

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
    engine.registerScene("trilogique", trilogiqueInstance);
    engine.registerScene("lightshadow", lightShadowInstance);

    return engine;
};

export const startScene = () => engine?.start();
export const cleanScene = () => engine?.clean();
export const switchScene = (sceneType: SceneType) =>
    engine?.setScene(sceneType);
export const resizeWindow = (w: number, h: number) => engine?.resize(w, h);

export const setTrilogiqueLevel = (levelId: string) => {
    trilogiqueInstance.loadGameLevel(levelId);
};

export const setLightShadowLevel = (levelId: string) => {
    lightShadowInstance.loadLevel(levelId);
};
