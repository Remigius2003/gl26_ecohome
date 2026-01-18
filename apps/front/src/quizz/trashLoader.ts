import { FragCategory, Defi, defiQuestion, defiAnswer } from "./Types";

//Todo: move and redo this stuff in the back using loadQuestionExemple
// Helper to avoid repetition and ensure type safety
const makeQuestion = (
    id: string,
    text: string,
    responses: defiAnswer[]
): defiQuestion => ({
    id,
    text,
    responses,
});

const makeAnswer = (
    id: string,
    text: string,
    leafReward: number,
    percentReward: number
): defiAnswer => ({
    id,
    text,
    leafReward,
    percentReward,
});

export const dailyChallenges: Defi[] = [
    {
        id: "alim_1",
        defi: "Manger végétalien aujourd’hui",
        category: "alimentation",
        leafReward: 15,
        percentReward: 8,
        overQuestions: makeQuestion(
            "q_alim_1",
            "Avez-vous mangé 100 % végétalien aujourd’hui ?",
            [makeAnswer("yes", "Oui", 15, 8), makeAnswer("no", "Non", 0, 0)]
        ),
    },
    {
        id: "alim_2",
        defi: "Éviter le plastique à usage unique au repas",
        category: "alimentation",
        leafReward: 6,
        percentReward: 3,
    },
    {
        id: "alim_3",
        defi: "Cuisiner avec des restes pour éviter le gaspillage",
        category: "alimentation",
        leafReward: 8,
        percentReward: 5,
    },
    {
        id: "trans_1",
        defi: "Remplacer un trajet en voiture par la marche, le vélo ou les transports en commun",
        category: "transport",
        leafReward: 10,
        percentReward: 7,
        overQuestions: makeQuestion(
            "q_trans_1",
            "Avez-vous évité au moins un trajet en voiture solo ?",
            [makeAnswer("yes", "Oui", 10, 7), makeAnswer("no", "Non", 0, 0)]
        ),
    },
    {
        id: "trans_2",
        defi: "Pratiquer le covoiturage ou partager un trajet",
        category: "transport",
        leafReward: 9,
        percentReward: 6,
    },
    {
        id: "trans_3",
        defi: "Travailler à distance (éviter un déplacement domicile-travail)",
        category: "transport",
        leafReward: 12,
        percentReward: 8,
        overQuestions: makeQuestion(
            "q_trans_3",
            "Avez-vous évité un trajet domicile-travail aujourd’hui ?",
            [makeAnswer("yes", "Oui", 12, 8), makeAnswer("no", "Non", 0, 0)]
        ),
    },
    {
        id: "log_1",
        defi: "Éteindre les lumières et débrancher les appareils inutilisés",
        category: "logement",
        leafReward: 5,
        percentReward: 4,
    },
    {
        id: "log_2",
        defi: "Prendre une douche de moins de 5 minutes",
        category: "logement",
        leafReward: 7,
        percentReward: 5,
        overQuestions: makeQuestion(
            "q_log_2",
            "Votre douche a-t-elle duré moins de 5 minutes ?",
            [makeAnswer("yes", "Oui", 7, 5), makeAnswer("no", "Non", 1, 1)]
        ),
    },
    {
        id: "log_3",
        defi: "Baisser le chauffage de 1°C (ou monter la clim de 1°C)",
        category: "logement",
        leafReward: 6,
        percentReward: 4,
    },
    {
        id: "cons_1",
        defi: "N’acheter aucun produit neuf aujourd’hui",
        category: "consommation",
        leafReward: 12,
        percentReward: 9,
        overQuestions: makeQuestion(
            "q_cons_1",
            "Avez-vous acheté un produit neuf ?",
            [makeAnswer("no", "Non", 12, 9), makeAnswer("yes", "Oui", 0, 0)]
        ),
    },
    {
        id: "cons_2",
        defi: "Réparer, réutiliser ou donner un objet au lieu de le jeter",
        category: "consommation",
        leafReward: 10,
        percentReward: 7,
    },
    {
        id: "cons_3",
        defi: "Utiliser un sac réutilisable ou une gourde aujourd’hui",
        category: "consommation",
        leafReward: 5,
        percentReward: 3,
    },
];
