import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import {
  FaSolidPaperPlane,
  FaSolidMessage,
  FaSolidXmark,
  FaSolidChevronLeft,
  FaSolidPlus,
} from "solid-icons/fa";
import { RTClient } from "@api";
import {
  getConversations,
  getChatHistory,
  createConversation,
  Conversation,
  Message,
} from "@api";
import { Session } from "@api";
import "./app.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [activeConv, setActiveConv] = createSignal<Conversation | null>(null);
  const [conversations, setConversations] = createSignal<Conversation[]>([]);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [inputValue, setInputValue] = createSignal("");
  const [view, setView] = createSignal<"list" | "chat" | "new">("list");

  const [newChatTargets, setNewChatTargets] = createSignal<string>("");
  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (e) {
      console.error(e);
    }
  };

  onMount(() => {
    if (Session.isAuthenticated) loadConversations();

    const unsubscribe = RTClient.subscribe(
      "new_message",
      (payload: Message) => {
        if (activeConv()?.id === payload.conversation_id) {
          setMessages((prev) => [...prev, payload]);
          scrollToBottom();
        }
        loadConversations();
      },
    );

    onCleanup(() => unsubscribe());
  });

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setView("chat");
    try {
      const hist = await getChatHistory(conv.id);
      setMessages(hist);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = () => {
    if (!inputValue() || !activeConv()) return;

    RTClient.emit("chat_message", {
      conversation_id: activeConv()!.id,
      content: inputValue(),
    });

    setInputValue("");
  };

  const handleCreate = async () => {
    const ids = newChatTargets()
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    if (ids.length === 0) return;

    try {
      const newConv = await createConversation(
        ids,
        ids.length > 1 ? "New Group" : undefined,
      );
      setConversations([newConv, ...conversations()]);
      openConversation(newConv);
    } catch (e) {
      alert("Error creating chat");
    }
  };

  let messagesRef: HTMLDivElement | undefined;
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesRef) messagesRef.scrollTop = messagesRef.scrollHeight;
    }, 50);
  };

  const getChatName = (c: Conversation) => {
    if (c.type === "group") return c.name || "Group Chat";
    return c.participants.length > 1 ? c.participants[0].username : "Unknown";
  };

  return (
    <div class={`chat-widget ${isOpen() ? "open" : ""}`}>
      <div class="chat-toggle-btn" onClick={() => setIsOpen(!isOpen())}>
        <Show when={!isOpen()} fallback={<FaSolidXmark />}>
          <FaSolidMessage />
        </Show>
      </div>

      <Show when={isOpen()}>
        <div class="chat-window glass-panel">
          <div class="chat-header">
            <Show when={view() !== "list"}>
              <button class="back-btn" onClick={() => setView("list")}>
                <FaSolidChevronLeft />
              </button>
            </Show>
            <h3>
              {view() === "list" && "Discussions"}
              {view() === "chat" && (activeConv()?.name || "Chat")}
              {view() === "new" && "Nouveau Message"}
            </h3>
            <Show when={view() === "list"}>
              <button class="add-btn" onClick={() => setView("new")}>
                <FaSolidPlus />
              </button>
            </Show>
          </div>

          <div class="chat-body">
            <Show when={view() === "list"}>
              <div class="conv-list">
                <For each={conversations()}>
                  {(conv) => (
                    <div
                      class="conv-item"
                      onClick={() => openConversation(conv)}>
                      <div class="conv-avatar">
                        {getChatName(conv)[0].toUpperCase()}
                      </div>
                      <div class="conv-info">
                        <div class="conv-name">{getChatName(conv)}</div>
                        <div class="conv-last">Click to open</div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <Show when={view() === "chat"}>
              <div class="messages-area" ref={messagesRef}>
                <For each={messages()}>
                  {(msg) => (
                    <div
                      class={`msg-row ${msg.sender_id === 1 ? "mine" : "theirs"}`}>
                      <div class="msg-bubble">
                        <div class="msg-sender">{msg.sender?.username}</div>
                        {msg.content}
                      </div>
                    </div>
                  )}
                </For>
              </div>
              <div class="chat-input-area">
                <input
                  type="text"
                  value={inputValue()}
                  onInput={(e) => setInputValue(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écrire un message..."
                />
                <button onClick={sendMessage}>
                  <FaSolidPaperPlane />
                </button>
              </div>
            </Show>

            <Show when={view() === "new"}>
              <div class="new-chat-form">
                <label>User IDs (comma separated):</label>
                <input
                  type="text"
                  value={newChatTargets()}
                  onInput={(e) => setNewChatTargets(e.currentTarget.value)}
                  placeholder="e.g. 2, 3"
                />
                <button class="btn-primary" onClick={handleCreate}>
                  Start Chat
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
