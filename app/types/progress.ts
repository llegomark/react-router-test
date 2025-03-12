// app/types/progress.ts
export interface QuizAttempt {
    id: string;
    categoryId: string;
    date: string;
    score: number;
    totalQuestions: number;
    timeSpent: number; // in seconds
}

export interface QuestionAttempt {
    id: string;
    quizAttemptId: string;
    questionId: string;
    categoryId: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    timeSpent: number; // in seconds
}

export interface UserProgress {
    quizAttempts: QuizAttempt[];
    questionAttempts: QuestionAttempt[];
}