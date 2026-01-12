export type CarbonRange = [number, number] | number;

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

export type Question = {
    id: IdQ;
    evolution: Evolution;
    parent?: IdA;
    text: string;
    responses: Answer[];
};

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
