// src/components/Quizz.tsx
import { createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { handleAnswer, getQuestion } from "../../quizz/Quizz";
import type { Question } from "../../quizz/Types";
import "./Quizz.css";

export default function Quizz() {
    const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(
        null
    );
    const [questionId, setQuestionId] = createSignal("Q1");
    const [question, setQuestion] = createSignal<Question | null>(null);

    const navigate = useNavigate();

    // Load question whenever questionId changes
    createEffect(async () => {
        const q = await getQuestion(questionId());
        setQuestion(q);
    });

    const handleValidate = async () => {
        const answer = selectedAnswer();
        if (answer === null) return;

        const nextId = await handleAnswer(questionId(), answer);
        console.log(nextId);
        if (nextId != undefined) {
            setQuestionId(nextId);
            setSelectedAnswer(null);
        } else {
            navigate("/PreQuizz");
        }
    };

    return (
        <div class="quizz-container">
            <img src="public/Quizz_game.png" alt="Quizz" />

            {/* QUESTION LABEL */}
            <h1>{question()?.text ?? "Loading..."}</h1>

            <div class="answers-list">
                {question()?.responses.map((response, index) => (
                    <button
                        class={
                            selectedAnswer() === index + 1
                                ? "answer selected"
                                : "answer"
                        }
                        onClick={() => setSelectedAnswer(index + 1)}
                    >
                        {/* ANSWER LABEL */}
                        {response.text}
                    </button>
                ))}
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
