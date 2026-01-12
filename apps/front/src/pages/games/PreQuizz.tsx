import { useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import type { CarbonFrag } from "../../quizz/Types";
import {
    getStoredFrags,
    lisseCarbonFrag,
    normalizeCarbon,
} from "../../quizz/Quizz";
import "./PreQuizz.css";
import CarbonGraph from "./CarbonGraph";

const info = { fragLoc: "carbonFragsAlim" };
export default function PreQuizz() {
    const navigate = useNavigate();
    const [frags, setFrags] = createSignal<CarbonFrag[]>([]);
    const [lastValue, setLastValue] = createSignal<number | null>(null);

    onMount(() => {
        const stored = localStorage.getItem(info.fragLoc);
        if (stored) {
            const parsed: CarbonFrag[] = JSON.parse(stored);
            setFrags(parsed);

            // Calculer la dernière valeur cumulée
            const completeInfo = lisseCarbonFrag(parsed);
            if (completeInfo.length > 0) {
                const lastEmission =
                    completeInfo[completeInfo.length - 1].emission;
                const normalized = normalizeCarbon(lastEmission);
                setLastValue(normalized);
                console.log(normalized);
            }
        }
    });

    return (
        <div class="alim-page">
            {/* Bouton retour */}
            <button class="back-button" onClick={() => navigate("/")}>
                ← Retour
            </button>

            {/* Titre */}
            <h1 class="alim-title">ALIMENTATION</h1>

            {/* Bouton quizz */}
            <button
                class="start-quizz-button"
                onClick={() => navigate("/Quizz")}
            >
                Faire le quizz
            </button>

            {/* Graphique */}
            <div class="graph-container">
                <h2>
                    Évolution de l’impact carbone :{" "}
                    {lastValue !== null ? `${lastValue()} kg/semaine` : "-"}
                </h2>
                <CarbonGraph frags={frags()} />
            </div>
        </div>
    );
}
