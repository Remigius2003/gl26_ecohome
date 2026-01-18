export type CarbonRange = [number, number] | number;
export type QuizzType =
    | "alimentation"
    | "transport"
    | "logement"
    | "consommation";
export type FragCategory =
    | "alimentation"
    | "transport"
    | "logement"
    | "consommation";
export type IdA = string;
export type IdQ = string;

export type Modifier = {
    type: "sum" | "mult";
    value: number;
};

export enum Evolution {
    Daily = "Daily",
    Monthly = "Monthly",
    Yearly = "Yearly",
    Unknown = "Unknown",
    Never = "Never",
}

export type Answer = {
    id: IdA;
    text: string;
    children?: IdQ[];
    modif?: Modifier;
    carbonImpact?: CarbonRange;
};

export interface Question {
    id: string;
    text: string;
    evolution: Evolution;
    category: FragCategory;
    parent?: string;
    responses: Answer[];
}

export type Theme = {
    name: string;
    info: string;
    baseQuestions: Answer[];
};

export type CarbonFrag = {
    question: Question;
    answer: Answer;
    date: Date;
};

export type CompleteInfo = {
    emission: CarbonRange;
    date: Date;
};

export type QuizzBloc = {
    id: string;
    info: CarbonFrag[];
    date: Date;
};

//DEFI

export type Defi = {
    id: string;
    defi: string;
    category: FragCategory;
    leafReward: number;
    percentReward: number; //This is a modifier applided to carbon range of the evaluation
    overQuestions?: defiQuestion; //If the difi is like walk 1km question can exist and be like How much did you do: I did not do it, I did around 1km, I did more than 1 km
};

export type defiAnswer = {
    id: string;
    text: string;
    leafReward: number;
    percentReward: number;
};

export type defiQuestion = {
    id: string;
    text: string;
    responses: defiAnswer[];
};

//When a defi is validate it alter this value that alter global evaluation like CarbonRangeMin + (carbonRangeMax - CarbonRangeMin)*percent modifier
export type valuePercent = {
    category: FragCategory;
    date: Date;
    percentModifier: number;
};
