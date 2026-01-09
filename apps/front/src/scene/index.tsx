import { SceneType } from "./core/types";
import { Engine } from "./core/engine";

// Scenes Imports
import HomeScene from "./scenes/home";
import EcoGrid from "./scenes/ecogrid";
import TriLogique from "./scenes/trilogique";
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
  engine.registerScene("ecogrid", new EcoGrid());
  engine.registerScene("trilogique", new TriLogique());
  engine.registerScene("lightshadow", new LightShadow());

  return engine;
};

export const startScene = () => engine?.start();
export const cleanScene = () => engine?.clean();
export const switchScene = (sceneType: SceneType) =>
  engine?.setScene(sceneType);
