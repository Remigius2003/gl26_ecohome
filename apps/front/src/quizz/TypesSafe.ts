import { z } from "zod";

// CarbonRange : nombre ou [min, max]
const CarbonRangeSchema = z.union([
    z.number(),
    z.tuple([z.number(), z.number()]),
]);

// Modifier (même si absent dans ton JSON actuel, garde-le au cas où)
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

// Evolution : attention, ton JSON utilise des chaînes ("Never"), pas des nombres
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
