import { createSignal, onMount, onCleanup, Show, For } from "solid-js";
import {
  RTClient,
  getConversations,
  getChatHistory,
  Conversation,
  Message,
} from "@api";
import {
  FaSolidPaperPlane,
  FaSolidMessage,
  FaSolidXmark,
} from "solid-icons/fa";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import "./chat.css";

// Helpers
const CURRENT_USER_ID = 1; // TODO: Fetch from Session/JWT Context

export default function ChatInterface() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [activeConv, setActiveConv] = createSignal<Conversation | null>(null);
  const [conversations, setConversations] = createSignal<Conversation[]>([]);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [messageInput, setMessageInput] = createSignal("");
  const [showNewChat, setShowNewChat] = createSignal(false);

  // Refs
  let msgsEndRef: HTMLDivElement | undefined;

  const loadData = async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch (e) {
      console.error(e);
    }
  };

  onMount(() => {
    loadData();

    // WS Listener
    const sub = RTClient.subscribe("new_message", (payload: Message) => {
      // If belongs to active conversation, append
      if (activeConv()?.id === payload.conversation_id) {
        setMessages((prev) => [...prev, payload]);
        scrollToBottom();
      }
      // Reload list to update "Last Message" preview
      loadData();
    });

    onCleanup(() => sub());
  });

  const selectConversation = async (c: Conversation) => {
    setActiveConv(c);
    try {
      const hist = await getChatHistory(c.id);
      setMessages(hist);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = () => {
    if (!messageInput().trim() || !activeConv()) return;

    RTClient.emit("chat_message", {
      conversation_id: activeConv()!.id,
      content: messageInput(),
    });
    setMessageInput("");
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (msgsEndRef) msgsEndRef.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <div class="chat-fab" onClick={() => setIsOpen(true)}>
        <FaSolidMessage />
      </div>

      <Show when={isOpen()}>
        <div class="chat-modal-backdrop">
          <div class="chat-interface-container">
            <button class="global-close-btn" onClick={() => setIsOpen(false)}>
              <FaSolidXmark />
            </button>

            <div class="chat-layout">
              {/* Left Sidebar */}
              <ConversationList
                conversations={conversations()}
                activeId={activeConv()?.id}
                onSelect={selectConversation}
                onNewChat={() => setShowNewChat(true)}
                currentUserId={CURRENT_USER_ID}
              />

              <div class="chat-main-area">
                <Show
                  when={activeConv()}
                  fallback={
                    <div class="empty-state">
                      Select a conversation to start messaging
                    </div>
                  }>
                  <div class="chat-area-header">
                    <h3>{activeConv()?.name || "Chat"}</h3>
                    <span class="participants-count">
                      {activeConv()?.participants.length} participants
                    </span>
                  </div>

                  <div class="messages-scroll">
                    <For each={messages()}>
                      {(msg) => (
                        <div
                          class={`msg-row \${msg.sender_id === CURRENT_USER_ID ? 'mine' : 'theirs'}`}>
                          <div class="msg-bubble">
                            <div class="msg-author">{msg.sender?.username}</div>
                            <div class="msg-text">{msg.content}</div>
                            <div class="msg-meta">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                    <div ref={msgsEndRef} />
                  </div>

                  <div class="input-zone">
                    <input
                      type="text"
                      value={messageInput()}
                      onInput={(e) => setMessageInput(e.currentTarget.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>
                      <FaSolidPaperPlane />
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>

      <Show when={showNewChat()}>
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={() => {
            loadData();
            setShowNewChat(false);
          }}
        />
      </Show>
    </>
  );
}
