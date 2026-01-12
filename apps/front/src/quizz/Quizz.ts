import type {
    Question,
    CarbonFrag,
    CarbonRange,
    CompleteInfo,
    FragCategory,
    QuizzType,
} from "./Types";

let questions: Record<string, Question> | null = null;

const FRAG_STORAGE_KEYS: Record<FragCategory, string> = {
    alimentation: "carbonFrags_alimentation",
    transport: "carbonFrags_transport",
    logement: "carbonFrags_logement",
    consommation: "carbonFrags_consommation",
};

/* ---------------- QUESTIONS ---------------- */

import { loadQuestionsByCategory } from "./Data/loadQuestions";

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

export function getStoredFragsByCategory(category: FragCategory): CarbonFrag[] {
    const key = FRAG_STORAGE_KEYS[category];
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    try {
        const frags = JSON.parse(stored);
        return frags.map((frag: any) => ({
            ...frag,
            date: new Date(frag.date), //todo have good date
        }));
    } catch (e) {
        console.error(`Failed to parse frags for ${category}`, e);
        return [];
    }
}

/* ---------------- FRAG STORAGE ---------------- */

function saveFrag(frag: CarbonFrag, category: FragCategory) {
    const key = FRAG_STORAGE_KEYS[category];
    const stored = localStorage.getItem(key);
    const frags: CarbonFrag[] = stored ? JSON.parse(stored) : [];
    frags.push(frag);
    localStorage.setItem(key, JSON.stringify(frags));
}

export function getAllStoredFrags(): Record<FragCategory, CarbonFrag[]> {
    return Object.fromEntries(
        Object.entries(FRAG_STORAGE_KEYS).map(([cat, key]) => [
            cat,
            getStoredFragsByCategory(cat as FragCategory),
        ])
    ) as Record<FragCategory, CarbonFrag[]>;
}

export function clearStoredFrags(category?: FragCategory) {
    if (category) {
        localStorage.removeItem(FRAG_STORAGE_KEYS[category]);
    } else {
        // Clear all
        Object.values(FRAG_STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
    }
}

/* ---------------- MAIN HANDLER ---------------- */

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

    saveFrag(frag, type);

    return selectedAnswer.children?.[0];
}

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

export function lisseCarbonFrag(frags: CarbonFrag[]): CompleteInfo[] {
    const result: CompleteInfo[] = [];

    // On prend seulement les frags sans parent (racines)
    const roots = frags.filter(
        (f) => !f.question.parent || f.question.parent.length === 0
    );

    for (const root of roots) {
        const emission = calcImpact(root, frags);
        if (!emission) continue;

        result.push({
            emission,
            date: root.date, // date de la racine
        });
    }

    return result;
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
