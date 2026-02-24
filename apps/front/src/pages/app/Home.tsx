import { setGlobalNavigate, setGlobalShowMusic } from '../../App';
import { FaSolidGear, FaSolidCircleInfo, FaSolidPalette } from 'solid-icons/fa';
import SceneCanvas from '@components/SceneCanvas';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import type { SceneType } from '@scene';
import CustomisationModal from './Customisation';
import WelcomeModal from './Welcome';
import Settings from './Settings';
import Music from './Music';
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
	const navigate = useNavigate();
	setGlobalNavigate(navigate);

	const scene: SceneType = 'home';
	const [showMusic, setShowMusic] = createSignal(false);
	const [showSettings, setShowSettings] = createSignal(false);
	const [showWelcome, setShowWelcome] = createSignal(false);
	const [showCustomisation, setShowCustomisation] = createSignal(false);

	onMount(() => {
		// Make setShowMusic available globall y for piano interaction (inside onMount to avoid recursion)
		setGlobalShowMusic(setShowMusic);

		RTClient.connect();

		if (!localStorage.getItem(WELCOME_KEY)) {
			setShowWelcome(true);
		}

		const invalidateFriendCaches = () => {
			friendsListWrapper.invalidate(undefined);
			friendRequestsWrapper.invalidate(undefined);
			sentFriendRequestsWrapper.invalidate(undefined);
		};

		const unsubs = [
			RTClient.subscribe('friend_request', invalidateFriendCaches),
			RTClient.subscribe('friend_request_cancelled', invalidateFriendCaches),
			RTClient.subscribe('friend_request_accepted', invalidateFriendCaches),
			RTClient.subscribe('friend_request_rejected', invalidateFriendCaches),
		];

		onCleanup(() => unsubs.forEach((fn) => fn()));
	});

	return (
		<>
			<SceneCanvas scene={scene} />
			<div class="game-overlay">
				<div
					class="hud-top"
					style={{
						'justify-content': 'flex-end',
						width: '100%',
						gap: '10px',
					}}
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
						title="Personnalisation"
						onClick={() => setShowCustomisation(true)}
					>
						<FaSolidPalette />
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

			<Show when={showMusic()}>
				<Music onClose={() => setShowMusic(false)} />
			</Show>

			<Show when={showWelcome()}>
				<WelcomeModal onClose={() => setShowWelcome(false)} />
			</Show>

			<Show when={showCustomisation()}>
				<CustomisationModal onClose={() => setShowCustomisation(false)} />
			</Show>

			<Show when={showSettings()}>
				<Settings onClose={() => setShowSettings(false)} />
			</Show>
		</>
	);
}
