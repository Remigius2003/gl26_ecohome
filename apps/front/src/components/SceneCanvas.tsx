import {
	initializeGame,
	startGame,
	cleanGame,
	switchScene,
	SceneType,
} from '@scene';
import { createEffect, onCleanup } from 'solid-js';

export default function SceneCanvas(props: { scene: SceneType }) {
	let canvasRef: HTMLCanvasElement | undefined;

	createEffect(() => {
		if (!canvasRef) return;

		const engine = initializeGame(canvasRef);
		switchScene(props.scene);
		onCleanup(cleanGame);
		startGame();
	});

	return (
		<div class="scene-container">
			<canvas ref={canvasRef} width="1sw" height="1sh" />
			<div class="scene-info">
				{props.scene === 'lightshadow' &&
					'Find and turn off ghost-activated appliances before energy overload!'}
				{props.scene === 'trilogique' &&
					'Sort waste into correct bins before the table overflows!'}
				{props.scene === 'ecogrid' &&
					'Connect energy producers to consumers to balance the grid!'}
				{props.scene === 'home' &&
					'Use arrow keys to navigate your avatar through the house.'}
			</div>
		</div>
	);
}
