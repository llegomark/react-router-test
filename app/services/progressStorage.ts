// app/services/progressStorage.ts
import type { QuizAttempt, QuestionAttempt, UserProgress } from "../types/progress";
import { v4 as uuidv4 } from 'uuid';

// Import for invalidating queries
import { invalidateDashboardQueries } from "../lib/dashboard-queries";

const STORAGE_KEY = 'nqesh_quiz_progress';

// In-memory cache to handle SSR and prevent localStorage sync issues
let progressCache: UserProgress | null = null;

export function getInitialProgress(): UserProgress {
    return {
        quizAttempts: [],
        questionAttempts: []
    };
}

// Reset the cache to force reload from localStorage
export function resetProgressCache() {
    progressCache = null;
    console.log("Progress cache reset");
}

// Check if we're in a browser environment
function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

// Load progress data from localStorage
function loadFromStorage(): UserProgress {
    try {
        if (!isBrowser()) {
            return getInitialProgress();
        }

        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
            return getInitialProgress();
        }

        return JSON.parse(storedData) as UserProgress;
    } catch (error) {
        console.error('Error loading progress from localStorage:', error);
        return getInitialProgress();
    }
}

// Save progress data to localStorage
function saveToStorage(progress: UserProgress) {
    try {
        if (!isBrowser()) return;

        const serializedData = JSON.stringify(progress);
        localStorage.setItem(STORAGE_KEY, serializedData);
        console.log(`Saved to localStorage: ${progress.quizAttempts.length} attempts, ${progress.questionAttempts.length} questions`);

        // Invalidate queries to trigger dashboard refresh
        try {
            invalidateDashboardQueries();
        } catch (error) {
            // This is expected to fail during SSR or before TanStack Query is initialized
            console.log("Could not invalidate queries (likely SSR)");
        }
    } catch (error) {
        console.error('Error saving progress to localStorage:', error);
    }
}

export function getProgress(): UserProgress {
    // If we have a cached version, use it
    if (progressCache !== null) {
        return progressCache;
    }

    // Otherwise load from storage
    const progress = loadFromStorage();
    progressCache = progress;

    return progress;
}

export function saveProgress(progress: UserProgress): void {
    // Update our cache
    progressCache = { ...progress };

    // Save to localStorage
    saveToStorage(progress);
}

export function startQuizAttempt(categoryId: string, existingAttemptId?: string): QuizAttempt {
    // Get current progress
    const progress = getProgress();

    // Check if the existing ID is valid
    if (existingAttemptId) {
        const existingAttempt = progress.quizAttempts.find(a => a.id === existingAttemptId);
        if (existingAttempt) {
            console.log("Reusing existing quiz attempt:", existingAttemptId);
            return existingAttempt;
        }
    }

    // Create a new attempt
    const newAttempt: QuizAttempt = {
        id: uuidv4(),
        categoryId,
        date: new Date().toISOString(),
        score: 0,
        totalQuestions: 0,
        timeSpent: 0
    };

    // Add to our progress
    progress.quizAttempts.push(newAttempt);

    // Save changes
    saveProgress(progress);

    console.log("Created new quiz attempt:", newAttempt.id);
    return newAttempt;
}

export function recordQuestionAttempt(
    quizAttemptId: string,
    questionId: string,
    categoryId: string,
    selectedOption: number,
    correctOption: number,
    timeSpent: number
): void {
    // Get current progress
    const progress = getProgress();

    // Find the quiz attempt
    const quizAttempt = progress.quizAttempts.find(a => a.id === quizAttemptId);
    if (!quizAttempt) {
        console.error("Cannot record question for nonexistent attempt:", quizAttemptId);
        return;
    }

    // Create the question attempt
    const questionAttempt: QuestionAttempt = {
        id: uuidv4(),
        quizAttemptId,
        questionId,
        categoryId,
        selectedOption,
        correctOption,
        isCorrect: selectedOption === correctOption,
        timeSpent,
    };

    // Add to our progress
    progress.questionAttempts.push(questionAttempt);

    // Update the quiz attempt
    quizAttempt.totalQuestions++;
    if (selectedOption === correctOption) {
        quizAttempt.score++;
    }
    quizAttempt.timeSpent += timeSpent;

    // Save changes
    saveProgress(progress);

    console.log("Recorded question for attempt:", quizAttemptId,
        "- Correct:", questionAttempt.isCorrect,
        "- Total questions:", quizAttempt.totalQuestions);
}

export function finalizeQuizAttempt(quizAttemptId: string): void {
    if (!quizAttemptId) {
        console.warn("Cannot finalize quiz: No attempt ID provided");
        return;
    }

    // Get current progress
    const progress = getProgress();

    // Find the quiz attempt
    const attemptIndex = progress.quizAttempts.findIndex(a => a.id === quizAttemptId);

    // Get the questions for this attempt
    const questions = progress.questionAttempts.filter(q => q.quizAttemptId === quizAttemptId);

    // If the attempt doesn't exist but we have questions for it, recreate it
    if (attemptIndex === -1) {
        // We still have questions, so the attempt must have existed at some point
        if (questions.length > 0) {
            const firstQuestion = questions[0];
            console.log("Recreating missing quiz attempt:", quizAttemptId);

            // Create a new attempt based on the question data
            const newAttempt: QuizAttempt = {
                id: quizAttemptId,
                categoryId: firstQuestion.categoryId,
                date: new Date().toISOString(),
                score: questions.filter(q => q.isCorrect).length,
                totalQuestions: questions.length,
                timeSpent: questions.reduce((total, q) => total + q.timeSpent, 0)
            };

            // Add it to storage
            progress.quizAttempts.push(newAttempt);
            console.log("Recreated and finalized quiz attempt:", quizAttemptId);

            // Save changes
            saveProgress(progress);
        } else {
            // No questions and no attempt - nothing to do
            console.warn("Cannot finalize quiz: Attempt not found:", quizAttemptId);
        }
        return;
    }

    // Update the attempt
    const attempt = progress.quizAttempts[attemptIndex];

    // Update statistics
    attempt.totalQuestions = questions.length;
    attempt.score = questions.filter(q => q.isCorrect).length;
    attempt.timeSpent = questions.reduce((total, q) => total + q.timeSpent, 0);

    // If no questions were answered, remove the attempt
    if (questions.length === 0) {
        console.log("Removing empty quiz attempt:", quizAttemptId);
        progress.quizAttempts.splice(attemptIndex, 1);
    } else {
        // Otherwise update it
        progress.quizAttempts[attemptIndex] = attempt;
        console.log("Finalized quiz attempt:", quizAttemptId,
            "- Questions:", attempt.totalQuestions,
            "- Score:", attempt.score);
    }

    // Save changes
    saveProgress(progress);
}

// Debug helper to check localStorage directly
export function debugLocalStorage() {
    if (!isBrowser()) {
        console.log("Cannot debug localStorage: Not in browser environment");
        return;
    }

    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        console.log("Raw localStorage data:", rawData);

        if (rawData) {
            const parsed = JSON.parse(rawData) as UserProgress;
            console.log("Parsed data:", {
                quizAttempts: parsed.quizAttempts.length,
                questionAttempts: parsed.questionAttempts.length
            });
        } else {
            console.log("No data in localStorage");
        }
    } catch (error) {
        console.error("Error reading localStorage:", error);
    }
}