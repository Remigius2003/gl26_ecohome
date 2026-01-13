import { createSignal, createEffect, onCleanup } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import {
    handleAnswer,
    getQuestionByType,
    closeAndSaveCurrentBloc,
    startNewBloc,
} from "../../quizz/Quizz";
import type { Question } from "../../quizz/Types";
import "./Quizz.css";

type QuizzType = "alimentation" | "transport" | "logement" | "consommation";
const DEFAULT_TYPE: QuizzType = "alimentation";

const ROOT_QUESTION_ID: Record<QuizzType, string> = {
    alimentation: "Q1",
    transport: "T1",
    logement: "H1",
    consommation: "C1",
};

export default function Quizz() {
    const navigate = useNavigate();
    const location = useLocation();

    const urlType = new URLSearchParams(location.search).get(
        "type"
    ) as QuizzType | null;
    const validType = Object.keys(ROOT_QUESTION_ID).includes(urlType || "")
        ? urlType!
        : DEFAULT_TYPE;

    const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(
        null
    );
    const [questionId, setQuestionId] = createSignal(
        ROOT_QUESTION_ID[validType]
    );
    const [question, setQuestion] = createSignal<Question | null>(null);
    const [loading, setLoading] = createSignal(true);

    createEffect(async () => {
        setLoading(true);
        try {
            const q = await getQuestionByType(questionId(), validType);
            setQuestion(q);
        } catch (err) {
            console.error("Failed to load question", err);
        } finally {
            setLoading(false);
        }
    });

    // Inside Quizz()
    createEffect(() => {
        // Start a new bloc when quiz begins
        startNewBloc(validType);
    });

    const handleValidate = async () => {
        const answer = selectedAnswer();
        if (answer === null) return;

        try {
            const nextId = await handleAnswer(questionId(), answer, validType);
            if (nextId != undefined) {
                setQuestionId(nextId);
                setSelectedAnswer(null);
            } else {
                // Quiz completed → save bloc
                closeAndSaveCurrentBloc(validType);
                navigate(`/PreQuizz?type=${validType}`);
            }
        } catch (err) {
            console.error("Error handling answer", err);
        }
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    onCleanup(() => window.removeEventListener("beforeunload", beforeUnload));

    return (
        <div class="quizz-container">
            <img src="/public/Quizz_game.png" alt="Quizz" />

            <h1>
                {loading()
                    ? "Chargement..."
                    : (question()?.text ?? "Question introuvable")}
            </h1>

            <div class="answers-list">
                {question()?.responses.map((response, index) => (
                    <button
                        class={
                            selectedAnswer() === index + 1
                                ? "answer selected"
                                : "answer"
                        }
                        onClick={() => setSelectedAnswer(index + 1)}
                        disabled={loading()}
                    >
                        {response.text}
                    </button>
                ))}
            </div>

            <button
                class="validate-button"
                onClick={handleValidate}
                disabled={selectedAnswer() === null || loading()}
            >
                Valider
            </button>
        </div>
    );
}
