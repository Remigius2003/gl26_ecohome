
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

// Un array desmv 
let basesQuestion = questions["Q1"];
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
