import { Component, createSignal, For, Show } from 'solid-js';
import './app.css';

const WELCOME_KEY = 'welcome_seen_v1';

const WELCOME_SECTIONS = [
	{
		icon: '🏠',
		title: 'Menu ou Maison',
		body: 'Cette application a un menu immersif. Vous êtes dans une maison à explorer pour trouver les différentes fonctionnalités. Par exemple, pour accéder à votre profil, cliquez sur le bon objet !',
	},
	{
		icon: '🎮',
		title: 'Les mini jeux',
		body: 'Jouez à 3 mini jeux et quizz pour vous aider à prendre en main les gestes écologiques du quotidien.',
	},
	{
		icon: '🌍',
		title: "10 milliards d'amis",
		body: "Connectez-vous à d'autres utilisateurs et collaborez ensemble pour atteindre vos objectifs environnementaux !",
	},
	{
		icon: '📊',
		title: 'Bilan carbone personnalisé',
		body: 'Selon les données que vous fournissez, nous vous proposons un bilan carbone personnalisé pour suivre vos progrès.',
	},
	{
		icon: '🎨',
		title: 'Customisation',
		body: "Exprimez votre personnalité en personnalisant votre avatar parmi une variété d'options !",
	},
] as const;

const Welcome: Component<{ onClose: () => void }> = (props) => {
	const [page, setPage] = createSignal(0);
	const total = WELCOME_SECTIONS.length;
	const section = () => WELCOME_SECTIONS[page()];

	const handleClose = () => {
		localStorage.setItem(WELCOME_KEY, '1');
		props.onClose();
	};

	return (
		<div class="modal-overlay" style={{ 'z-index': 300 }}>
			<div
				class="modal-content fade-in"
				style={{
					'max-width': '460px',
					width: '100%',
					position: 'relative',
					padding: '32px 28px 24px',
					height: 'auto',
					'align-self': 'center',
					'box-sizing': 'border-box',
				}}
			>
				<button
					class="settings-close-pill"
					style={{ position: 'absolute', top: '14px', right: '14px' }}
					onClick={handleClose}
					title="Fermer"
				>
					✕
				</button>

				<div style={{ 'text-align': 'center', 'margin-bottom': '24px' }}>
					<div
						style={{
							'font-size': '3rem',
							'line-height': '1',
							'margin-bottom': '12px',
						}}
					>
						{section().icon}
					</div>
					<h2
						style={{
							margin: '0 0 8px',
							'font-size': '1.25rem',
							color: 'var(--text-main)',
						}}
					>
						{section().title}
					</h2>
					<p
						class="text-muted"
						style={{ margin: 0, 'line-height': '1.6', 'font-size': '0.95rem' }}
					>
						{section().body}
					</p>
				</div>

				<div
					style={{
						display: 'flex',
						'justify-content': 'center',
						gap: '8px',
						'margin-bottom': '24px',
					}}
				>
					<For each={Array.from({ length: total })}>
						{(_, i) => (
							<div
								style={{
									width: '8px',
									height: '8px',
									'border-radius': '50%',
									background: i() === page() ? 'var(--primary-green)' : '#ddd',
									transition: 'background 0.2s',
									cursor: 'pointer',
								}}
								onClick={() => setPage(i())}
							/>
						)}
					</For>
				</div>

				<div class="form-actions" style={{ margin: 0 }}>
					<Show when={page() > 0} fallback={<div style={{ flex: 1 }} />}>
						<button class="btn-secondary" onClick={() => setPage((p) => p - 1)}>
							← Précédent
						</button>
					</Show>

					<Show
						when={page() < total - 1}
						fallback={
							<button class="auth-button" onClick={handleClose}>
								C'est parti ! 🌿
							</button>
						}
					>
						<button class="btn-primary" onClick={() => setPage((p) => p + 1)}>
							Suivant →
						</button>
					</Show>
				</div>
			</div>
		</div>
	);
};

export default Welcome;
