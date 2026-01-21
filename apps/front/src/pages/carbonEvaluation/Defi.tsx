import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { dailyChallenges } from "../../quizz/trashLoader";
import "./Defi.css";

import type { FragCategory } from "../../quizz//Types";

export const defiTypeImage: Record<FragCategory, string> = {
    alimentation: "/iconCrop/burger.png",
    transport: "/iconCrop/train.png",
    logement: "/iconCrop/maison.png",
    consommation: "/iconCrop/vetements.png",
};
export default function Defi() {
    const navigate = useNavigate();
    const [selectedDefi, setSelectedDefi] = createSignal<string | null>(null);

    const handleDefiComplete = () => {
        if (!selectedDefi()) return;
        navigate(`/Defi2/${selectedDefi()}`);
    };

    return (
        <div class="defi-container">
            <h1>Défis Écologiques !</h1>

            <button class="btn-back" onClick={() => navigate("/home")}>
                <img
                    src="public/Red-Left-Arrow.png"
                    alt="Retour"
                    width={32}
                    height={24}
                />
            </button>

            <div class="defi-list">
                {dailyChallenges.slice(0, 5).map((defi) => (
                    <div
                        class={`defi-card ${selectedDefi() === defi.id ? "selected" : ""}`}
                        onClick={() => setSelectedDefi(defi.id)}
                    >
                        <img
                            src={defiTypeImage[defi.category]}
                            alt={defi.category}
                        />
                        <h2>{defi.defi}</h2>
                        <p>{defi.overQuestions?.text ?? "Pas de question"}</p>
                        <p>+{defi.leafReward} points</p>
                    </div>
                ))}
            </div>

            <button
                class="complete-button"
                disabled={!selectedDefi()}
                onClick={handleDefiComplete}
            >
                Valider
            </button>
        </div>
    );
}
