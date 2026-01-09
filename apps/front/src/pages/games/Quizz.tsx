import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./Quizz.css";

export default function Quizz() {
	const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(null);
	const navigate = useNavigate();

	const handleValidate = () => {
		if (selectedAnswer() !== null) {
			navigate("/Reponse");
		}
	};

	return (
		<div class="quizz-container">
			<img src="public/Quizz_game.png" alt="Quizz" />
			<h1>Question ?</h1>

			<div class="answers-list">
				<button
					class={selectedAnswer() === 1 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(1)}
				>
					Réponse 1
				</button>
				<button
					class={selectedAnswer() === 2 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(2)}
				>
					Réponse 2
				</button>
				<button
					class={selectedAnswer() === 3 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(3)}
				>
					Réponse 3
				</button>
				<button
					class={selectedAnswer() === 4 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(4)}
				>
					Réponse 4
				</button>

				<button
					class={selectedAnswer() === 5 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(5)}
				>
					Réponse 5
				</button>

				<button
					class={selectedAnswer() === 6 ? "answer selected" : "answer"}
					onClick={() => setSelectedAnswer(6)}
				>
					Réponse 6
				</button>
			</div>

			<button
				class="validate-button"
				onClick={handleValidate}
				disabled={selectedAnswer() === null}
			>
				Valider
			</button>
		</div>
	);
}
