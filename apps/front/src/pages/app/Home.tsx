import { FaSolidGear, FaSolidCircleInfo } from 'solid-icons/fa';
import SceneCanvas from '@components/SceneCanvas';
import { Show, onMount, onCleanup } from 'solid-js';
import {
	showSettings,
	setShowSettings,
	showWelcome,
	setShowWelcome,
	showPlayerCustomisation,
	setShowPlayerCustomisation,
	showQuizz,
	setShowQuizz,
	showHomeCustomisation,
	setShowHomeCustomisation,
	quizzType,
	showMusic,
	setShowMusic,
} from '@store';
import type { SceneType } from '@scene';
import Customisation from './Customisation';
import HomeCustomisation from './HomeCustomisation';
import Welcome from './Welcome';
import Settings from './Settings';
import Music from './Music';
import Quizz from './Quizz';
import Chat from './Chat';
import {
	friendsListWrapper,
	friendRequestsWrapper,
	sentFriendRequestsWrapper,
	RTClient,
} from '@api';
import './app.css';

const WELCOME_KEY = 'welcome_seen_v1';

export default function Home() {
	const scene: SceneType = 'home';

	onMount(() => {
		RTClient.connect();
		if (!localStorage.getItem(WELCOME_KEY)) setShowWelcome(true);

		const invalidate = () => {
			friendsListWrapper.invalidate(undefined);
			friendRequestsWrapper.invalidate(undefined);
			sentFriendRequestsWrapper.invalidate(undefined);
		};
		const unsubs = [
			RTClient.subscribe('friend_request', invalidate),
			RTClient.subscribe('friend_request_cancelled', invalidate),
			RTClient.subscribe('friend_request_accepted', invalidate),
			RTClient.subscribe('friend_request_rejected', invalidate),
		];
		onCleanup(() => unsubs.forEach((fn) => fn()));
	});

	return (
		<>
			<SceneCanvas scene={scene} />

			<div class="game-overlay">
				<div
					class="hud-top"
					style={{ 'justify-content': 'flex-end', width: '100%', gap: '10px' }}
				>
					<div
						class="settings-btn"
						title="Tutoriel"
						onClick={() => setShowWelcome(true)}
					>
						<FaSolidCircleInfo />
					</div>
					<div
						class="settings-btn"
						title="Paramètres"
						onClick={() => setShowSettings(true)}
					>
						<FaSolidGear />
					</div>
				</div>
			</div>

			<Chat />

			<Show when={showWelcome()}>
				<Welcome onClose={() => setShowWelcome(false)} />
			</Show>

			<Show when={showMusic()}>
				<Music onClose={() => setShowMusic(false)} />
			</Show>

			<Show when={showQuizz()}>
				<Quizz type={quizzType()} onClose={() => setShowQuizz(false)} />
			</Show>

			<Show when={showPlayerCustomisation()}>
				<Customisation onClose={() => setShowPlayerCustomisation(false)} />
			</Show>

			<Show when={showHomeCustomisation()}>
				<HomeCustomisation onClose={() => setShowHomeCustomisation(false)} />
			</Show>

			<Show when={showSettings()}>
				<Settings onClose={() => setShowSettings(false)} />
			</Show>
		</>
	);
}
