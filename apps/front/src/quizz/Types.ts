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
