import { useNavigate } from "@solidjs/router"; 

export default function AddFriend() {
    const navigate = useNavigate();
    return <div class="add-friend-container">
        <input class="add-friend-container input" type="text" placeholder="Rechercher un ami..." />
        <button class="add-friend-container button" onClick={() => navigate("/choose-friend")}>
            <img src="public/search-icon.png" />
        </button>
    </div>;
}