import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import type { Defi } from "../../quizz/Defi";
import { dailyChallenges } from "../../quizz/trashLoader"; // ton tableau de défis
import "./Defi.css";

export default function Defi() {
    const navigate = useNavigate();
    const [selectedDefi, setSelectedDefi] = createSignal<string | null>(null);

    const handleDefiComplete = () => {
        // Ici tu peux ajouter la logique pour enregistrer le défi complété si nécessaire
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
                {dailyChallenges.map((defi, index) => {
                    const isSelected = selectedDefi() === defi.id;

                    return (
                        <div
                            class={`defi-card ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedDefi(defi.id)}
                            key={defi.id}
                        >
                            <div class="defi-icon">
                                <img
                                    src={defi.icon || "public/default-icon.png"}
                                    alt={defi.defi}
                                />
                            </div>
                            <div class="defi-title">
                                <h2>{defi.defi}</h2>
                            </div>
                            <div class="defi-description">
                                <p>
                                    {defi.overQuestions?.text ||
                                        "Pas de description"}
                                </p>
                            </div>
                            <div class="defi-points">
                                <p>+{defi.leafReward} points</p>
                            </div>
                            <div class="help">
                                <p>cliquez sur la case pour compléter</p>
                            </div>
                        </div>
                    );
                })}
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
