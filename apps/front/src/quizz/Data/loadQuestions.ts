import {
    Evolution,
    IdA,
    IdQ,
    type Question,
    type FragCategory,
} from "../Types";

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
    if (cache[category]) {
        return cache[category]!;
    }

    const url = CATEGORY_TO_FILE[category];
    const promise = (async () => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to load ${category} questions from ${url}`);
        }
        const rawQuestions: Record<string, any> = await res.json();

        // Build parent map: childId : answerId
        const parentMap: Record<IdQ, IdA> = {};
        for (const q of Object.values(rawQuestions)) {
            for (const ans of q.responses) {
                if (Array.isArray(ans.children)) {
                    for (const childId of ans.children) {
                        parentMap[childId] = ans.id;
                    }
                }
            }
        }

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
    })();

    cache[category] = promise;
    return promise;
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
