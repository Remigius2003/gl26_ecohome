import { setGlobalNavigate } from '../../App';
import {
	FaSolidGear,
	FaSolidCircleInfo,
	FaSolidPalette,
	FaSolidLeaf,
} from 'solid-icons/fa';
import SceneCanvas from '@components/SceneCanvas';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import type { SceneType } from '@scene';
import CustomisationModal from './Customisation';
import WelcomeModal from './Welcome';
import Settings from './Settings';
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
	const navigate = useNavigate();
	setGlobalNavigate(navigate);

	const scene: SceneType = 'home';
	const [showSettings, setShowSettings] = createSignal(false);
	const [showWelcome, setShowWelcome] = createSignal(false);
	const [showCustomisation, setShowCustomisation] = createSignal(false);
	const [showQuizz, setShowQuizz] = createSignal(false);

	onMount(() => {
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

			{/* ── HUD ── */}
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
						title="Bilan Carbone"
						onClick={() => setShowQuizz(true)}
					>
						<FaSolidLeaf />
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

			<Show when={showWelcome()}>
				<WelcomeModal onClose={() => setShowWelcome(false)} />
			</Show>

			<Show when={showQuizz()}>
				<Quizz onClose={() => setShowQuizz(false)} />
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
