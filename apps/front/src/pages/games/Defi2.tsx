import { useNavigate } from "@solidjs/router";
import "./Defi.css";

export default function Defi() {
	const navigate = useNavigate();
	return (
		<div class="defi-container">
			<h1>Félicitations !</h1>
			<button class="btn-back" onClick={() => navigate(-1)}>
				<img
					src="public/Red-Left-Arrow.png"
					alt="Retour"
					width={32}
					height={24}
				/>
			</button>
			<div class="defi-message">
				<p>
					Vous avez réussi le défi écologique ! Merci pour vos efforts en faveur
					de la planète.
				</p>
			</div>
		</div>
	);
}
