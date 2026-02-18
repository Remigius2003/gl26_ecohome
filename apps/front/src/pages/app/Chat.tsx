import {
	createSignal,
	createResource,
	For,
	Show,
	onMount,
	onCleanup,
	createEffect,
} from 'solid-js';
import {
	FaSolidComment,
	FaSolidXmark,
	FaSolidPlus,
	FaSolidUserGroup,
	FaSolidUserMinus,
	FaSolidPaperPlane,
} from 'solid-icons/fa';
import {
	getConversations,
	getChatHistory,
	createConversation,
	sendMessage,
	addParticipant,
	removeParticipant,
	renameConversation,
	friendsListWrapper,
	Conversation,
	Message,
	Profile,
	RTClient,
	Session,
} from '@api';

const TENOR_KEY = 'LIVDSRZULELA';

interface GifResult {
	id: string;
	url: string;
	preview: string;
}

function GifPicker(props: {
	onSelect: (url: string) => void;
	onClose: () => void;
}) {
	const [query, setQuery] = createSignal('');
	const [gifs, setGifs] = createSignal<GifResult[]>([]);
	const [loading, setLoading] = createSignal(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	const fetchGifs = async (q: string) => {
		setLoading(true);
		try {
			const endpoint = q.trim()
				? `https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=18&media_filter=minimal`
				: `https://api.tenor.com/v1/trending?key=${TENOR_KEY}&limit=18&media_filter=minimal`;

			const res = await fetch(endpoint);
			const data = await res.json();

			setGifs(
				(data.results ?? []).map((r: any) => ({
					id: r.id,
					url: r.media[0]?.gif?.url ?? '',
					preview: r.media[0]?.tinygif?.url ?? '',
				})),
			);
		} catch (e) {
			console.error('GIF fetch failed', e);
		} finally {
			setLoading(false);
		}
	};

	onMount(() => fetchGifs(''));

	const handleInput = (e: any) => {
		const val = e.currentTarget.value;
		setQuery(val);
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchGifs(val), 400);
	};

	return (
		<div class="gif-picker" onClick={(e) => e.stopPropagation()}>
			<div class="gif-picker-header">
				<input
					type="text"
					placeholder="Rechercher un GIF…"
					value={query()}
					onInput={handleInput}
					class="gif-search-input"
					autofocus
				/>
				<button class="icon-btn" onClick={props.onClose}>
					<FaSolidXmark />
				</button>
			</div>

			<Show when={loading()}>
				<div
					style={{
						display: 'flex',
						'justify-content': 'center',
						padding: '16px',
					}}
				>
					<div class="spinner-sm" />
				</div>
			</Show>

			<div class="gif-grid">
				<For each={gifs()}>
					{(gif) => (
						<img
							src={gif.preview}
							class="gif-thumbnail"
							alt="gif"
							loading="lazy"
							onClick={() => props.onSelect(gif.url)}
						/>
					)}
				</For>
			</div>
		</div>
	);
}

function MessageBubble(props: { msg: Message; isGroup: boolean }) {
	const isSystem = () => props.msg.sender_id === 0;
	const isMine = () => props.msg.sender_id === Session.userId;
	const isGif = () => props.msg.content.startsWith('[GIF]');
	const gifUrl = () => props.msg.content.slice(5);

	return (
		<Show
			when={!isSystem()}
			fallback={<div class="msg-system">{props.msg.content}</div>}
		>
			<div class={`msg-row ${isMine() ? 'mine' : 'theirs'}`}>
				<div class={`msg-bubble${isGif() ? ' msg-bubble-gif' : ''}`}>
					<Show when={!isMine() && props.isGroup}>
						<div class="msg-sender">{props.msg.sender?.username || 'User'}</div>
					</Show>
					<Show when={isGif()} fallback={<span>{props.msg.content}</span>}>
						<img src={gifUrl()} class="msg-gif" alt="GIF" />
					</Show>
				</div>
			</div>
		</Show>
	);
}

function ConvItem(props: {
	name: string;
	lastMessage: string;
	isActive: boolean;
	isGroup: boolean;
	onClick: () => void;
}) {
	return (
		<div
			class={`conv-item ${props.isActive ? 'active' : ''}`}
			onClick={props.onClick}
		>
			<div class="conv-avatar">
				{props.isGroup ? (
					<FaSolidUserGroup />
				) : (
					props.name.charAt(0).toUpperCase()
				)}
			</div>
			<div class="conv-info">
				<div class="conv-name">{props.name}</div>
				<div class="conv-last">{props.lastMessage}</div>
			</div>
		</div>
	);
}

export default function ChatWidget() {
	const [isOpen, setIsOpen] = createSignal(false);
	const [conversations, setConversations] = createSignal<Conversation[]>([]);
	const [activeConv, setActiveConv] = createSignal<Conversation | null>(null);
	const [messages, setMessages] = createSignal<Message[]>([]);
	const [inputText, setInputText] = createSignal('');
	const [showCreateModal, setShowCreateModal] = createSignal(false);
	const [showManageModal, setShowManageModal] = createSignal(false);
	const [showGifPicker, setShowGifPicker] = createSignal(false);

	let messagesEndRef: HTMLDivElement | undefined;

	const [friends, { refetch: refetchFriends }] = createResource(() =>
		isOpen() ? friendsListWrapper.get() : null,
	);

	const loadConversations = async () => {
		try {
			const convs = await getConversations();
			setConversations(convs);
			refetchFriends();

			const cur = activeConv();
			if (cur) {
				const fresh = convs.find((c) => c.id === cur.id);
				if (fresh) {
					setActiveConv(fresh);
				} else {
					setActiveConv(null);
					setShowManageModal(false);
				}
			}
		} catch (e) {
			console.error('Failed to load chats', e);
		}
	};

	const selectChat = async (conv?: Conversation, friend?: Profile) => {
		try {
			let target = conv;
			if (!target && friend) {
				target = await createConversation([friend.user_id]);
				await loadConversations();
			}
			if (!target) return;

			setActiveConv(target);
			const history = await getChatHistory(target.id);
			setMessages(history.reverse());
		} catch (e) {
			console.error('Failed to open chat', e);
		}
	};

	const handleSend = async (e: Event) => {
		e.preventDefault();
		const text = inputText().trim();
		const conv = activeConv();
		if (!text || !conv) return;

		setInputText('');
		setShowGifPicker(false);
		try {
			const newMsg = await sendMessage(conv.id, text);
			setMessages((prev) => [...prev, newMsg]);
			loadConversations();
		} catch (e) {
			console.error('Failed to send', e);
		}
	};

	const handleSendGif = async (url: string) => {
		const conv = activeConv();
		if (!conv) return;
		setShowGifPicker(false);
		try {
			const newMsg = await sendMessage(conv.id, `[GIF]${url}`);
			setMessages((prev) => [...prev, newMsg]);
			loadConversations();
		} catch (e) {
			console.error('Failed to send GIF', e);
		}
	};

	createEffect(() => {
		if (messages().length && messagesEndRef) {
			messagesEndRef.scrollIntoView({ behavior: 'smooth' });
		}
	});

	onMount(() => {
		RTClient.connect();

		const unsubMsg = RTClient.subscribe('new_message', (payload: Message) => {
			const currentConv = activeConv();
			if (currentConv && payload.conversation_id === currentConv.id) {
				if (payload.sender_id === 0 || payload.sender_id !== Session.userId) {
					setMessages((prev) => [...prev, payload]);
				}
			}
			loadConversations();
		});

		const unsubConv = RTClient.subscribe('new_conversation', () => {
			loadConversations();
		});

		const unsubRenamed = RTClient.subscribe(
			'group_renamed',
			(payload: { conversation_id: number; name: string }) => {
				setConversations((prev) =>
					prev.map((c) =>
						c.id === payload.conversation_id ? { ...c, name: payload.name } : c,
					),
				);
				const cur = activeConv();
				if (cur && cur.id === payload.conversation_id) {
					setActiveConv({ ...cur, name: payload.name });
				}
			},
		);

		onCleanup(() => {
			unsubMsg();
			unsubConv();
			unsubRenamed();
		});
	});

	const dmList = () => {
		const list: Array<{
			friend: Profile | null;
			conv?: Conversation;
			name: string;
		}> = [];
		const usedConvIds = new Set<number>();

		for (const friend of friends() ?? []) {
			const existingConv = conversations().find(
				(c) =>
					c.type === 'dm' &&
					c.participants?.some((p) => p.id === friend.user_id),
			);
			if (existingConv) usedConvIds.add(existingConv.id);
			list.push({ friend, conv: existingConv, name: friend.username });
		}

		for (const c of conversations()) {
			if (c.type !== 'dm' || usedConvIds.has(c.id)) continue;
			const other = c.participants?.find((p) => p.id !== Session.userId);
			list.push({ friend: null, conv: c, name: other?.username ?? 'Unknown' });
		}

		return list;
	};

	const groupList = () => conversations().filter((c) => c.type === 'group');

	return (
		<>
			<Show when={!isOpen()}>
				<div class="chat-widget">
					<button
						class="chat-toggle-btn"
						onClick={() => {
							setIsOpen(true);
							loadConversations();
						}}
					>
						<FaSolidComment />
					</button>
				</div>
			</Show>

			<Show when={isOpen()}>
				<div class="chat-overlay" onClick={() => setShowGifPicker(false)}>
					<div class="chat-container">
						<div class="chat-sidebar">
							<div class="sidebar-header">
								<h3>Chats</h3>
								<div style={{ display: 'flex', gap: '10px' }}>
									<button
										class="icon-btn"
										title="Create Group"
										onClick={() => setShowCreateModal(true)}
									>
										<FaSolidPlus />
									</button>
									<button
										class="icon-btn"
										title="Close"
										onClick={() => setIsOpen(false)}
									>
										<FaSolidXmark />
									</button>
								</div>
							</div>

							<div class="conv-list">
								<div class="sidebar-section-title">Direct Messages</div>
								<For each={dmList()}>
									{(item) => (
										<ConvItem
											name={item.name}
											lastMessage={
												item.conv?.last_message ?? 'Click to start chatting'
											}
											isActive={activeConv()?.id === item.conv?.id}
											isGroup={false}
											onClick={() =>
												selectChat(item.conv, item.friend ?? undefined)
											}
										/>
									)}
								</For>

								<Show when={groupList().length > 0}>
									<div class="sidebar-section-title">Groups</div>
									<For each={groupList()}>
										{(conv) => (
											<ConvItem
												name={conv.name ?? 'Unknown Group'}
												lastMessage={conv.last_message ?? 'No messages'}
												isActive={activeConv()?.id === conv.id}
												isGroup={true}
												onClick={() => selectChat(conv)}
											/>
										)}
									</For>
								</Show>
							</div>
						</div>

						<div class="chat-main">
							<Show
								when={activeConv()}
								fallback={
									<div class="empty-chat">
										Select a friend or group to start chatting
									</div>
								}
							>
								<div class="chat-header">
									<h3>{activeConv()?.name}</h3>
									<Show when={activeConv()?.type === 'group'}>
										<button
											class="icon-btn"
											title="Manage Group"
											onClick={() => setShowManageModal(true)}
										>
											<FaSolidUserGroup />
										</button>
									</Show>
								</div>

								<div class="messages-area">
									<For each={messages()}>
										{(msg) => (
											<MessageBubble
												msg={msg}
												isGroup={activeConv()?.type === 'group'}
											/>
										)}
									</For>
									<div ref={messagesEndRef} />
								</div>

								<div class="chat-input-area">
									<Show when={showGifPicker()}>
										<GifPicker
											onSelect={handleSendGif}
											onClose={() => setShowGifPicker(false)}
										/>
									</Show>

									<button
										type="button"
										class="gif-btn"
										title="Envoyer un GIF"
										onClick={(e) => {
											e.stopPropagation();
											setShowGifPicker((v) => !v);
										}}
									>
										GIF
									</button>

									<form style={{ display: 'contents' }} onSubmit={handleSend}>
										<input
											type="text"
											placeholder={`Message ${activeConv()?.name}…`}
											value={inputText()}
											onInput={(e) => setInputText(e.target.value)}
											onClick={(e) => e.stopPropagation()}
										/>
										<button type="submit" disabled={!inputText().trim()}>
											<FaSolidPaperPlane />
										</button>
									</form>
								</div>
							</Show>
						</div>
					</div>

					<Show when={showCreateModal()}>
						<CreateGroupModal
							friends={friends() ?? []}
							onClose={() => {
								setShowCreateModal(false);
								loadConversations();
							}}
						/>
					</Show>
					<Show when={showManageModal() && activeConv()}>
						<ManageGroupModal
							conv={activeConv()!}
							friends={friends() ?? []}
							onClose={() => {
								setShowManageModal(false);
								loadConversations();
							}}
							onParticipantChanged={() => loadConversations()}
						/>
					</Show>
				</div>
			</Show>
		</>
	);
}

function CreateGroupModal(props: { friends: Profile[]; onClose: () => void }) {
	const [selectedIds, setSelectedIds] = createSignal<number[]>([]);
	const [groupName, setGroupName] = createSignal('');

	const toggle = (id: number) =>
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);

	const canCreate = () =>
		selectedIds().length >= 2 && groupName().trim().length > 0;

	const handleCreate = async () => {
		if (!canCreate()) return;
		try {
			await createConversation(selectedIds(), groupName());
			props.onClose();
		} catch (e) {
			console.error('Failed to create group', e);
		}
	};

	return (
		<div class="modal-overlay">
			<div class="modal-content">
				<h3>Créer un groupe</h3>
				<p class="text-muted mb-10" style={{ 'font-size': '0.85rem' }}>
					Sélectionnez au moins 2 amis
				</p>

				<input
					class="auth-input mb-10"
					placeholder="Nom du groupe (requis)"
					value={groupName()}
					onInput={(e) => setGroupName(e.target.value)}
				/>

				<div class="friends-list-selection">
					<For each={props.friends}>
						{(friend) => (
							<div class="friend-row" onClick={() => toggle(friend.user_id)}>
								<input
									type="checkbox"
									checked={selectedIds().includes(friend.user_id)}
									readOnly
								/>
								<span>{friend.username}</span>
							</div>
						)}
					</For>
				</div>

				<div class="form-actions" style={{ 'margin-top': '15px' }}>
					<button class="btn-secondary" onClick={props.onClose}>
						Annuler
					</button>
					<button
						class="btn-primary"
						onClick={handleCreate}
						disabled={!canCreate()}
						style={{ opacity: canCreate() ? 1 : 0.5 }}
					>
						Créer
					</button>
				</div>
			</div>
		</div>
	);
}

function ManageGroupModal(props: {
	conv: Conversation;
	friends: Profile[];
	onClose: () => void;
	onParticipantChanged: () => void;
}) {
	const [newName, setNewName] = createSignal(props.conv.name ?? '');
	const [renaming, setRenaming] = createSignal(false);

	const currentIds = () => new Set(props.conv.participants.map((p) => p.id));
	const availableFriends = () =>
		props.friends.filter((f) => !currentIds().has(f.user_id));

	const handleAdd = async (id: number) => {
		try {
			await addParticipant(props.conv.id, id);
			props.onParticipantChanged();
		} catch (e) {
			console.error(e);
		}
	};

	const handleRemove = async (id: number) => {
		try {
			await removeParticipant(props.conv.id, id);
			props.onParticipantChanged();
		} catch (e) {
			console.error(e);
		}
	};

	const handleRename = async () => {
		const name = newName().trim();
		if (!name || name === props.conv.name) return;
		setRenaming(true);
		try {
			await renameConversation(props.conv.id, name);
			props.onClose();
		} catch (e) {
			console.error('Rename failed', e);
			alert(
				'Erreur lors du renommage. Vérifiez que le backend supporte PUT /chat/:id/name',
			);
		} finally {
			setRenaming(false);
		}
	};

	async function handleLeave() {
		const confirmed = confirm(
			'Are you sure you want to leave this group? You will lose access to the message history.',
		);
		if (!confirmed) return;

		try {
			await removeParticipant(props.conv.id, Session.userId!);
			props.onClose();
		} catch (err) {
			console.error('Failed to leave group:', err);
			alert('Could not leave the group. Please try again.');
		}
	}

	return (
		<div class="modal-overlay">
			<div class="modal-content">
				<h3>Gérer : {props.conv.name}</h3>

				<h4 style={{ 'margin-bottom': '8px' }}>Renommer le groupe</h4>
				<div class="inline-form mb-10">
					<input
						class="auth-input"
						value={newName()}
						onInput={(e) => setNewName(e.currentTarget.value)}
						placeholder="Nouveau nom…"
					/>
					<button
						class="btn-primary"
						onClick={handleRename}
						disabled={
							renaming() ||
							!newName().trim() ||
							newName().trim() === props.conv.name
						}
					>
						{renaming() ? '…' : 'Renommer'}
					</button>
				</div>

				<h4>Membres</h4>
				<div class="friends-list-selection mb-10">
					<For each={props.conv.participants}>
						{(p) => (
							<div class="friend-row">
								<span>
									{p.username} {p.id === Session.userId ? '(Vous)' : ''}
								</span>
								<Show when={p.id !== Session.userId}>
									<button
										class="icon-btn-danger"
										style={{ width: '24px', height: '24px' }}
										onClick={() => handleRemove(p.id)}
									>
										<FaSolidUserMinus />
									</button>
								</Show>
							</div>
						)}
					</For>
				</div>

				<Show when={availableFriends().length > 0}>
					<h4>Ajouter des amis</h4>
					<div class="friends-list-selection">
						<For each={availableFriends()}>
							{(friend) => (
								<div class="friend-row">
									<span>{friend.username}</span>
									<button
										class="icon-btn-success"
										style={{ width: '24px', height: '24px' }}
										onClick={() => handleAdd(friend.user_id)}
									>
										<FaSolidPlus />
									</button>
								</div>
							)}
						</For>
					</div>
				</Show>

				<div class="form-actions" style={{ 'margin-top': '20px' }}>
					<button
						class="btn-danger-outline"
						onClick={handleLeave}
						style={{ 'font-size': '0.8rem', padding: '5px 10px' }}
					>
						Quitter le groupe
					</button>

					<button class="btn-secondary" onClick={props.onClose}>
						Fermer
					</button>
				</div>
			</div>
		</div>
	);
}
