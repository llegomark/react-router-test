// app/services/progressStorage.ts - Updated version without React hooks
import type { QuizAttempt, QuestionAttempt, UserProgress } from "../types/progress";
import { v4 as uuidv4 } from 'uuid';

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

        // We no longer call invalidateDashboardQueries here - that should be done in React components
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

// Export progress data as a JSON file - with enhanced debugging
export function exportProgress(): void {
    try {
        if (!isBrowser()) {
            console.error('Cannot export progress: Not in browser environment');
            return;
        }

        // Get the current progress data
        const progressData = getProgress();
        console.log('Export - Data retrieved from storage:', {
            quizAttempts: progressData.quizAttempts.length,
            questionAttempts: progressData.questionAttempts.length
        });

        // Make a clean copy of the data to avoid any potential circular references
        const cleanData: UserProgress = {
            quizAttempts: progressData.quizAttempts.map(attempt => ({
                id: attempt.id,
                categoryId: attempt.categoryId,
                date: attempt.date,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                timeSpent: attempt.timeSpent || 0 // Ensure timeSpent exists
            })),
            questionAttempts: progressData.questionAttempts.map(question => ({
                id: question.id,
                quizAttemptId: question.quizAttemptId,
                questionId: question.questionId,
                categoryId: question.categoryId,
                selectedOption: question.selectedOption,
                correctOption: question.correctOption,
                isCorrect: question.isCorrect,
                timeSpent: question.timeSpent || 0 // Ensure timeSpent exists
            }))
        };

        // Verify the data before export
        const validationResult = validateProgressData(cleanData);
        if (!validationResult.isValid) {
            console.error(`Export validation failed: ${validationResult.error}`);
            throw new Error(`Export validation failed: ${validationResult.error}`);
        }

        // Convert to a JSON string with formatting for readability
        const jsonData = JSON.stringify(cleanData, null, 2);
        console.log('Export - JSON prepared, length:', jsonData.length);

        // Create a Blob with the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Create a download URL
        const url = URL.createObjectURL(blob);
        console.log('Export - Blob URL created');

        // Create a temporary link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `nqesh-progress-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);

        // Trigger download
        a.click();
        console.log('Export - Download triggered');

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Export - Cleanup completed');
        }, 100);
    } catch (error) {
        console.error('Error exporting progress data:', error);
    }
}

// Import progress data from a JSON file - with enhanced debugging
export async function importProgress(file: File): Promise<boolean> {
    try {
        if (!isBrowser()) {
            console.error('Cannot import progress: Not in browser environment');
            return false;
        }

        // Read the file content as text
        const fileContent = await file.text();
        console.log('Import - File content length:', fileContent.length);

        // Basic check for valid JSON format
        if (!fileContent.trim().startsWith('{')) {
            console.error('Import error: File does not contain valid JSON (should start with {)');
            return false;
        }

        try {
            // Parse the JSON
            const importedData = JSON.parse(fileContent);
            console.log('Import - Successfully parsed JSON:', importedData);

            // First do a simple structure check
            if (!importedData || typeof importedData !== 'object') {
                console.error('Import error: Parsed data is not an object');
                return false;
            }

            // Check for basic required properties
            if (!('quizAttempts' in importedData) || !('questionAttempts' in importedData)) {
                console.error('Import error: Missing required quiz or question attempts arrays');
                return false;
            }

            // Validate the data structure with detailed logging
            const validationResult = validateProgressData(importedData);
            if (!validationResult.isValid) {
                console.error(`Import validation failed: ${validationResult.error}`);
                return false;
            }

            // Save the imported data (replacing existing data)
            saveProgress(importedData);

            // Reset the cache to force a reload on next access
            resetProgressCache();

            console.log('Import successful - Data saved');
            return true;
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return false;
        }
    } catch (error) {
        console.error('Error importing progress data:', error);
        return false;
    }
}

// Enhanced validation with detailed error reporting
function validateProgressData(data: any): { isValid: boolean; error?: string } {
    try {
        // Basic structure validation
        if (!data) {
            return { isValid: false, error: 'Data is null or undefined' };
        }

        if (typeof data !== 'object') {
            return { isValid: false, error: `Data is not an object: ${typeof data}` };
        }

        // Arrays must exist but can be empty
        if (!Array.isArray(data.quizAttempts)) {
            return { isValid: false, error: 'quizAttempts is not an array' };
        }

        if (!Array.isArray(data.questionAttempts)) {
            return { isValid: false, error: 'questionAttempts is not an array' };
        }

        // If both arrays are empty, it's still valid data (just no progress yet)
        if (data.quizAttempts.length === 0 && data.questionAttempts.length === 0) {
            return { isValid: true };
        }

        // Validate non-empty quiz attempts
        if (data.quizAttempts.length > 0) {
            for (let i = 0; i < data.quizAttempts.length; i++) {
                const attempt = data.quizAttempts[i];

                // Check required string fields
                if (!attempt.id || typeof attempt.id !== 'string') {
                    return { isValid: false, error: `Quiz attempt at index ${i} missing 'id' field` };
                }

                if (!attempt.categoryId || typeof attempt.categoryId !== 'string') {
                    return { isValid: false, error: `Quiz attempt at index ${i} missing 'categoryId' field` };
                }

                if (!attempt.date || typeof attempt.date !== 'string') {
                    return { isValid: false, error: `Quiz attempt at index ${i} missing 'date' field` };
                }

                // Check required numeric fields
                if (typeof attempt.score !== 'number') {
                    return { isValid: false, error: `Quiz attempt at index ${i} has invalid 'score' field` };
                }

                if (typeof attempt.totalQuestions !== 'number') {
                    return { isValid: false, error: `Quiz attempt at index ${i} has invalid 'totalQuestions' field` };
                }

                // timeSpent might not exist in older data, so we'll just check type if it exists
                if ('timeSpent' in attempt && typeof attempt.timeSpent !== 'number') {
                    return { isValid: false, error: `Quiz attempt at index ${i} has invalid 'timeSpent' field` };
                }
            }
        }

        // Validate non-empty question attempts
        if (data.questionAttempts.length > 0) {
            for (let i = 0; i < data.questionAttempts.length; i++) {
                const question = data.questionAttempts[i];

                // Check required string fields
                if (!question.id || typeof question.id !== 'string') {
                    return { isValid: false, error: `Question attempt at index ${i} missing 'id' field` };
                }

                if (!question.quizAttemptId || typeof question.quizAttemptId !== 'string') {
                    return { isValid: false, error: `Question attempt at index ${i} missing 'quizAttemptId' field` };
                }

                if (!question.questionId || typeof question.questionId !== 'string') {
                    return { isValid: false, error: `Question attempt at index ${i} missing 'questionId' field` };
                }

                if (!question.categoryId || typeof question.categoryId !== 'string') {
                    return { isValid: false, error: `Question attempt at index ${i} missing 'categoryId' field` };
                }

                // Check numeric and boolean fields
                if (typeof question.selectedOption !== 'number') {
                    return { isValid: false, error: `Question attempt at index ${i} has invalid 'selectedOption' field` };
                }

                if (typeof question.correctOption !== 'number') {
                    return { isValid: false, error: `Question attempt at index ${i} has invalid 'correctOption' field` };
                }

                if (typeof question.isCorrect !== 'boolean') {
                    return { isValid: false, error: `Question attempt at index ${i} has invalid 'isCorrect' field` };
                }

                // timeSpent might not exist in older data
                if ('timeSpent' in question && typeof question.timeSpent !== 'number') {
                    return { isValid: false, error: `Question attempt at index ${i} has invalid 'timeSpent' field` };
                }
            }
        }

        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: `Validation error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}