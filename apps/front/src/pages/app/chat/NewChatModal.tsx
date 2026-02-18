import { createSignal, Show } from "solid-js";
import { createConversation, Profile } from "@api";
import UserSelector from "./UserSelector";
import { FaSolidXmark } from "solid-icons/fa";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewChatModal(props: Props) {
  const [step, setStep] = createSignal(1);
  const [selectedUsers, setSelectedUsers] = createSignal<Profile[]>([]);
  const [groupName, setGroupName] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleAdd = (u: Profile) => setSelectedUsers((prev) => [...prev, u]);
  const handleRemove = (id: number) =>
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== id));

  const submit = async () => {
    if (selectedUsers().length === 0) return;
    setLoading(true);

    try {
      const ids = selectedUsers().map((u) => u.user_id);
      // Determine name: if > 1 person and no name, backend might error or we default
      const name = selectedUsers().length > 1 ? groupName() : undefined;

      await createConversation(ids, name);
      props.onCreated();
      props.onClose();
    } catch (e) {
      alert("Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="modal-overlay" style={{ "z-index": 1000 }}>
      <div class="new-chat-modal">
        <div class="modal-header">
          <h3>New Conversation</h3>
          <button class="close-btn" onClick={props.onClose}>
            <FaSolidXmark />
          </button>
        </div>

        <div class="modal-body">
          <label>Add Participants:</label>
          <UserSelector
            selectedUsers={selectedUsers()}
            onAddUser={handleAdd}
            onRemoveUser={handleRemove}
          />

          <Show when={selectedUsers().length > 1}>
            <div class="group-name-field fade-in">
              <label>Group Name (Optional)</label>
              <input
                type="text"
                class="auth-input"
                value={groupName()}
                onInput={(e) => setGroupName(e.currentTarget.value)}
                placeholder="e.g. Eco Team"
              />
            </div>
          </Show>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" onClick={props.onClose}>
            Cancel
          </button>
          <button
            class="btn-primary"
            onClick={submit}
            disabled={loading() || selectedUsers().length === 0}>
            {loading() ? "Creating..." : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
