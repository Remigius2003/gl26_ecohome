import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import "./Social.css";
import { createSignal } from "solid-js";

const friends = [
	{
		id: 1,
		name: "Matys Grangaud",
		avatar: "public/avatar.png",
		description: "Criminel ! Gros chef bandit ! Pour kidnapping !",
	},
	// Ajoute d'autres amis ici si nécessaire
];

export default function ChooseFriend() {
	const navigate = useNavigate();
	const [selectedFriend, setSelectedFriend] = createSignal(null);
	return (
		<div class="social-container">
			{/* Bouton de retour */}
			<button class="btn-back" onClick={() => navigate("/social")}>
				<img src="public/Red-Left-Arrow.png" alt="Retour" />
			</button>

			{/* Titre */}
			<h1 class="friends-title">Personnes</h1>

			{/* Liste d'amis */}
			<div class="friends-list">
				<For each={friends}>
					{(friend) => (
						<div
							class={
								"friend-card" +
								(selectedFriend() === friend.id ? " selected" : "")
							}
							onClick={() => {
								if (selectedFriend() === friend.id) {
									setSelectedFriend(null);
									console.log(`Ami désélectionné : ${friend.name}`);
									return;
								} else {
									setSelectedFriend(friend.id);
									console.log(`Ami sélectionné : ${friend.name}`);
								}
							}}
						>
							<img
								class="friend-avatar"
								src={friend.avatar}
								alt={friend.name}
							/>
							<span class="friend-name">{friend.name}</span>
							<span class="friend-description">{friend.description}</span>
						</div>
					)}
				</For>
			</div>

			{/* Bouton pour ajouter un ami */}
			<button class="btn-add-friend" onClick={() => navigate("/social")}>
				<img src="public/add-friend.jpg" alt="Ajouter un ami" />
			</button>
		</div>
	);
}
