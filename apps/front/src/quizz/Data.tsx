// src/main.ts (ou dans un composant, ou un script de test)
import { loadQuestionsAlim } from "./Data/Alimentation";
import type { Question, CarbonFrag } from "./Types";

// Fonction pour trouver la prochaine question à partir d’un ID de réponse
function getNextQuestion(
    answerId: string,
    allQuestions: Record<string, Question>
): Question | null {
    for (const question of Object.values(allQuestions)) {
        for (const response of question.responses) {
            if (response.id === answerId) {
                // On prend la première question enfant (logique arborescente simple)
                const nextId = response.children?.[0];
                return nextId ? (allQuestions[nextId] ?? null) : null;
            }
        }
    }
    return null; // réponse non trouvée
}

// Fonction principale async
export async function runQuestionnaire() {
    // Charger toutes les questions
    const questions = await loadQuestionsAlim();

    // Commencer par Q1
    let currentQuestion = questions["Q1"];
    if (!currentQuestion) {
        throw new Error("Question initiale Q1 introuvable");
    }

    console.log(" Question:", currentQuestion.text);
    console.log(
        " Options:",
        currentQuestion.responses.map((r) => `${r.id}: ${r.text}`)
    );

    // Simuler une réponse (ex: "C" = "Peu de viande")
    const selectedAnswerId = "C";
    const selectedAnswer = currentQuestion.responses.find(
        (r) => r.id === selectedAnswerId
    );

    if (!selectedAnswer) {
        throw new Error(`Réponse ${selectedAnswerId} non trouvée`);
    }

    // Créer un CarbonFrag
    const frag: CarbonFrag = {
        question: currentQuestion,
        answer: selectedAnswer,
        date: new Date(),
    };

    console.log("Fragment sélectionné:", {
        question: frag.question.text,
        answer: frag.answer.text,
        carbonImpact: frag.answer.carbonImpact,
    });

    // Obtenir la prochaine question
    const nextQuestion = getNextQuestion(selectedAnswerId, questions);

    if (nextQuestion) {
        console.log("Prochaine question:", nextQuestion.text);
    } else {
        console.log("Fin du questionnaire.");
    }
}

runQuestionnaire().catch(console.error);
