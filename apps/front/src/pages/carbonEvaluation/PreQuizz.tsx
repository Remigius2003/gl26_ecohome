import { useNavigate, useLocation } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import type { CompleteInfo } from "../../quizz/Types";
import { getAllBlocEmissions, normalizeCarbon } from "../../quizz/Quizz";
import "./PreQuizz.css";
import CarbonGraph from "./CarbonGraph";

type QuizzType = "alimentation" | "transport" | "logement" | "consommation";

const TYPE_CONFIG: Record<QuizzType, { title: string }> = {
    alimentation: { title: "ALIMENTATION" },
    transport: { title: "TRANSPORT" },
    logement: { title: "LOGEMENT" },
    consommation: { title: "CONSOMMATION" },
};

const TYPE_BG_CLASS: Record<QuizzType, string> = {
    alimentation: "bg-alimentation",
    transport: "bg-transport",
    logement: "bg-logement",
    consommation: "bg-consommation",
};

const DEFAULT_TYPE: QuizzType = "alimentation";

export default function PreQuizz() {
    const navigate = useNavigate();
    const location = useLocation();

    const urlType = new URLSearchParams(location.search).get(
        "type",
    ) as QuizzType | null;
    const validType = Object.keys(TYPE_CONFIG).includes(urlType || "")
        ? urlType!
        : DEFAULT_TYPE;

    const config = TYPE_CONFIG[validType];

    const [emissions, setEmissions] = createSignal<CompleteInfo[]>([]);
    const [lastValue, setLastValue] = createSignal<number | null>(null);

    onMount(() => {
        const savedEmissions = getAllBlocEmissions(validType);
        setEmissions(savedEmissions);

        if (savedEmissions.length > 0) {
            const last = savedEmissions[savedEmissions.length - 1];
            setLastValue(normalizeCarbon(last.emission));
        } else {
            setLastValue(null);
        }
    });

    const startQuizzPath = `/Quizz?type=${validType}`;

    return (
        <div class={`alim-page ${TYPE_BG_CLASS[validType]}`}>
            <button class="back-button" onClick={() => navigate("/home")}>
                ← Retour
            </button>

            <h1 class="alim-title">{config.title}</h1>

            <button
                class="start-quizz-button"
                onClick={() => navigate(startQuizzPath)}
            >
                Faire le quizz
            </button>

            <div class="graph-container">
                <h2>
                    Évolution de l’impact carbone :{" "}
                    {lastValue() !== null ? `${lastValue()} kg/semaine` : "-"}
                </h2>
                <CarbonGraph emissions={emissions()} />
            </div>
        </div>
    );
}
