import { setGlobalNavigate, setGlobalSceneSwitch } from '../../App';
import { FaSolidGear } from 'solid-icons/fa';
import SceneCanvas from '@components/SceneCanvas';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { switchScene } from '@scene';
import type { SceneType } from '@scene';
import Settings from './Settings';
import './app.css';

export default function Home() {
	const navigate = useNavigate();
	setGlobalNavigate(navigate);
	setGlobalSceneSwitch(switchScene);

	const scene: SceneType = 'home';
	const [showSettings, setShowSettings] = createSignal(false);

	return (
		<>
			<SceneCanvas scene={scene} />

			<div class="game-overlay">
				<div
					class="hud-top"
					style={{ 'justify-content': 'flex-end', width: '100%' }}
				>
					<div class="settings-btn" onClick={() => setShowSettings(true)}>
						<FaSolidGear />
					</div>
				</div>
			</div>

			<Show when={showSettings()}>
				<Settings onClose={() => setShowSettings(false)} />
			</Show>
		</>
	);
}
