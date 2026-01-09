import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import "./Social.css";

//liste d'amis temporaire
const friends = [
	{
		id: 1,
		name: "Matys Grangaud",
		avatar: "public/avatar.png",
		description: "Criminel ! Gros chef bandit ! Pour kidnapping !",
	},
	{
		id: 2,
		name: "Bob",
		avatar: "public/avatar.png",
		description: "Clone de Matys",
	},
	{
		id: 3,
		name: "Charlie",
		avatar: "public/avatar.png",
		description: "Ennemi de Matys",
	},
	{
		id: 4,
		name: "Denis",
		avatar: "public/avatar.png",
		description: "Fan de Matys",
	},
	{
		id: 5,
		name: "Emma",
		avatar: "public/avatar.png",
		description: "Usurpatrice de Matys",
	},
	{
		id: 6,
		name: "Fanny",
		avatar: "public/avatar.png",
		description: "Faux compte de Matys",
	},
];

export default function Social() {
	const navigate = useNavigate();
	return (
		<div class="social-container">
			<button class="btn-back" onClick={() => navigate(-1)}>
				<img
					src="public/Red-Left-Arrow.png"
					alt="Retour"
					width={32}
					height={24}
				/>
			</button>
			<button
				class="btn-notifications"
				onClick={() => navigate("/Notifications")} //faire afficher une image alternative s'il reçoit une notification
			>
				<img src="public/notifications-icon.png" />
			</button>
			<h1 class="friends-title">Mes amis</h1>
			<div class="center-content">
				<div class="friends-list">
					<For each={friends}>
						{(friend) => (
							<div
								class="friend-card"
								onClick={() => navigate(`/social/friend/${friend.id}`)}
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
			</div>
			<button class="btn-add-friend" onClick={() => navigate("/AddFriend")}>
				<img src="public/add-friend.jpg" />
			</button>
		</div>
	);
}
