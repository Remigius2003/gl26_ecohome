import { createSignal, For, Show } from "solid-js";
import { FaSolidXmark, FaSolidMagnifyingGlass } from "solid-icons/fa";
import { searchUsersApi, Profile } from "@api"; // From friends.ts

interface UserSelectorProps {
  selectedUsers: Profile[];
  onAddUser: (user: Profile) => void;
  onRemoveUser: (userId: number) => void;
}

export default function UserSelector(props: UserSelectorProps) {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<Profile[]>([]);

  let debounceTimer: NodeJS.Timeout;

  const handleInput = (e: InputEvent) => {
    const val = (e.target as HTMLInputElement).value;
    setQuery(val);

    clearTimeout(debounceTimer);
    if (val.length < 3) {
      setResults([]);
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const data = await searchUsersApi(val);
        const filtered = data.filter(
          (u) => !props.selectedUsers.find((s) => s.user_id === u.user_id),
        );
        setResults(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  const selectUser = (user: Profile) => {
    props.onAddUser(user);
    setQuery("");
    setResults([]);
  };

  return (
    <div class="user-selector">
      <div class="selected-tags">
        <For each={props.selectedUsers}>
          {(user) => (
            <div class="user-tag">
              <span>{user.username}</span>
              <button onClick={() => props.onRemoveUser(user.user_id)}>
                <FaSolidXmark />
              </button>
            </div>
          )}
        </For>
      </div>

      <div class="search-wrapper">
        <FaSolidMagnifyingGlass class="search-icon" />
        <input
          type="text"
          class="selector-input"
          placeholder="Search for friends..."
          value={query()}
          onInput={handleInput}
        />
      </div>

      <Show when={results().length > 0}>
        <div class="search-dropdown">
          <For each={results()}>
            {(user) => (
              <div class="dropdown-item" onClick={() => selectUser(user)}>
                <div
                  class="item-avatar"
                  style={{
                    "background-image": `url(\${user.avatar_url})`,
                  }}></div>
                <div class="item-info">
                  <div class="item-name">{user.username}</div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
