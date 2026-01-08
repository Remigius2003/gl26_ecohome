// types.ts
type AnswerOption = {
  id: string;
  text: string;
  next?: string; // id de la prochaine question
};

type Question = {
  id: string;
  text: string;
  options: AnswerOption[];
};

// arbre de questions alimentation
const questions: Record<string, Question> = {
  Q1: {
    id: "Q1",
    text: "Quel type d’alimentation correspond le mieux à la vôtre ?",
    options: [
      { id: "A", text: "Végétalienne", next: "Q2A" },
      { id: "B", text: "Végétarienne", next: "Q2B" },
      { id: "C", text: "Peu de viande", next: "Q2C" },
      { id: "D", text: "Viande régulière", next: "Q2D" },
      { id: "E", text: "Viande à presque tous les repas", next: "Q2E" },
    ],
  },
  // Branche A - Végétalienne
  Q2A: {
    id: "Q2A",
    text: "Consommez-vous régulièrement des produits transformés ?",
    options: [
      { id: "A1", text: "Peu / jamais", next: "Q3A" },
      { id: "A2", text: "Occasionnellement", next: "Q3A" },
      { id: "A3", text: "Souvent", next: "Q3A" },
    ],
  },
  Q3A: {
    id: "Q3A",
    text: "La majorité de vos aliments sont-ils :",
    options: [
      { id: "A1", text: "Faits maison" },
      { id: "A2", text: "Mixtes" },
      { id: "A3", text: "Majoritairement industriels" },
    ],
  },
  // Branche B - Végétarienne
  Q2B: {
    id: "Q2B",
    text: "Consommez-vous des produits laitiers ?",
    options: [
      { id: "B1", text: "Non", next: "Q3B" },
      { id: "B2", text: "Oui, occasionnellement", next: "Q3B" },
      { id: "B3", text: "Oui, régulièrement", next: "Q3B" },
    ],
  },
  Q3B: {
    id: "Q3B",
    text: "Consommez-vous des œufs ?",
    options: [
      { id: "B1", text: "Non", next: "Q4B" },
      { id: "B2", text: "1–3 fois par semaine", next: "Q4B" },
      { id: "B3", text: "Plus de 3 fois par semaine", next: "Q4B" },
    ],
  },
  Q4B: {
    id: "Q4B",
    text: "La majorité de vos repas sont-ils faits maison ?",
    options: [
      { id: "B1", text: "Oui" },
      { id: "B2", text: "Environ la moitié" },
      { id: "B3", text: "Majoritairement achetés" },
    ],
  },
  // Branche C - Peu de viande
  Q2C: {
    id: "Q2C",
    text: "Combien de repas avec viande par semaine ?",
    options: [
      { id: "C1", text: "1–2", next: "Q3C" },
      { id: "C2", text: "3–4", next: "Q3C" },
    ],
  },
  Q3C: {
    id: "Q3C",
    text: "Quel type de viande consommez-vous le plus ?",
    options: [
      { id: "C1", text: "Volaille", next: "Q4C" },
      { id: "C2", text: "Porc", next: "Q4C" },
      { id: "C3", text: "Bœuf", next: "Q4C" },
      { id: "C4", text: "Mélange", next: "Q4C" },
    ],
  },
  Q4C: {
    id: "Q4C",
    text: "Consommez-vous du poisson ?",
    options: [
      { id: "C1", text: "Non", next: "Q5C" },
      { id: "C2", text: "1 fois/semaine", next: "Q5C" },
      { id: "C3", text: "2–3 fois/semaine", next: "Q5C" },
      { id: "C4", text: "> 3 fois/semaine", next: "Q5C" },
    ],
  },
  Q5C: {
    id: "Q5C",
    text: "Vos produits sont majoritairement :",
    options: [
      { id: "C1", text: "Locaux / de saison" },
      { id: "C2", text: "Mixtes" },
      { id: "C3", text: "Importés" },
    ],
  },
  // Tu peux ajouter les branches D et E de la même manière...
};

// fonction pour obtenir la prochaine question
function getNextQuestion(currentAnswerId: string): Question | null {
  // chercher la question dont une option a cet id
  for (const key in questions) {
    const q = questions[key];
    for (const option of q.options) {
      if (option.id === currentAnswerId) {
        if (option.next && questions[option.next]) {
          return questions[option.next];
        } else {
          return null; // fin de l'arbre
        }
      }
    }
  }
  return null; // id non trouvé
}

// exemple d'utilisation
let currentQuestion = questions["Q1"];
console.log("Question:", currentQuestion.text);
console.log("Options:", currentQuestion.options.map(o => o.text));

// simuler une réponse
const answer = "C1"; // utilisateur choisit "1-2 repas / semaine" pour Q2C
const nextQ = getNextQuestion(answer);
if (nextQ) {
  console.log("Prochaine question:", nextQ.text);
} else {
  console.log("Fin du questionnaire");
}
