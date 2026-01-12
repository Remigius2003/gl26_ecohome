import { useNavigate, useLocation } from "@solidjs/router";
import { createSignal, onMount, createMemo } from "solid-js";
import type { CarbonFrag } from "../../quizz/Types";
import {
    getStoredFragsByCategory,
    lisseCarbonFrag,
    normalizeCarbon,
} from "../../quizz/Quizz";
import "./PreQuizz.css";
import CarbonGraph from "./CarbonGraph";

// Define supported types
type QuizzType = "alimentation" | "transport" | "logement" | "consommation";

// Configuration per type
const TYPE_CONFIG: Record<
    QuizzType,
    {
        title: string;
        fragLoc: string;
    }
> = {
    alimentation: {
        title: "ALIMENTATION",
        fragLoc: "carbonFrags_alimentation",
    },
    transport: {
        title: "TRANSPORT",
        fragLoc: "carbonFrags_transport",
    },
    logement: {
        title: "LOGEMENT",
        fragLoc: "carbonFrags_logement",
    },
    consommation: {
        title: "CONSOMMATION",
        fragLoc: "carbonFrags_consommation",
    },
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

    // Parse `?type=...` from URL
    const urlType = new URLSearchParams(location.search).get(
        "type"
    ) as QuizzType | null;
    const validType = Object.keys(TYPE_CONFIG).includes(urlType || "")
        ? urlType!
        : DEFAULT_TYPE;

    const config = TYPE_CONFIG[validType];

    const [frags, setFrags] = createSignal<CarbonFrag[]>([]);
    const [lastValue, setLastValue] = createSignal<number | null>(null);

    onMount(async () => {
        const storedFrags = getStoredFragsByCategory(validType);
        setFrags(storedFrags);
    });
    onMount(() => {
        const stored = localStorage.getItem(config.fragLoc);
        if (stored) {
            try {
                const parsed: CarbonFrag[] = JSON.parse(stored);
                // Optional: revive Date objects if needed
                const revived = parsed.map((f) => ({
                    ...f,
                    date: f.date instanceof Date ? f.date : new Date(f.date),
                }));
                setFrags(revived);

                const completeInfo = lisseCarbonFrag(revived);
                if (completeInfo.length > 0) {
                    const lastEmission =
                        completeInfo[completeInfo.length - 1].emission;
                    const normalized = normalizeCarbon(lastEmission);
                    setLastValue(normalized);
                }
            } catch (e) {
                console.error("Failed to load frags from localStorage", e);
                setFrags([]);
                setLastValue(null);
            }
        }
    });

    const startQuizzPath = `/Quizz?type=${validType}`;

    return (
        <div class={`alim-page ${TYPE_BG_CLASS[validType]}`}>
            <button class="back-button" onClick={() => navigate("/")}>
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
                <CarbonGraph frags={frags()} />
            </div>
        </div>
    );
}
