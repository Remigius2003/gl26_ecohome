import {
	Component,
	createSignal,
	For,
	Show,
	onMount,
	Switch,
	Match,
} from 'solid-js';
import {
	FaSolidCheck,
	FaSolidXmark,
	FaSolidMagnifyingGlass,
	FaSolidLink,
} from 'solid-icons/fa';
import {
	friendsListWrapper,
	friendRequestsWrapper,
	searchUsersApi,
	sendFriendRequest,
	respondToRequest,
	profileWrapper,
	Profile as ProfileModel,
} from '@api';
import CarbonGraph from './CarbonGraph';

const Friends: Component = () => {
	const [view, setView] = createSignal<'list' | 'add' | 'profile'>('list');
	const [friends, setFriends] = createSignal<ProfileModel[]>([]);
	const [requests, setRequests] = createSignal<ProfileModel[]>([]);
	const [searchResults, setSearchResults] = createSignal<ProfileModel[]>([]);
	const [searchQuery, setSearchQuery] = createSignal('');
	const [selectedFriend, setSelectedFriend] = createSignal<ProfileModel | null>(
		null,
	);

	const [myId, setMyId] = createSignal<number | null>(null);
	const [isLoading, setIsLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const refreshList = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [f, r, me] = await Promise.all([
				friendsListWrapper.get(),
				friendRequestsWrapper.get(),
				profileWrapper.get(undefined),
			]);
			setFriends(f || []);
			setRequests(r || []);
			if (me) setMyId(me.user_id);
		} catch (e: any) {
			console.error('Failed to load friends', e);
			setError('Impossible de charger vos amis. Vérifiez votre connexion.');
		} finally {
			setIsLoading(false);
		}
	};

	onMount(() => {
		refreshList();
	});

	const copyLink = () => {
		const id = myId();
		if (!id) return alert("Votre profil n'est pas encore chargé.");
		const inviteUrl = `${window.location.origin}/invite/${id}`;
		navigator.clipboard.writeText(inviteUrl);
		alert("Lien d'invitation copié !");
	};

	const handleSearch = async () => {
		const query = searchQuery().trim();
		if (!query) return;

		if (query.length < 3) {
			alert('Veuillez saisir au moins 3 caractères.');
			return;
		}

		try {
			const res = await searchUsersApi(query);
			setSearchResults(res || []);
		} catch (e: any) {
			console.error(e);
			alert('Erreur lors de la recherche.');
		}
	};

	const sendRequest = async (id: number) => {
		try {
			await sendFriendRequest(id);
			alert('Demande envoyée');
			setSearchResults(searchResults().filter((u) => u.user_id !== id));
		} catch (e: any) {
			console.error(e);
			alert(e.message || "Erreur lors de l'ajout");
		}
	};

	const handleRequest = async (id: number, action: 'accept' | 'reject') => {
		try {
			await respondToRequest(id, action);
			refreshList();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<Switch>
			<Match when={isLoading()}>
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Chargement des amis...</p>
				</div>
			</Match>

			<Match when={error()}>
				<div class="error-msg" style={{ 'text-align': 'center' }}>
					<p>{error()}</p>
					<button class="btn-secondary" onClick={refreshList}>
						Réessayer
					</button>
				</div>
			</Match>

			<Match when={!isLoading()}>
				<div class="friends-tab-container fade-in" style={{ width: '100%' }}>
					<Show when={view() === 'list'}>
						<div class="view-container fade-in">
							<div class="friends-header">
								<h3>Mes Amis ({friends().length})</h3>
								<button class="add-friend-btn" onClick={() => setView('add')}>
									+ Ajouter
								</button>
							</div>

							<Show when={requests().length > 0}>
								<div class="friend-requests">
									<h4>Demandes en attente</h4>
									<div style={{ padding: 0, margin: 0, width: '100%' }}>
										<For each={requests()}>
											{(req) => (
												<div class="request-item">
													<div class="req-info">
														<span class="req-name">{req.username}</span>
													</div>
													<div class="req-actions">
														<button
															class="btn-icon accept"
															onClick={() =>
																handleRequest(req.user_id, 'accept')
															}
														>
															<FaSolidCheck />
														</button>
														<button
															class="btn-icon reject"
															onClick={() =>
																handleRequest(req.user_id, 'reject')
															}
														>
															<FaSolidXmark />
														</button>
													</div>
												</div>
											)}
										</For>
									</div>
								</div>
							</Show>

							<div
								class="friends-list"
								style={{
									padding: '0',
									margin: '20px 0 0 0',
									width: '100%',
									'list-style': 'none',
									display: 'flex',
									'flex-direction': 'column',
									'align-items': 'center',
								}}
							>
								<Show when={friends().length === 0}>
									<p class="empty-state">
										Vous n'avez pas encore d'amis ajoutés.
									</p>
								</Show>
								<For each={friends()}>
									{(friend) => (
										<div
											class="friend-item"
											style={{ width: '100%', 'box-sizing': 'border-box' }}
											onClick={() => {
												setSelectedFriend(friend);
												setView('profile');
											}}
										>
											<div
												class="friend-avatar"
												style={{
													'background-image': friend.avatar_url
														? `url(${friend.avatar_url})`
														: 'none',
												}}
											>
												{!friend.avatar_url &&
													friend.username.charAt(0).toUpperCase()}
											</div>
											<div class="friend-details">
												<span class="friend-name">{friend.username}</span>
											</div>
											<div class="friend-arrow">›</div>
										</div>
									)}
								</For>
							</div>
						</div>
					</Show>

					<Show when={view() === 'add'}>
						<div class="add-friend-view fade-in">
							<button onClick={() => setView('list')} class="back-btn">
								← Retour
							</button>
							<h3>Ajouter un ami</h3>
							<div class="search-bar">
								<input
									type="text"
									placeholder="Rechercher (3 car. min)..."
									value={searchQuery()}
									onInput={(e) => setSearchQuery(e.currentTarget.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								/>
								<button onClick={handleSearch} class="btn-primary">
									<FaSolidMagnifyingGlass />
								</button>
							</div>
							<div
								class="search-results"
								style={{ padding: '0', margin: '20px 0 0 0', width: '100%' }}
							>
								<For each={searchResults()}>
									{(user) => (
										<div
											class="friend-item search-item"
											style={{ width: '100%', 'box-sizing': 'border-box' }}
										>
											<span class="friend-name">{user.username}</span>
											<button
												class="btn-sm"
												onClick={() => sendRequest(user.user_id)}
											>
												Ajouter
											</button>
										</div>
									)}
								</For>
							</div>

							<div
								class="invite-box"
								style={{ 'margin-top': '40px', 'text-align': 'center' }}
							>
								<p>Invitez vos amis via un lien</p>
								<button class="btn-primary" onClick={copyLink}>
									<FaSolidLink /> Copier mon lien
								</button>
							</div>
						</div>
					</Show>

					<Show when={view() === 'profile' && selectedFriend()}>
						<div class="friend-profile-view fade-in">
							<button onClick={() => setView('list')} class="back-btn">
								← Retour
							</button>
							<div class="profile-header-center">
								<div
									class="avatar-large"
									style={{
										'background-image': selectedFriend()?.avatar_url
											? `url(${selectedFriend()?.avatar_url})`
											: 'none',
									}}
								>
									{!selectedFriend()?.avatar_url &&
										selectedFriend()?.username.charAt(0)}
								</div>
								<h2>{selectedFriend()?.username}</h2>
								<p class="bio-text">{selectedFriend()?.bio}</p>
							</div>

							<Show
								when={selectedFriend()?.is_graph_public}
								fallback={
									<div class="private-graph">
										<p>Ce joueur a rendu son impact carbone privé 🔒</p>
									</div>
								}
							>
								<div class="stats-section">
									<h4>Son Impact Carbone</h4>
									<div class="graph-card">
										<CarbonGraph emissions={[]} />
									</div>
								</div>
							</Show>
						</div>
					</Show>
				</div>
			</Match>
		</Switch>
	);
};

export default Friends;
