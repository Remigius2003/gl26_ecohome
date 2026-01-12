import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import "./Defi.css";

export default function Defi() {
	const navigate = useNavigate();
	const [selectedDefi, setSelectedDefi] = createSignal<number | null>(null);
	const handleDefiComplete = () => {
		navigate("/Defi2");
	};

	return (
		<div class="defi-container">
			<h1>Défis Écologiques !</h1>
			<button class="btn-back" onClick={() => navigate(-1)}>
				<img
					src="public/Red-Left-Arrow.png"
					alt="Retour"
					width={32}
					height={24}
				/>
			</button>
			<div class="defi-list">
				<div
					class={`defi-card ${selectedDefi() === 1 ? "selected" : ""}`}
					onClick={() => setSelectedDefi(1)}
				>
					<div class="defi-icon">
						<img src="public/shower-icon.png" alt="douche" />
					</div>
					<div class="defi-title">
						<h2>Réduire sa consommation d'eau</h2>
					</div>
					<div class="defi-description">
						<p>Commencer League of Legends pour prendre moins de douches</p>
					</div>
					<div class="defi-points">
						<p>+10 points</p>
					</div>
					<div class="help">
						<p>cliquez sur la case pour compléter</p>
					</div>
				</div>
				<div
					class={`defi-card ${selectedDefi() === 2 ? "selected" : ""}`}
					onClick={() => setSelectedDefi(2)}
				>
					<div class="defi-icon">
						<img src="public/recycle-icon.png" alt="recycler" />
					</div>
					<div class="defi-title">
						<h2>Recycler correctement</h2>
					</div>
					<div class="defi-description">
						<p>
							Après la défaite sur LoL, démontez votre ordinateur pour recycler
							ses composants, et ensuite chercher un travail
						</p>
					</div>
					<div class="defi-points">
						<p>+15 points</p>
					</div>
					<div class="help">
						<p>cliquez sur la case pour compléter</p>
					</div>
				</div>
				<div
					class={`defi-card ${selectedDefi() === 3 ? "selected" : ""}`}
					onClick={() => setSelectedDefi(3)}
				>
					<div class="defi-icon">
						<img src="public/tree-icon.png" alt="planter un arbre" />
					</div>
					<div class="defi-title">
						<h2>Planter un arbre</h2>
					</div>
					<div class="defi-description">
						<p>Le jardinage est un hobby plus sain que League of Legends</p>
					</div>
					<div class="defi-points">
						<p>+20 points</p>
					</div>
					<div class="help">
						<p>cliquez sur la case pour compléter</p>
					</div>
				</div>
			</div>
			<button
				class="complete-button"
				onClick={handleDefiComplete}
				disabled={selectedDefi() === null}
			>
				Valider
			</button>
		</div>
	);
}
