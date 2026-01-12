import { loadQuestionsAlim } from "./Data/Alimentation";
import type { Question, CarbonFrag, CarbonRange, CompleteInfo } from "./Types";

let questions: Record<string, Question> | null = null;

const FRAG_STORAGE_KEY = "carbonFrags";

/* ---------------- QUESTIONS ---------------- */

async function getQuestions() {
    if (!questions) {
        questions = await loadQuestionsAlim();
    }
    return questions;
}

function getNextQuestionId(
    answerId: string,
    allQuestions: Record<string, Question>
): string | undefined {
    for (const question of Object.values(allQuestions)) {
        for (const response of question.responses) {
            if (response.id === answerId) {
                return response.children?.[0];
            }
        }
    }
    return undefined;
}

export async function getQuestion(questionId: string): Promise<Question> {
    const allQuestions = await getQuestions();

    const question = allQuestions[questionId];
    if (!question) {
        throw new Error(`Question ${questionId} not found`);
    }

    return question;
}

/* ---------------- FRAG STORAGE ---------------- */

function saveFrag(frag: CarbonFrag) {
    const stored = localStorage.getItem(FRAG_STORAGE_KEY);
    const frags: CarbonFrag[] = stored ? JSON.parse(stored) : [];

    frags.push(frag);

    localStorage.setItem(FRAG_STORAGE_KEY, JSON.stringify(frags));
}

export function getStoredFrags(): CarbonFrag[] {
    const stored = localStorage.getItem(FRAG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function clearStoredFrags() {
    localStorage.removeItem(FRAG_STORAGE_KEY);
}

/* ---------------- MAIN HANDLER ---------------- */

export async function handleAnswer(
    currentQuestionId: string,
    selectedAnswerNumber: number
): Promise<string | undefined> {
    const allQuestions = await getQuestions();
    const currentQuestion = allQuestions[currentQuestionId];

    if (!currentQuestion) {
        throw new Error(`Question ${currentQuestionId} not found`);
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

    saveFrag(frag);

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
