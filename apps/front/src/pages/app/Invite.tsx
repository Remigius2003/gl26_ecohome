// Invite.tsx
import { Component, createSignal, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { sendFriendRequest } from '@api';
import './app.css';

const Invite: Component = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [status, setStatus] = createSignal<
		'idle' | 'loading' | 'success' | 'error'
	>('idle');

	const handleSendRequest = async () => {
		setStatus('loading');
		try {
			await sendFriendRequest(Number(params.id));
			setStatus('success');
		} catch (e) {
			console.error('Erreur lors de la demande :', e);
			setStatus('error');
		}
	};

	return (
		<div
			class="fade-in"
			style={{
				display: 'flex',
				'flex-direction': 'column',
				'align-items': 'center',
				'justify-content': 'center',
				height: '100vh',
				padding: '20px',
				'text-align': 'center',
			}}
		>
			<h2>Nouvelle connexion 🌱</h2>
			<p>Un joueur vous a invité à rejoindre sa liste d'amis !</p>

			<Show when={status() === 'idle'}>
				<button
					class="auth-button"
					onClick={handleSendRequest}
					style={{ 'margin-top': '20px' }}
				>
					Envoyer une demande d'ami
				</button>
			</Show>

			<Show when={status() === 'loading'}>
				<div class="spinner" style={{ 'margin-top': '20px' }}></div>
			</Show>

			<Show when={status() === 'success'}>
				<div style={{ 'margin-top': '20px' }}>
					<p style={{ color: 'var(--primary-green)', 'font-weight': 'bold' }}>
						Demande envoyée avec succès ! 🎉
					</p>
					<button
						class="btn-secondary"
						onClick={() => navigate('/')}
						style={{ 'margin-top': '10px' }}
					>
						Aller à l'accueil
					</button>
				</div>
			</Show>

			<Show when={status() === 'error'}>
				<div style={{ 'margin-top': '20px' }}>
					<p style={{ color: 'var(--danger-red)' }}>
						Erreur lors de l'envoi. Vous êtes peut-être déjà amis ou la session
						a expiré.
					</p>
					<button class="btn-secondary" onClick={() => navigate('/')}>
						Retour
					</button>
				</div>
			</Show>
		</div>
	);
};

export default Invite;
