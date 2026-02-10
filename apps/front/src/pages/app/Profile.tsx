import {
	Component,
	createSignal,
	onMount,
	Show,
	Switch,
	Match,
} from 'solid-js';
import { FaSolidPen, FaSolidCamera } from 'solid-icons/fa';
import {
	profileWrapper,
	updateProfile,
	uploadAvatar,
	Profile as ProfileModel,
} from '@api';
import CarbonGraph from './CarbonGraph';

const Profile: Component = () => {
	const [isLoading, setIsLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const [isEditing, setIsEditing] = createSignal(false);
	const [profile, setProfile] = createSignal<ProfileModel | null>(null);

	const [editBio, setEditBio] = createSignal('');
	const [editPublic, setEditPublic] = createSignal(false);
	const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);
	const [fileToUpload, setFileToUpload] = createSignal<File | null>(null);

	const emissions = [
		{ date: new Date(2023, 5, 1), emission: [140, 160] },
		{ date: new Date(2023, 5, 8), emission: 120 },
		{ date: new Date(2023, 5, 29), emission: 95 },
	];

	let fileInputRef: HTMLInputElement | undefined;

	const loadProfile = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await profileWrapper.get(undefined);
			if (data) {
				setProfile(data);
				setEditBio(data.bio || '');
				setEditPublic(data.is_graph_public || false);
				setAvatarPreview(data.avatar_url || null);
			} else {
				setError('Profil introuvable.');
			}
		} catch (e: any) {
			console.error('Failed to load profile', e);
			setError('Impossible de charger le profil. Session expirée ?');
		} finally {
			setIsLoading(false);
		}
	};

	onMount(loadProfile);

	const handleFileChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				alert("L'image est trop lourde (max 2MB).");
				return;
			}
			if (!['image/png', 'image/jpeg'].includes(file.type)) {
				alert('Format non supporté. Utilisez PNG ou JPEG.');
				return;
			}

			setAvatarPreview(URL.createObjectURL(file));
			setFileToUpload(file);
		}
	};

	const handleSave = async (e: Event) => {
		e.preventDefault();
		try {
			if (fileToUpload()) {
				try {
					const res = await uploadAvatar(fileToUpload()!);
					setAvatarPreview(res.url);
				} catch (uploadErr) {
					console.error('Avatar upload failed', uploadErr);
					alert("Erreur lors de l'upload de l'image. Vérifiez le format.");
					return;
				}
			}

			const updatedParts = await updateProfile({
				bio: editBio(),
				is_graph_public: editPublic(),
			});

			setProfile((prev) => {
				if (!prev) return null;
				return {
					...prev,
					...updatedParts,
					avatar_url: avatarPreview() || prev.avatar_url,
				};
			});

			if (profile()) {
				profileWrapper.setCache(undefined, profile()!);
			}

			setIsEditing(false);
			setFileToUpload(null);
		} catch (err: any) {
			alert(err.message || 'Erreur sauvegarde');
		}
	};

	const triggerFileSelect = () => fileInputRef?.click();

	return (
		<Switch>
			<Match when={isLoading()}>
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Chargement...</p>
				</div>
			</Match>

			<Match when={error()}>
				<div class="error-msg" style={{ 'text-align': 'center' }}>
					<p>{error()}</p>
					<button class="btn-secondary" onClick={loadProfile}>
						Réessayer
					</button>
				</div>
			</Match>

			<Match when={!isLoading() && profile()}>
				<div class="profile-container fade-in">
					<div class="profile-header-section">
						<div class="avatar-wrapper">
							<div
								class="profile-avatar"
								style={{
									'background-image': avatarPreview()
										? `url(${avatarPreview()})`
										: 'none',
									'background-size': 'cover',
								}}
							>
								{!avatarPreview() && profile()!.username
									? profile()!.username.charAt(0).toUpperCase()
									: '?'}
							</div>

							<Show when={isEditing()}>
								<button class="avatar-edit-btn" onClick={triggerFileSelect}>
									<FaSolidCamera />
								</button>
							</Show>

							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								style={{ display: 'none' }}
								accept="image/png, image/jpeg"
							/>
						</div>

						<Show when={!isEditing()}>
							<button
								class="edit-toggle-btn"
								onClick={() => setIsEditing(true)}
							>
								Modifier <FaSolidPen size={12} />
							</button>
						</Show>
					</div>

					<Show
						when={isEditing()}
						fallback={
							<div class="profile-details">
								<h2>{profile()!.username}</h2>
								<p class="bio">{profile()!.bio || 'Aucune bio renseignée.'}</p>
								<div class="stats-section" style={{ 'margin-top': '20px' }}>
									<h4>Mon Impact Carbone</h4>
									<p style={{ 'font-size': '0.8rem', color: '#666' }}>
										{profile()!.is_graph_public ? 'Visible par tous' : 'Privé'}
									</p>
									<div class="graph-card">
										<CarbonGraph emissions={emissions as any} />
									</div>
								</div>
							</div>
						}
					>
						<form onSubmit={handleSave} class="profile-edit-form">
							<div class="form-group">
								<label>Bio</label>
								<textarea
									class="auth-input"
									value={editBio()}
									onInput={(e) => setEditBio(e.currentTarget.value)}
									placeholder="Parlez-nous de vous..."
								/>
							</div>
							<div
								class="form-group checkbox-group"
								style={{ margin: '15px 0' }}
							>
								<label
									style={{
										display: 'flex',
										gap: '10px',
										'align-items': 'center',
									}}
								>
									<input
										type="checkbox"
										checked={editPublic()}
										onChange={(e) => setEditPublic(e.currentTarget.checked)}
									/>
									Rendre mon graphique carbone public
								</label>
							</div>
							<div class="form-actions">
								<button
									type="button"
									class="btn-secondary"
									style={{ flex: 1 }}
									onClick={() => {
										setIsEditing(false);
										setFileToUpload(null);
										setAvatarPreview(profile()?.avatar_url || null);
									}}
								>
									Annuler
								</button>
								<button type="submit" class="auth-button" style={{ flex: 1 }}>
									Enregistrer
								</button>
							</div>
						</form>
					</Show>
				</div>
			</Match>
		</Switch>
	);
};

export default Profile;
