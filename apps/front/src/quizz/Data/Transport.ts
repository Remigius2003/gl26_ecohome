import { QuestionsMapSchema } from "../TypesSafe";
import { Evolution, IdA, IdQ, type Question } from "../Types";

export async function loadQuestionsTrans(): Promise<Record<string, Question>> {
    const res = await fetch("/transport.json");
    if (!res.ok) throw new Error("Failed to load questions");
    const json = await res.json();

    const rawQuestions: Record<string, any> = json;

    // Build parent map
    const parentMap: Record<IdQ, IdA> = {};
    for (const q of Object.values(rawQuestions)) {
        for (const ans of q.responses) {
            if (ans.children) {
                for (const childId of ans.children) {
                    parentMap[childId] = ans.id;
                }
            }
        }
    }

    // Build final questions
    const questions: Record<string, Question> = {};
    for (const [id, q] of Object.entries(rawQuestions)) {
        questions[id] = {
            id,
            evolution: parseEvolution(q.evolution),
            text: q.text,
            responses: q.responses.map((r: any) => ({ ...r })),
            parent: parentMap[id],
        };
    }

    return questions;
}
function parseEvolution(evo: string): Evolution {
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
            throw new Error(`Invalid evolution value: ${evo}`);
    }
}
