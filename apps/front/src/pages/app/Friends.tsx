import {
	Component,
	createSignal,
	For,
	Show,
	onMount,
	onCleanup,
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
	profileWrapper,
	RTClient,
	SearchResult,
	Profile,
	Session,
} from '@api';
import CarbonGraph from './CarbonGraph';

const Avatar: Component<{
	url?: string;
	username: string;
	size?: 'mini' | 'large';
}> = (props) => {
	const [imgError, setImgError] = createSignal(false);

	createEffect(() => {
		if (props.url) setImgError(false);
	});

	const initial = () => props.username?.[0]?.toUpperCase() ?? '?';
	const sizeClass = () =>
		props.size === 'large' ? 'avatar-large' : 'avatar-mini';

	return (
		<div class={`avatar-component ${sizeClass()}`}>
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

const PendingButton: Component<{
	userId: number;
	onCancel: (id: number) => void;
}> = (props) => {
	const [hover, setHover] = createSignal(false);
	return (
		<button
			class={`btn-sm ${hover() ? 'btn-danger' : 'btn-secondary'}`}
			style={{ width: '100px', 'text-align': 'center' }}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={(e) => {
				e.stopPropagation();
				props.onCancel(props.userId);
			}}
		>
			{hover() ? 'Annuler' : 'En attente'}
		</button>
	);
};

const InviteSection: Component<{ myId: number | null }> = (props) => {
	const [copied, setCopied] = createSignal(false);

	const inviteUrl = () =>
		props.myId
			? `${window.location.origin}/invite/${props.myId}`
			: 'Chargement…';

	const copyToClipboard = () => {
		if (!props.myId) return;
		navigator.clipboard.writeText(inviteUrl());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div class="invite-section">
			<div class="invite-title">
				<FaSolidLink size={20} />
				<h3>Inviter un ami</h3>
			</div>
			<p class="text-muted" style={{ 'margin-bottom': '15px' }}>
				Partagez ce lien pour ajouter des amis directement.
			</p>
			<div class="invite-url-row">
				<input
					type="text"
					readOnly
					value={inviteUrl()}
					class="invite-url-input"
				/>
				<button
					class="btn-primary"
					onClick={copyToClipboard}
					style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}
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

const FriendRow: Component<{ friend: Profile; onClick: () => void }> = (
	props,
) => (
	<div class="friend-item clickable" onClick={props.onClick}>
		<div class="user-info">
			<Avatar url={props.friend.avatar_url} username={props.friend.username} />
			<span class="name">{props.friend.username}</span>
		</div>
		<span class="arrow">›</span>
	</div>
);

const RequestRow: Component<{
	req: Profile;
	onView: () => void;
	onRespond: (id: number, action: 'accept' | 'reject') => void;
}> = (props) => (
	<div class="friend-item request">
		<div class="user-info clickable" onClick={props.onView}>
			<Avatar url={props.req.avatar_url} username={props.req.username} />
			<span>{props.req.username}</span>
		</div>
		<div class="actions" style={{ display: 'flex', gap: '8px' }}>
			<button
				class="icon-btn-success"
				onClick={(e) => {
					e.stopPropagation();
					props.onRespond(props.req.user_id, 'accept');
				}}
			>
				<FaSolidCheck />
			</button>
			<button
				class="icon-btn-danger"
				onClick={(e) => {
					e.stopPropagation();
					props.onRespond(props.req.user_id, 'reject');
				}}
			>
				<FaSolidXmark />
			</button>
		</div>
	</div>
);

const SearchRow: Component<{
	user: SearchResult;
	onView: () => void;
	onAdd: (id: number) => void;
	onCancel: (id: number) => void;
}> = (props) => (
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
				<PendingButton userId={props.user.user_id} onCancel={props.onCancel} />
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

const MyFriendsTab: Component<{
	friends: Profile[];
	requests: Profile[];
	onViewProfile: (p: Profile) => void;
	onRespond: (id: number, action: 'accept' | 'reject') => void;
}> = (props) => (
	<div class="tab-content fade-in">
		<Show when={props.requests.length > 0}>
			<div class="section-header">Demandes reçues</div>
			<For each={props.requests}>
				{(req) => (
					<RequestRow
						req={req}
						onView={() => props.onViewProfile(req)}
						onRespond={props.onRespond}
					/>
				)}
			</For>
		</Show>

		<div class="section-header">Ma liste ({props.friends.length})</div>
		<Show when={props.friends.length === 0}>
			<p class="empty-text">Pas encore d'amis.</p>
		</Show>
		<For each={props.friends}>
			{(friend) => (
				<FriendRow
					friend={friend}
					onClick={() => props.onViewProfile(friend)}
				/>
			)}
		</For>
	</div>
);

const AddFriendsTab: Component<{
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
}> = (props) => (
	<div class="tab-content fade-in">
		<InviteSection myId={props.myId} />

		<div class="search-wrapper">
			<FaSolidMagnifyingGlass class="search-icon" />
			<input
				type="text"
				placeholder="Rechercher un pseudo…"
				value={props.searchQuery}
				onInput={props.onSearchInput}
				class="search-input"
			/>
		</div>

		<Show when={props.searchQuery.length > 0}>
			<div class="search-results-list">
				<Show when={props.isSearching}>
					<div class="spinner-sm" />
				</Show>
				<For each={props.searchResults}>
					{(user) => (
						<SearchRow
							user={user}
							onView={async () =>
								props.onViewProfile(await props.fetchFullProfile(user.user_id))
							}
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

const ProfileDetailView: Component<{ profile: Profile; onBack: () => void }> = (
	props,
) => (
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
					<div class="private-state">
						<FaSolidClock size={24} />
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
	type Tab = 'friends' | 'add' | 'profile';

	const [activeTab, setActiveTab] = createSignal<Tab>('friends');
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

	let searchTimeout: ReturnType<typeof setTimeout>;

	const refreshAll = async () => {
		try {
			const [f, rec, sent] = await Promise.all([
				friendsListWrapper.get(),
				friendRequestsWrapper.get(),
				sentFriendRequestsWrapper.get(),
			]);
			setFriends(f ?? []);
			setReceivedRequests(rec ?? []);
			setSentRequests(sent ?? []);
		} catch (e) {
			console.error(e);
		}
	};

	onMount(() => {
		friendsListWrapper.invalidate(undefined);
		friendRequestsWrapper.invalidate(undefined);
		sentFriendRequestsWrapper.invalidate(undefined);
		refreshAll();

		RTClient.connect();

		const unsubRequest = RTClient.subscribe(
			'friend_request',
			(payload: Profile) => {
				friendRequestsWrapper.invalidate(undefined);
				setReceivedRequests((prev) =>
					prev.some((r) => r.user_id === payload.user_id)
						? prev
						: [...prev, payload],
				);
			},
		);

		const unsubCancelled = RTClient.subscribe(
			'friend_request_cancelled',
			(p: { user_id: number }) => {
				friendRequestsWrapper.invalidate(undefined);
				setReceivedRequests((prev) =>
					prev.filter((r) => r.user_id !== p.user_id),
				);
			},
		);

		const unsubAccepted = RTClient.subscribe(
			'friend_request_accepted',
			(payload: Profile) => {
				friendsListWrapper.invalidate(undefined);
				sentFriendRequestsWrapper.invalidate(undefined);
				setSentRequests((prev) =>
					prev.filter((r) => r.user_id !== payload.user_id),
				);
				setFriends((prev) =>
					prev.some((f) => f.user_id === payload.user_id)
						? prev
						: [...prev, payload],
				);
			},
		);

		const unsubRejected = RTClient.subscribe(
			'friend_request_rejected',
			(p: { user_id: number }) => {
				sentFriendRequestsWrapper.invalidate(undefined);
				setSentRequests((prev) => prev.filter((r) => r.user_id !== p.user_id));
			},
		);

		onCleanup(() => {
			unsubRequest();
			unsubCancelled();
			unsubAccepted();
			unsubRejected();
		});
	});

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
				setSearchResults((await searchUsersApi(val)) ?? []);
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
			sentFriendRequestsWrapper.invalidate(undefined);
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
			sentFriendRequestsWrapper.invalidate(undefined);
		} catch (e) {
			alert("Erreur lors de l'annulation");
		}
	};

	const handleRespond = async (id: number, action: 'accept' | 'reject') => {
		try {
			await respondToRequest(id, action);
			friendsListWrapper.invalidate(undefined);
			friendRequestsWrapper.invalidate(undefined);
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
						{receivedRequests().length > 0 && <span class="badge-dot" />}
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
