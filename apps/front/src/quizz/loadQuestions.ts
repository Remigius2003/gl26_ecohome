import { Evolution, IdA, IdQ, type Question, type FragCategory } from "./Types";

const CATEGORY_TO_FILE: Record<FragCategory, string> = {
    alimentation: "/quizz/alimentation.json",
    transport: "/quizz/transport.json",
    logement: "/quizz/logement.json",
    consommation: "/quizz/consommation.json",
};

let cache: Partial<Record<FragCategory, Promise<Record<string, Question>>>> =
    {};

/**
 * Load questions for a given category.
 * Results are cached per category to avoid repeated fetches.
 */
export async function loadQuestionsByCategory(
    category: FragCategory
): Promise<Record<string, Question>> {
    if (cache[category]) return cache[category]!;

    const url = CATEGORY_TO_FILE[category];
    const promise = (async () => {
        const rawQuestions = await fetchRawQuestions(url);
        const parentMap = buildParentMap(rawQuestions);
        const questions = transformRawQuestions(
            rawQuestions,
            parentMap,
            category
        );
        return questions;
    })();

    cache[category] = promise;
    return promise;
}

/* ------------------- HELPERS ------------------- */

/** Fetch the raw JSON from a URL and return as object */
async function fetchRawQuestions(url: string): Promise<Record<string, any>> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch questions from ${url}`);
    return res.json();
}

/** Build a map of child question IDs → parent answer IDs */
function buildParentMap(rawQuestions: Record<string, any>): Record<IdQ, IdA> {
    const map: Record<IdQ, IdA> = {};
    for (const q of Object.values(rawQuestions)) {
        for (const ans of q.responses || []) {
            if (Array.isArray(ans.children)) {
                for (const childId of ans.children) {
                    map[childId] = ans.id;
                }
            }
        }
    }
    return map;
}

/** Transform raw questions into our typed Question objects */
function transformRawQuestions(
    rawQuestions: Record<string, any>,
    parentMap: Record<IdQ, IdA>,
    category: FragCategory
): Record<string, Question> {
    const questions: Record<string, Question> = {};
    for (const [id, q] of Object.entries(rawQuestions)) {
        questions[id] = {
            id,
            category,
            evolution: parseEvolution(q.evolution),
            text: q.text,
            responses: Array.isArray(q.responses)
                ? q.responses.map((r: any) => ({ ...r }))
                : [],
            parent: parentMap[id],
        };
    }
    return questions;
}

function parseEvolution(evo: unknown): Evolution {
    if (typeof evo !== "string") {
        throw new Error(`Invalid evolution value (not a string): ${evo}`);
    }
    switch (evo) {
        case "Daily":
            return Evolution.Daily;
        case "Monthly":
            return Evolution.Monthly;
        case "Yearly":
            return Evolution.Yearly;
        case "Unknown":
            return Evolution.Unknown;
        case "Never":
            return Evolution.Never;
        default:
            throw new Error(`Unknown evolution value: ${evo}`);
    }
}
