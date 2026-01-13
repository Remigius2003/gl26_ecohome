import type {
    Question,
    CarbonFrag,
    CarbonRange,
    CompleteInfo,
    FragCategory,
    QuizzType,
    QuizzBloc,
} from "./Types";

import { loadQuestionsByCategory } from "./Data/loadQuestions";

// ---------------- STORAGE KEYS ----------------

const BLOC_STORAGE_KEYS: Record<FragCategory, string> = {
    alimentation: "carbonBlocs_alimentation",
    transport: "carbonBlocs_transport",
    logement: "carbonBlocs_logement",
    consommation: "carbonBlocs_consommation",
};

// ---------------- QUESTIONS CACHE ----------------

const cachedQuestions: Partial<Record<QuizzType, Record<string, Question>>> =
    {};

export async function getQuestionsByType(
    type: QuizzType
): Promise<Record<string, Question>> {
    if (!cachedQuestions[type]) {
        cachedQuestions[type] = await loadQuestionsByCategory(type);
    }
    return cachedQuestions[type]!;
}

export async function getQuestionByType(
    questionId: string,
    type: QuizzType
): Promise<Question> {
    const allQuestions = await getQuestionsByType(type);
    const question = allQuestions[questionId];
    if (!question) {
        throw new Error(
            `Question ${questionId} not found in category "${type}"`
        );
    }
    return question;
}

// ---------------- CURRENT BLOC (IN-MEMORY) ----------------

let currentBloc: QuizzBloc | null = null;

export function startNewBloc(type: FragCategory): void {
    currentBloc = {
        id: `bloc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        info: [],
        date: new Date(),
    };
}

export function getCurrentBloc(): QuizzBloc | null {
    return currentBloc;
}

export function closeAndSaveCurrentBloc(category: FragCategory): void {
    if (!currentBloc) return;
    saveBloc(currentBloc, category);
    currentBloc = null; // reset
}

function saveBloc(bloc: QuizzBloc, category: FragCategory): void {
    const key = BLOC_STORAGE_KEYS[category];
    const stored = localStorage.getItem(key);
    const blocs: QuizzBloc[] = stored ? JSON.parse(stored) : [];
    blocs.push(bloc);
    localStorage.setItem(key, JSON.stringify(blocs));
}

// ---------------- EMISSION CALCULATION ----------------

export function normalizeCarbon(value?: CarbonRange): number | null {
    if (value == null) return null;
    if (typeof value === "number") return value;
    return (value[0] + value[1]) / 2;
}

function addCarbonRange(a: CarbonRange, b: CarbonRange): CarbonRange {
    if (typeof a === "number" && typeof b === "number") {
        return a + b;
    }

    const [aMin, aMax] = typeof a === "number" ? [a, a] : a;
    const [bMin, bMax] = typeof b === "number" ? [b, b] : b;

    return [aMin + bMin, aMax + bMax];
}

function calcImpact(
    frag: CarbonFrag,
    allFrags: CarbonFrag[]
): CarbonRange | null {
    if (!frag.answer.children || frag.answer.children.length === 0) {
        return frag.answer.carbonImpact || null;
    }

    let total: CarbonRange | null = null;

    for (const childId of frag.answer.children) {
        const childFrag = allFrags.find((f) => f.question.id === childId);
        if (!childFrag) continue;

        const childImpact = calcImpact(childFrag, allFrags);
        if (!childImpact) continue;

        total =
            total === null ? childImpact : addCarbonRange(total, childImpact);
    }

    if (frag.answer.carbonImpact) {
        total =
            total === null
                ? frag.answer.carbonImpact
                : addCarbonRange(total, frag.answer.carbonImpact);
    }

    return total;
}

// Calculate emission for a single completed bloc
export function calculateBlocEmission(bloc: QuizzBloc): CompleteInfo | null {
    const frags = bloc.info;
    if (frags.length === 0) return null;

    const root = frags[0];
    const emission = calcImpact(root, frags);
    if (!emission) return null;

    return {
        emission,
        date: bloc.date,
    };
}

// Load and compute emissions for all saved blocs in a category
export function getAllBlocEmissions(category: FragCategory): CompleteInfo[] {
    const key = BLOC_STORAGE_KEYS[category];
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    try {
        const blocs: QuizzBloc[] = JSON.parse(stored).map((b: any) => ({
            ...b,
            date: new Date(b.date),
            info: b.info.map((frag: any) => ({
                ...frag,
                date: new Date(frag.date),
                question: {
                    ...frag.question,
                    category,
                },
            })),
        }));

        return blocs
            .map(calculateBlocEmission)
            .filter((info): info is CompleteInfo => info !== null);
    } catch (e) {
        console.error(`Failed to parse or compute blocs for ${category}`, e);
        return [];
    }
}

// ---------------- MAIN QUIZ HANDLER ----------------

export async function handleAnswer(
    currentQuestionId: string,
    selectedAnswerNumber: number,
    type: QuizzType
): Promise<string | undefined> {
    const allQuestions = await getQuestionsByType(type);
    const currentQuestion = allQuestions[currentQuestionId];

    if (!currentQuestion) {
        throw new Error(`Question ${currentQuestionId} not found in ${type}`);
    }

    const selectedAnswer = currentQuestion.responses[selectedAnswerNumber - 1];
    if (!selectedAnswer) {
        throw new Error(`Answer ${selectedAnswerNumber} not found`);
    }

    const frag: CarbonFrag = {
        question: currentQuestion,
        answer: selectedAnswer,
        date: new Date(),
    };

    const bloc = getCurrentBloc();
    if (!bloc) {
        throw new Error(
            "No active quiz bloc. Call startNewBloc() before answering."
        );
    }

    bloc.info.push(frag);

    return selectedAnswer.children?.[0];
}

export function clearAllBlocs(category?: FragCategory): void {
    if (category) {
        localStorage.removeItem(BLOC_STORAGE_KEYS[category]);
    } else {
        Object.values(BLOC_STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
    }
}
