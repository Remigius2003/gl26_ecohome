import { For } from "solid-js";
import { Conversation } from "@api/chat";
import { FaSolidPlus } from "solid-icons/fa";

interface Props {
  conversations: Conversation[];
  activeId?: number;
  onSelect: (c: Conversation) => void;
  onNewChat: () => void;
  currentUserId: number;
}

export default function ConversationList(props: Props) {
  const getChatName = (c: Conversation) => {
    if (c.type === "group") return c.name || "Group Chat";
    const other = c.participants.find((p) => p.id !== props.currentUserId);
    return other ? other.username : "Unknown";
  };

  const getLastMsg = (c: Conversation) => {
    return (c as any).last_message || "...";
  };

  return (
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
        <button class="icon-btn" onClick={props.onNewChat} title="New Chat">
          <FaSolidPlus />
        </button>
      </div>

      <div class="sidebar-list">
        <For each={props.conversations}>
          {(conv) => (
            <div
              class={`conv-item \${props.activeId === conv.id ? 'active' : ''}`}
              onClick={() => props.onSelect(conv)}>
              <div class="conv-avatar">
                {getChatName(conv)[0].toUpperCase()}
              </div>
              <div class="conv-info">
                <div class="conv-top">
                  <span class="conv-name">{getChatName(conv)}</span>
                </div>
                <div class="conv-preview">{getLastMsg(conv)}</div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
