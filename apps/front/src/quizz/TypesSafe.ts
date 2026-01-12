//Ce fichier n'est pas vraiment utilisé au final

import { z } from "zod";

// CarbonRange : nombre ou [min, max]
const CarbonRangeSchema = z.union([
    z.number(),
    z.tuple([z.number(), z.number()]),
]);

// Modifier
const ModifierSchema = z.object({
    type: z.enum(["sum", "mult"]),
    value: z.number(),
});

// Answer
const AnswerSchema = z.object({
    id: z.string(),
    text: z.string(),
    children: z.array(z.string()).optional(),
    modif: ModifierSchema.optional(),
    carbonImpact: CarbonRangeSchema.optional(),
});

const EvolutionSchema = z.enum([
    "Daily",
    "Monthly",
    "Yearly",
    "Unknown",
    "Never",
]);

// Question
const QuestionSchema = z.object({
    id: z.string(),
    evolution: EvolutionSchema,
    parents: z.array(z.string()).optional(), // peut être absent
    text: z.string(),
    responses: z.array(AnswerSchema),
});

// L'objet global : Record<string, Question>
export const QuestionsMapSchema = z.record(z.string(), QuestionSchema);
