import { SceneType } from './core/types';
import { Engine } from './core/engine';

import LightShadow from './scenes/lightshadow';
import TriLogique from './scenes/trilogique';
import EcoGrid from './scenes/ecogrid';
import Home from './scenes/home';

let engine: Engine | null = null;
export type { SceneType };

export const initializeGame = (canvas: HTMLCanvasElement) => {
	if (engine) return engine;

	engine = new Engine(canvas);
	engine.registerScene('lightshadow', LightShadow);
	engine.registerScene('trilogique', TriLogique);
	engine.registerScene('ecogrid', EcoGrid);
	engine.registerScene('home', Home);

	return engine;
};

export const startGame = () => {
	engine?.start();
};

export const cleanGame = () => {
	engine?.clean();
};

export const switchScene = (sceneType: SceneType) => {
	engine?.setScene(sceneType);
};
