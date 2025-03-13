// app/types/quiz.ts
export interface QuizCategory {
    id: string;
    name: string;
    description: string;
}

export interface QuizQuestion {
    id: string;
    categoryId: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    shuffledOptions?: string[];
    shuffledCorrectOptionIndex?: number;
}