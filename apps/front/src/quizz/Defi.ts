import { FragCategory } from "./Types";

export type Defi = {
    id: string;
    defi: string;
    category: FragCategory;
    leafReward: number;
    percentReward: number; //This is a modifier applided to carbon range of the evaluation,  for example if you're bvetwen 40 and 56 and your percent is 0 you're at 40 and at 100 it's 56 (Cap at 100 start at 50)
    overQuestions?: quizzQuestion; //If the difi is like walk 1km question can exist and be like did you do more than 1 km
};

export type quizzAnswer = {
    id: string;
    text: string;
    leafReward: number;
    percentReward: number;
};

export type quizzQuestion = {
    id: string;
    text: string;
    responses: quizzAnswer[];
};

export type valuePercent = {
    category: FragCategory;
    idBlocAssociated: string;
};
