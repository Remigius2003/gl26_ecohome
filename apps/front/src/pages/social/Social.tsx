import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";

//liste d'amis temporaire
const friends = [
    { id: 1, name: "Alice", avatar: "public/avatar.png" },
    { id: 2, name: "Bob", avatar: "public/avatar.png" },
    { id: 3, name: "Charlie", avatar: "public/avatar.png" },
    { id: 4, name: "Denis", avatar: "public/avatar.png" },
    { id: 5, name: "Emma", avatar: "public/avatar.png" },
    { id: 6, name: "Fanny", avatar: "public/avatar.png" },
];

export default function Social() {
  const navigate = useNavigate();
  return <div class="social-container">
    <button class="btn-back" onClick={() => navigate(-1)}>
      <img src="public/Red-Left-Arrow-PNG-Clipart-2595795370.png" />
      </button>
    <h1 class="friends-title">Mes amis</h1>
    <div class="center-content">
      <div class="card">
        <div class="card-image">
          <img src="public/avatar.png" />
        </div>
        <div class="card-input">
          <p class="card-name">Matys Grangaud</p>
          <p class="card-description">Criminel ! Gros chef bandit ! Pour kidnapping !</p>
        </div>
      </div>
    </div>
    <div class="friends-list">
      <For each={friends}>
        {friend => (
          <div class="friend-item">
            <img src={friend.avatar} />
            //Le nom peut varier car je ne suis pas encore sure de l'arborescence
            <button class="friend-name" onClick={() => navigate("/social/friend/${friend.id}")}>
              {friend.name}
            </button>
          </div>
        )}
      </For>
    </div>
    <button class="btn-add-friend" onClick={()=> navigate("/add-friend")}>
      <img src="public/add-friend.png"/>
    </button>

  </div>;
}