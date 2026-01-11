import { QuestionsMapSchema } from "../TypesSafe";
import { Evolution, type Question } from "../Types";

export async function loadQuestionsAlim(): Promise<Record<string, Question>> {
    const res = await fetch("/alimentation.json");
    if (!res.ok) throw new Error("Failed to load questions");
    const json = await res.json();

    //it work, don't ask for type, pure js is fiiiine
    const questionsAlim: Record<string, Question> = {};
    for (const [key, q] of Object.entries(json)) {
        questionsAlim[key] = {
            ...q,
            evolution: parseEvolution(q.evolution),
            responses: q.responses.map((r) => ({ ...r })),
        };
    }

    return questionsAlim;
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
