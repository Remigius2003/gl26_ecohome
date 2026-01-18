import { createSignal, createEffect } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { dailyChallenges } from "../../quizz/trashLoader";
import type { defiQuestion, defiAnswer } from "../../quizz/Types";
import { handleDefiAnswer } from "../../quizz/defi";
import "./Quizz.css";

export default function Defi2() {
    const navigate = useNavigate();
    const params = useParams();

    const defi = dailyChallenges.find((d) => d.id === params.defiId);

    const [question, setQuestion] = createSignal<defiQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = createSignal<defiAnswer | null>(
        null
    );
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        setLoading(true);

        if (defi?.overQuestions) {
            setQuestion(defi.overQuestions);
        } else {
            setQuestion(null);
        }

        setLoading(false);
    });

    const handleValidate = () => {
        if (question() && !selectedAnswer()) return;

        if (question() && selectedAnswer()) {
            handleDefiAnswer(question()!.id, selectedAnswer()!);
        }

        navigate("/defi"); // or rewards / defi recap
    };

    if (!defi) {
        return <p>Défi introuvable</p>;
    }

    return (
        <div class="quizz-container">
            {/*<img src="/public/Quizz_game.png" alt="Défi" />*/}

            <h1>
                {loading()
                    ? "Chargement..."
                    : question()
                      ? question()!.text
                      : "Bravo ! Défi complété 🎉"}
            </h1>

            {/* Answers */}
            {question() && (
                <div class="answers-list">
                    {question()!.responses.map((response) => (
                        <button
                            class={
                                selectedAnswer()?.id === response.id
                                    ? "answer selected"
                                    : "answer"
                            }
                            onClick={() => setSelectedAnswer(response)}
                            disabled={loading()}
                        >
                            {response.text}
                        </button>
                    ))}
                </div>
            )}

            <button
                class="validate-button"
                onClick={handleValidate}
                disabled={loading() || (question() && !selectedAnswer())}
            >
                Valider
            </button>
        </div>
    );
}
