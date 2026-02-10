import { createSignal, Switch, Match, Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Session, authApiFetch } from '@api';
import Profile from './Profile';
import Friends from './Friends';
import Defi from './Defi';
import {
	FaSolidUser,
	FaSolidUserGroup,
	FaSolidSliders,
	FaSolidShieldHalved,
	FaSolidXmark,
	FaSolidRightFromBracket,
	FaSolidListCheck,
} from 'solid-icons/fa';
import './app.css';

interface SettingsProps {
	onClose: () => void;
}
type TabType = 'profile' | 'friends' | 'app' | 'account' | 'defi';

const Settings: Component<SettingsProps> = (props) => {
	const [activeTab, setActiveTab] = createSignal<TabType>('profile');
	const navigate = useNavigate();
	const [showDeleteModal, setShowDeleteModal] = createSignal(false);
	const [deletePassword, setDeletePassword] = createSignal('');

	const handleLogout = async () => {
		try {
			await Session.logout();
			navigate('/login', { replace: true });
		} catch (e) {
			console.error(e);
		}
	};

	const confirmDelete = async (e: Event) => {
		e.preventDefault();
		try {
			const refreshToken =
				localStorage.getItem('session_v1_refresh_token') || ''; // Quick hack access
			await authApiFetch('/', {
				method: 'DELETE',
				body: JSON.stringify({
					password: deletePassword(),
					refresh_token: refreshToken,
				}),
			});
			await Session.logout();
			navigate('/login', { replace: true });
		} catch (err: any) {
			alert(err.message || 'Erreur suppression');
		}
	};

	return (
		<div class="modal-overlay">
			<div class="settings-modal">
				<div class="settings-sidebar">
					<button
						class={`tab-btn ${activeTab() === 'profile' ? 'active' : ''}`}
						onClick={() => setActiveTab('profile')}
					>
						<FaSolidUser /> <span>Profil</span>
					</button>
					<button
						class={`tab-btn ${activeTab() === 'defi' ? 'active' : ''}`}
						onClick={() => setActiveTab('defi')}
					>
						<FaSolidListCheck /> <span>Défis</span>
					</button>
					<button
						class={`tab-btn ${activeTab() === 'friends' ? 'active' : ''}`}
						onClick={() => setActiveTab('friends')}
					>
						<FaSolidUserGroup /> <span>Amis</span>
					</button>
					<button
						class={`tab-btn ${activeTab() === 'app' ? 'active' : ''}`}
						onClick={() => setActiveTab('app')}
					>
						<FaSolidSliders /> <span>Général</span>
					</button>
					<button
						class={`tab-btn ${activeTab() === 'account' ? 'active' : ''}`}
						onClick={() => setActiveTab('account')}
					>
						<FaSolidShieldHalved /> <span>Compte</span>
					</button>
				</div>

				<div class="settings-content">
					<div class="content-header">
						<h2>
							<Switch>
								<Match when={activeTab() === 'profile'}>Mon Profil</Match>
								<Match when={activeTab() === 'defi'}>Défis</Match>
								<Match when={activeTab() === 'friends'}>Social</Match>
								<Match when={activeTab() === 'app'}>Paramètres</Match>
								<Match when={activeTab() === 'account'}>Sécurité</Match>
							</Switch>
						</h2>
						<button class="settings-close-pill" onClick={props.onClose}>
							<FaSolidXmark />
						</button>
					</div>

					<div class="content-scroll">
						<Switch>
							<Match when={activeTab() === 'profile'}>
								<Profile />
							</Match>
							<Match when={activeTab() === 'defi'}>
								<div style={{ zoom: '0.9' }}>
									<Defi />
								</div>
							</Match>
							<Match when={activeTab() === 'friends'}>
								<Friends />
							</Match>
							<Match when={activeTab() === 'app'}>
								<AppSettings />
							</Match>
							<Match when={activeTab() === 'account'}>
								<AccountSettings
									onLogout={handleLogout}
									onDeleteRequest={() => setShowDeleteModal(true)}
								/>
							</Match>
						</Switch>
					</div>
				</div>
			</div>

			{/* Delete Modal */}
			<Show when={showDeleteModal()}>
				<div class="modal-overlay" style={{ 'z-index': 200 }}>
					<div
						class="auth-card"
						style={{ 'max-width': '400px', padding: '30px' }}
					>
						<h2 style={{ color: 'var(--danger-red)' }}>
							Suppression définitive
						</h2>
						<p>Cette action est irréversible.</p>
						<form onSubmit={confirmDelete}>
							<input
								type="password"
								class="auth-input"
								placeholder="Mot de passe"
								value={deletePassword()}
								onInput={(e) => setDeletePassword(e.currentTarget.value)}
								required
							/>
							<div
								style={{ display: 'flex', gap: '10px', 'margin-top': '20px' }}
							>
								<button
									type="button"
									class="btn-secondary"
									onClick={() => setShowDeleteModal(false)}
								>
									Annuler
								</button>
								<button type="submit" class="btn-danger">
									Confirmer
								</button>
							</div>
						</form>
					</div>
				</div>
			</Show>
		</div>
	);
};

const AppSettings = () => (
	<div class="settings-list">
		<div class="setting-group">
			<h3>Audio</h3>
			<div class="toggle-row">
				<span>Musique</span>
				<input type="range" class="range-slider" />
			</div>
			<div class="toggle-row">
				<span>Effets Sonores</span>
				<input type="range" class="range-slider" />
			</div>
		</div>
	</div>
);

const AccountSettings = (props: {
	onLogout: () => void;
	onDeleteRequest: () => void;
}) => (
	<div class="settings-list">
		<div class="setting-group">
			<h3>Session</h3>
			<button
				class="btn-danger"
				onClick={props.onLogout}
				style={{
					display: 'flex',
					gap: '10px',
					'justify-content': 'center',
					'align-items': 'center',
				}}
			>
				<FaSolidRightFromBracket /> Déconnexion
			</button>
		</div>
		<div
			class="setting-group"
			style={{
				'margin-top': '40px',
				'border-top': '1px solid #eee',
				'padding-top': '20px',
			}}
		>
			<h3 style={{ color: 'var(--danger-red)' }}>Zone de Danger</h3>
			<button class="btn-danger" onClick={props.onDeleteRequest}>
				Supprimer mon compte
			</button>
		</div>
	</div>
);

export default Settings;
