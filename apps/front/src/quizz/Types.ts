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