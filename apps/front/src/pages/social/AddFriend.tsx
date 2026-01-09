import { useNavigate } from "@solidjs/router";
import "./AddFriend.css";

export default function AddFriend() {
	const navigate = useNavigate();
	return (
		<div class="add-friend-container">
			<input
				class="add-friend-container input"
				type="text"
				placeholder="Rechercher un ami..."
			/>
			<button class="btn-add-friend" onClick={() => navigate("/ChooseFriend")}>
				<img src="public/search-icon.png" />
			</button>
		</div>
	);
}
