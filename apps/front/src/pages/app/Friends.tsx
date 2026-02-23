import {
	Component,
	createSignal,
	For,
	Show,
	onMount,
	Switch,
	Match,
	createEffect,
} from 'solid-js';
import {
	FaSolidCheck,
	FaSolidXmark,
	FaSolidMagnifyingGlass,
	FaSolidUserPlus,
	FaSolidClock,
	FaSolidUserCheck,
	FaSolidArrowLeft,
	FaSolidCopy,
	FaSolidLink,
} from 'solid-icons/fa';
import {
	friendsListWrapper,
	friendRequestsWrapper,
	sentFriendRequestsWrapper,
	searchUsersApi,
	sendFriendRequest,
	respondToRequest,
	cancelFriendRequest,
	SearchResult,
	profileWrapper,
	Profile,
	Session,
} from '@api';
import CarbonGraph from './CarbonGraph';

const Avatar = (props: {
	url?: string;
	username: string;
	size?: 'mini' | 'large';
}) => {
	const initial = () => props.username?.[0]?.toUpperCase() ?? '?';
	const [imgError, setImgError] = createSignal(false);
	const isLarge = props.size === 'large';
	const sizeClass = isLarge ? 'avatar-large' : 'avatar-mini';

	createEffect(() => {
		if (props.url) setImgError(false);
	});

	return (
		<div class={`avatar-component ${sizeClass}`}>
			<Show
				when={!!props.url && !imgError()}
				fallback={<span class="avatar-placeholder">{initial()}</span>}
			>
				<img
					src={props.url}
					alt={props.username}
					onError={() => setImgError(true)}
				/>
			</Show>
		</div>
	);
};

const PendingButton = (props: {
	userId: number;
	onCancel: (id: number) => void;
}) => {
	const [hover, setHover] = createSignal(false);
	return (
		<button
			class={`btn-sm ${hover() ? 'btn-danger' : 'btn-secondary'}`}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={(e) => {
				e.stopPropagation();
				props.onCancel(props.userId);
			}}
			style={{ width: '100px', 'text-align': 'center' }}
		>
			{hover() ? 'Annuler' : 'En attente'}
		</button>
	);
};

const InviteSection = (props: { myId: number | null }) => {
	const [copied, setCopied] = createSignal(false);

	const inviteUrl = () => {
		if (!props.myId) return 'Chargement...';
		return `${window.location.origin}/invite/${props.myId}`;
	};

	const copyToClipboard = () => {
		if (!props.myId) return;
		navigator.clipboard.writeText(inviteUrl());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			class="glass-panel"
			style={{
				background: 'var(--glass-bg)',
				border: '1px solid rgba(40, 167, 69, 0.2)',
				padding: '20px',
				'border-radius': '16px',
				'margin-bottom': '25px',
				'text-align': 'center',
			}}
		>
			<div
				style={{
					display: 'flex',
					'align-items': 'center',
					'justify-content': 'center',
					gap: '10px',
					'margin-bottom': '10px',
					color: 'var(--primary-green)',
				}}
			>
				<FaSolidLink size={20} />
				<h3 style={{ margin: 0, 'font-size': '1.1rem' }}>Inviter un ami</h3>
			</div>
			<p style={{ color: '#666', 'font-size': '0.9rem', margin: '0 0 15px 0' }}>
				Partagez ce lien pour ajouter des amis directement.
			</p>

			<div
				style={{
					display: 'flex',
					gap: '8px',
					'background-color': '#fff',
					padding: '6px',
					'border-radius': '12px',
					border: '1px solid #ddd',
				}}
			>
				<input
					type="text"
					readOnly
					value={inviteUrl()}
					style={{
						border: 'none',
						outline: 'none',
						'flex-grow': 1,
						padding: '8px',
						color: '#555',
						'font-size': '0.9rem',
						background: 'transparent',
						'text-overflow': 'ellipsis',
					}}
				/>
				<button
					onClick={copyToClipboard}
					class="btn-primary"
					style={{
						padding: '8px 16px',
						display: 'flex',
						'align-items': 'center',
						gap: '6px',
						'font-size': '0.85rem',
						transition: 'all 0.2s',
						background: copied() ? 'var(--dark-green)' : 'var(--primary-green)',
					}}
				>
					<Show when={copied()} fallback={<FaSolidCopy />}>
						<FaSolidCheck />
					</Show>
					{copied() ? 'Copié !' : 'Copier'}
				</button>
			</div>
		</div>
	);
};

const FriendRow = (props: { friend: Profile; onClick: () => void }) => (
	<div class="friend-item clickable" onClick={props.onClick}>
		<div class="user-info">
			<Avatar url={props.friend.avatar_url} username={props.friend.username} />
			<span class="name">{props.friend.username}</span>
		</div>
		<span class="arrow">›</span>
	</div>
);

const RequestRow = (props: {
	req: Profile;
	onView: () => void;
	onRespond: (id: number, action: 'accept' | 'reject') => void;
}) => (
	<div class="friend-item request">
		<div class="user-info clickable" onClick={props.onView}>
			<Avatar url={props.req.avatar_url} username={props.req.username} />
			<span>{props.req.username}</span>
		</div>
		<div class="actions" style={{ display: 'flex', gap: '8px' }}>
			<button
				onClick={(e) => {
					e.stopPropagation();
					props.onRespond(props.req.user_id, 'accept');
				}}
				style={{
					width: '32px',
					height: '32px',
					'border-radius': '50%',
					border: 'none',
					background: 'var(--primary-green)',
					color: 'white',
					display: 'flex',
					'align-items': 'center',
					'justify-content': 'center',
					cursor: 'pointer',
				}}
			>
				<FaSolidCheck />
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					props.onRespond(props.req.user_id, 'reject');
				}}
				style={{
					width: '32px',
					height: '32px',
					'border-radius': '50%',
					border: 'none',
					background: 'var(--danger-red)',
					color: 'white',
					display: 'flex',
					'align-items': 'center',
					'justify-content': 'center',
					cursor: 'pointer',
				}}
			>
				<FaSolidXmark />
			</button>
		</div>
	</div>
);

const UserSearchRow = (props: {
	user: SearchResult;
	onView: () => void;
	onAdd: (id: number) => void;
	onCancel: (id: number) => void;
}) => {
	return (
		<div class="friend-item">
			<div class="user-info clickable" onClick={props.onView}>
				<Avatar url={props.user.avatar_url} username={props.user.username} />
				<span>{props.user.username}</span>
			</div>

			<Switch>
				<Match when={props.user.status === 'FRIEND'}>
					<span class="badge-friend">
						<FaSolidUserCheck /> Amis
					</span>
				</Match>
				<Match when={props.user.status === 'PENDING_SENT'}>
					<PendingButton
						userId={props.user.user_id}
						onCancel={props.onCancel}
					/>
				</Match>
				<Match when={props.user.status === 'PENDING_RECEIVED'}>
					<span class="badge-info">Reçue</span>
				</Match>
				<Match when={props.user.status === 'NONE'}>
					<button
						class="btn-primary-sm"
						onClick={() => props.onAdd(props.user.user_id)}
					>
						<FaSolidUserPlus /> Ajouter
					</button>
				</Match>
			</Switch>
		</div>
	);
};

const MyFriendsTab = (props: {
	friends: Profile[];
	requests: Profile[];
	onViewProfile: (p: Profile) => void;
	onRespond: (id: number, action: 'accept' | 'reject') => void;
}) => (
	<div class="tab-content fade-in">
		<Show when={props.requests.length > 0}>
			<div class="section-header">Demandes reçues</div>
			<div class="requests-list">
				<For each={props.requests}>
					{(req) => (
						<RequestRow
							req={req}
							onView={() => props.onViewProfile(req)}
							onRespond={props.onRespond}
						/>
					)}
				</For>
			</div>
		</Show>

		<div class="section-header">Ma liste ({props.friends.length})</div>
		<Show when={props.friends.length === 0}>
			<p class="empty-text">Pas encore d'amis.</p>
		</Show>
		<div class="friends-list-scroll">
			<For each={props.friends}>
				{(friend) => (
					<FriendRow
						friend={friend}
						onClick={() => props.onViewProfile(friend)}
					/>
				)}
			</For>
		</div>
	</div>
);

const AddFriendsTab = (props: {
	myId: number | null;
	searchQuery: string;
	onSearchInput: (e: any) => void;
	isSearching: boolean;
	searchResults: SearchResult[];
	sentRequests: Profile[];
	onViewProfile: (p: Profile) => void;
	onAdd: (id: number) => void;
	onCancel: (id: number) => void;
	fetchFullProfile: (id: number) => Promise<Profile>;
}) => (
	<div class="tab-content fade-in">
		<InviteSection myId={props.myId} />

		<div class="search-wrapper">
			<FaSolidMagnifyingGlass class="search-icon" />
			<input
				type="text"
				placeholder="Rechercher un pseudo..."
				value={props.searchQuery}
				onInput={props.onSearchInput}
				class="search-input"
			/>
		</div>

		<Show when={props.searchQuery.length > 0}>
			<div class="search-results-list">
				<Show when={props.isSearching}>
					<div class="spinner-sm"></div>
				</Show>
				<For each={props.searchResults}>
					{(user) => (
						<UserSearchRow
							user={user}
							onView={async () => {
								const full = await props.fetchFullProfile(user.user_id);
								props.onViewProfile(full);
							}}
							onAdd={props.onAdd}
							onCancel={props.onCancel}
						/>
					)}
				</For>
			</div>
		</Show>

		<Show when={!props.searchQuery && props.sentRequests.length > 0}>
			<div class="section-header" style={{ 'margin-top': '20px' }}>
				Demandes envoyées
			</div>
			<For each={props.sentRequests}>
				{(req) => (
					<div class="friend-item">
						<div
							class="user-info clickable"
							onClick={() => props.onViewProfile(req)}
						>
							<Avatar url={req.avatar_url} username={req.username} />
							<span class="name">{req.username}</span>
						</div>
						<PendingButton userId={req.user_id} onCancel={props.onCancel} />
					</div>
				)}
			</For>
		</Show>

		<Show
			when={
				!props.searchQuery &&
				props.sentRequests.length === 0 &&
				props.searchResults.length === 0
			}
		>
			<div
				style={{ 'text-align': 'center', color: '#999', 'margin-top': '40px' }}
			>
				<p>Recherchez un ami pour l'ajouter !</p>
			</div>
		</Show>
	</div>
);

const ProfileDetailView = (props: { profile: Profile; onBack: () => void }) => (
	<div class="friend-profile-view fade-in">
		<div class="back-nav">
			<button onClick={props.onBack} class="back-btn">
				<FaSolidArrowLeft /> Retour
			</button>
		</div>

		<div class="friend-profile-card">
			<div class="profile-header">
				<Avatar
					url={props.profile.avatar_url}
					username={props.profile.username}
					size="large"
				/>
				<h2 class="profile-username">{props.profile.username}</h2>
				<p class="profile-bio">{props.profile.bio || 'Aucune biographie.'}</p>
			</div>

			<Show
				when={props.profile.is_graph_public}
				fallback={
					<div class="private-state" style={{ padding: '20px', opacity: 0.6 }}>
						<FaSolidClock size={24} style={{ 'margin-bottom': '10px' }} />
						<p>L'impact carbone de ce joueur est privé.</p>
					</div>
				}
			>
				<div class="stats-box" style={{ width: '100%' }}>
					<h4 style={{ 'margin-bottom': '15px', color: '#666' }}>
						Impact Carbone
					</h4>
					<CarbonGraph emissions={[]} />
				</div>
			</Show>
		</div>
	</div>
);

const Friends: Component = () => {
	const [activeTab, setActiveTab] = createSignal<'friends' | 'add' | 'profile'>(
		'friends',
	);
	const [previousTab, setPreviousTab] = createSignal<'friends' | 'add'>(
		'friends',
	);

	const [friends, setFriends] = createSignal<Profile[]>([]);
	const [receivedRequests, setReceivedRequests] = createSignal<Profile[]>([]);
	const [sentRequests, setSentRequests] = createSignal<Profile[]>([]);

	const [searchQuery, setSearchQuery] = createSignal('');
	const [searchResults, setSearchResults] = createSignal<SearchResult[]>([]);
	const [isSearching, setIsSearching] = createSignal(false);

	const [selectedFriend, setSelectedFriend] = createSignal<Profile | null>(
		null,
	);
	let searchTimeout: any;

	const refreshAll = async () => {
		try {
			const [f, rec, sent] = await Promise.all([
				friendsListWrapper.get(),
				friendRequestsWrapper.get(),
				sentFriendRequestsWrapper.get(),
			]);

			const mappedFriends = (f || []).map((friend: any) => ({
				...friend,
				user_id: friend.friend_id,
			}));

			setFriends(f || []);
			setReceivedRequests(rec || []);
			setSentRequests(sent || []);
		} catch (e) {
			console.error(e);
		}
	};

	onMount(refreshAll);

	const viewProfile = (user: Profile) => {
		if (activeTab() !== 'profile')
			setPreviousTab(activeTab() as 'friends' | 'add');
		setSelectedFriend(user);
		setActiveTab('profile');
	};

	const handleBack = () => {
		setActiveTab(previousTab());
		setSelectedFriend(null);
	};

	const handleSearchInput = (e: any) => {
		const val = e.currentTarget.value;
		setSearchQuery(val);
		clearTimeout(searchTimeout);
		if (val.length < 1) {
			setSearchResults([]);
			return;
		}

		searchTimeout = setTimeout(async () => {
			setIsSearching(true);
			try {
				const res = await searchUsersApi(val);
				setSearchResults(res || []);
			} catch (e) {
				console.error(e);
			}
			setIsSearching(false);
		}, 300);
	};

	const handleSendRequest = async (id: number) => {
		try {
			await sendFriendRequest(id);
			setSearchResults((prev) =>
				prev.map((u) =>
					u.user_id === id ? { ...u, status: 'PENDING_SENT' } : u,
				),
			);
			refreshAll();
		} catch (e) {
			alert("Erreur lors de l'envoi");
		}
	};

	const handleCancelRequest = async (id: number) => {
		try {
			await cancelFriendRequest(id);
			setSentRequests((prev) => prev.filter((u) => u.user_id !== id));
			setSearchResults((prev) =>
				prev.map((u) => (u.user_id === id ? { ...u, status: 'NONE' } : u)),
			);
		} catch (e) {
			alert("Erreur lors de l'annulation");
		}
	};

	const handleRespond = async (id: number, action: 'accept' | 'reject') => {
		try {
			await respondToRequest(id, action);
			refreshAll();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div class="friends-container fade-in" style={{ width: '100%' }}>
			<Show when={activeTab() !== 'profile'}>
				<div class="friends-nav">
					<button
						class={`nav-tab ${activeTab() === 'friends' ? 'active' : ''}`}
						onClick={() => setActiveTab('friends')}
					>
						Mes Amis
						{receivedRequests().length > 0 && <span class="badge-dot"></span>}
					</button>
					<button
						class={`nav-tab ${activeTab() === 'add' ? 'active' : ''}`}
						onClick={() => setActiveTab('add')}
					>
						Ajouter
					</button>
				</div>
			</Show>

			<Switch>
				<Match when={activeTab() === 'friends'}>
					<MyFriendsTab
						friends={friends()}
						requests={receivedRequests()}
						onViewProfile={viewProfile}
						onRespond={handleRespond}
					/>
				</Match>

				<Match when={activeTab() === 'add'}>
					<AddFriendsTab
						myId={Session.userId}
						searchQuery={searchQuery()}
						onSearchInput={handleSearchInput}
						isSearching={isSearching()}
						searchResults={searchResults()}
						sentRequests={sentRequests()}
						onViewProfile={viewProfile}
						onAdd={handleSendRequest}
						onCancel={handleCancelRequest}
						fetchFullProfile={(id) => profileWrapper.get(id)}
					/>
				</Match>

				<Match when={activeTab() === 'profile' && selectedFriend()}>
					<ProfileDetailView profile={selectedFriend()!} onBack={handleBack} />
				</Match>
			</Switch>
		</div>
	);
};

export default Friends;
