// app/services/progressStorage.ts
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

        // Add validation right after loading from storage for robustness
        const parsedData = JSON.parse(storedData) as UserProgress;
        const validation = validateProgressData(parsedData);
        if (!validation.isValid) {
            console.warn(`Data loaded from localStorage failed validation: ${validation.error}. Returning initial progress.`);
            // Optionally clear invalid storage: localStorage.removeItem(STORAGE_KEY);
            return getInitialProgress();
        }
        return parsedData;

    } catch (error) {
        console.error('Error loading progress from localStorage:', error);
        // Optionally clear potentially corrupted storage: if (isBrowser()) localStorage.removeItem(STORAGE_KEY);
        return getInitialProgress();
    }
}

// Save progress data to localStorage
function saveToStorage(progress: UserProgress) {
    try {
        if (!isBrowser()) return;

        // Add validation before saving
        const validation = validateProgressData(progress);
        if (!validation.isValid) {
            console.error(`Attempted to save invalid progress data: ${validation.error}. Aborting save.`);
            return; // Prevent saving invalid data
        }

        const serializedData = JSON.stringify(progress);
        localStorage.setItem(STORAGE_KEY, serializedData);
        // Reduce console noise for successful saves unless debugging
        // console.log(`Saved to localStorage: ${progress.quizAttempts.length} attempts, ${progress.questionAttempts.length} questions`);

    } catch (error) {
        console.error('Error saving progress to localStorage:', error);
    }
}

export function getProgress(): UserProgress {
    // If we have a cached version, use it
    if (progressCache !== null) {
        return progressCache;
    }

    // Otherwise load from storage (loadFromStorage now includes validation)
    const progress = loadFromStorage();
    progressCache = progress; // Cache the loaded (and validated) progress

    return progress;
}

export function saveProgress(progress: UserProgress): void {
    // Validate before updating cache and saving
    const validation = validateProgressData(progress);
    if (!validation.isValid) {
        console.error(`Attempted to save invalid progress data (via saveProgress): ${validation.error}. Aborting save.`);
        return;
    }

    // Update our cache
    progressCache = { ...progress }; // Use spread to ensure a new object reference if needed

    // Save to localStorage (saveToStorage also validates)
    saveToStorage(progress);
}

export function startQuizAttempt(categoryId: string, existingAttemptId?: string): QuizAttempt {
    // Get current progress
    const progress = getProgress();

    // Check if the existing ID is valid
    if (existingAttemptId) {
        const existingAttempt = progress.quizAttempts.find(a => a.id === existingAttemptId);
        if (existingAttempt) {
            // console.log("Reusing existing quiz attempt:", existingAttemptId); // Less verbose
            return existingAttempt;
        }
    }

    // Create a new attempt
    const newAttempt: QuizAttempt = {
        id: uuidv4(),
        categoryId,
        date: new Date().toISOString(),
        score: 0, // Initialize with 0
        totalQuestions: 0, // Initialize with 0
        timeSpent: 0 // Initialize with 0
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
    selectedOption: number, // Should be number from RadioGroup
    correctOption: number, // Should be number from question data
    timeSpent: number // Should always be a number from calculation
): void {
    // Get current progress
    const progress = getProgress();

    // Find the quiz attempt
    const quizAttempt = progress.quizAttempts.find(a => a.id === quizAttemptId);
    if (!quizAttempt) {
        console.error("Cannot record question for nonexistent attempt:", quizAttemptId);
        return;
    }

    // Ensure parameters are valid types before proceeding
    const validTimeSpent = typeof timeSpent === 'number' && !isNaN(timeSpent) ? timeSpent : 0;
    const validSelectedOption = typeof selectedOption === 'number' && !isNaN(selectedOption) ? selectedOption : -1; // Use -1 if invalid?
    const validCorrectOption = typeof correctOption === 'number' && !isNaN(correctOption) ? correctOption : -1; // Use -1 if invalid?

    if (validSelectedOption === -1 || validCorrectOption === -1) {
        console.warn(`Invalid options passed to recordQuestionAttempt for attempt ${quizAttemptId}, question ${questionId}. Selected: ${selectedOption}, Correct: ${correctOption}`);
        // Decide if you want to still record the attempt with invalid options or bail out
        // return; // Option to bail out
    }


    // Create the question attempt
    const questionAttempt: QuestionAttempt = {
        id: uuidv4(),
        quizAttemptId,
        questionId,
        categoryId,
        selectedOption: validSelectedOption,
        correctOption: validCorrectOption,
        isCorrect: validSelectedOption === validCorrectOption && validSelectedOption !== -1, // Check for valid comparison
        timeSpent: validTimeSpent, // Use validated time
    };

    // Add to our progress
    progress.questionAttempts.push(questionAttempt);

    // Update the quiz attempt
    quizAttempt.totalQuestions = (quizAttempt.totalQuestions || 0) + 1; // Ensure totalQuestions is treated as number
    if (questionAttempt.isCorrect) {
        quizAttempt.score = (quizAttempt.score || 0) + 1; // Ensure score is treated as number
    }
    // Ensure quizAttempt.timeSpent is treated as a number
    quizAttempt.timeSpent = (quizAttempt.timeSpent || 0) + validTimeSpent;

    // Save changes
    saveProgress(progress);

    // Less verbose logging unless debugging
    // console.log("Recorded question for attempt:", quizAttemptId,
    //     "- Correct:", questionAttempt.isCorrect,
    //     "- Total questions:", quizAttempt.totalQuestions);
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
        if (questions.length > 0) {
            const firstQuestion = questions[0];
            console.log("Recreating missing quiz attempt:", quizAttemptId);

            // Calculate stats from questions
            const calculatedScore = questions.filter(q => q.isCorrect).length;
            const calculatedTime = questions.reduce((total, q) => total + (q.timeSpent || 0), 0); // Ensure timeSpent is handled

            const newAttempt: QuizAttempt = {
                id: quizAttemptId,
                categoryId: firstQuestion.categoryId,
                date: new Date().toISOString(), // Use current date for recreated attempt? Or find earliest/latest question date?
                score: calculatedScore,
                totalQuestions: questions.length,
                timeSpent: calculatedTime
            };

            progress.quizAttempts.push(newAttempt);
            console.log("Recreated and finalized quiz attempt:", quizAttemptId);

            saveProgress(progress); // Save recreated attempt
        } else {
            console.warn("Cannot finalize quiz: Attempt not found and no questions associated:", quizAttemptId);
        }
        return;
    }

    // Update the existing attempt
    const attempt = progress.quizAttempts[attemptIndex];

    // Recalculate statistics directly from associated questions for consistency
    attempt.totalQuestions = questions.length;
    attempt.score = questions.filter(q => q.isCorrect).length;
    attempt.timeSpent = questions.reduce((total, q) => total + (q.timeSpent || 0), 0); // Ensure timeSpent is handled

    // If no questions were answered, remove the attempt
    if (questions.length === 0) {
        console.log("Removing empty quiz attempt:", quizAttemptId);
        progress.quizAttempts.splice(attemptIndex, 1);
    } else {
        progress.quizAttempts[attemptIndex] = attempt; // Update the attempt in the array
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
        console.log("DEBUG: Not in browser environment");
        return;
    }
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        console.log(`DEBUG localStorage content for key [${STORAGE_KEY}]:`, rawData ? rawData.substring(0, 500) + '...' : '(empty)'); // Log preview

        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                const validation = validateProgressData(parsed); // Validate the raw parsed data
                console.log("DEBUG Parsed data validation:", {
                    quizAttemptsCount: parsed.quizAttempts?.length ?? 'N/A',
                    questionAttemptsCount: parsed.questionAttempts?.length ?? 'N/A',
                    isValid: validation.isValid,
                    validationError: validation.error,
                });
                if (!validation.isValid) {
                    console.error("DEBUG: Data currently in localStorage is INVALID according to validator.");
                }
                // Optional: Log first item details if needed for deeper debug
                // if (parsed.quizAttempts?.length > 0) console.log("DEBUG First quizAttempt:", parsed.quizAttempts[0]);
                // if (parsed.questionAttempts?.length > 0) console.log("DEBUG First questionAttempt:", parsed.questionAttempts[0]);

            } catch (parseError) {
                console.error("DEBUG Error parsing localStorage JSON:", parseError);
            }
        } else {
            console.log("DEBUG No data found in localStorage");
        }
    } catch (error) {
        console.error("DEBUG Error reading localStorage:", error);
    }
}

// Export progress data as a JSON file - with enhanced cleaning
export function exportProgress(): void {
    try {
        if (!isBrowser()) {
            console.error('EXPORT error: Not in browser environment');
            return;
        }

        // Get the current progress data (already validated by getProgress)
        const progressData = getProgress();
        console.log('EXPORT - Data retrieved:', {
            quizAttempts: progressData.quizAttempts?.length ?? 0,
            questionAttempts: progressData.questionAttempts?.length ?? 0
        });

        // *** Enhanced Cleaning ***
        const cleanData: UserProgress = {
            quizAttempts: (progressData.quizAttempts || []).map(attempt => ({
                id: String(attempt.id || uuidv4()), // Ensure ID is string
                categoryId: String(attempt.categoryId || 'unknown'), // Ensure categoryId is string
                date: (attempt.date && !isNaN(Date.parse(attempt.date))) ? attempt.date : new Date(0).toISOString(), // Ensure date is valid ISO string
                score: typeof attempt.score === 'number' && !isNaN(attempt.score) ? attempt.score : 0, // Ensure score is number
                totalQuestions: typeof attempt.totalQuestions === 'number' && !isNaN(attempt.totalQuestions) && attempt.totalQuestions >= 0 ? attempt.totalQuestions : 0, // Ensure totalQuestions is non-negative number
                timeSpent: typeof attempt.timeSpent === 'number' && !isNaN(attempt.timeSpent) ? attempt.timeSpent : 0 // Ensure timeSpent is number
            })),
            questionAttempts: (progressData.questionAttempts || []).map(question => ({
                id: String(question.id || uuidv4()), // Ensure ID is string
                quizAttemptId: String(question.quizAttemptId || 'unknown'), // Ensure quizAttemptId is string
                questionId: String(question.questionId || 'unknown'), // Ensure questionId is string
                categoryId: String(question.categoryId || 'unknown'), // Ensure categoryId is string
                selectedOption: typeof question.selectedOption === 'number' && !isNaN(question.selectedOption) ? question.selectedOption : -1, // Ensure selectedOption is number
                correctOption: typeof question.correctOption === 'number' && !isNaN(question.correctOption) ? question.correctOption : -1, // Ensure correctOption is number
                isCorrect: typeof question.isCorrect === 'boolean' ? question.isCorrect : false, // Ensure isCorrect is boolean
                timeSpent: typeof question.timeSpent === 'number' && !isNaN(question.timeSpent) ? question.timeSpent : 0 // Ensure timeSpent is number
            }))
        };
        // *** End Enhanced Cleaning ***

        // Re-validate the rigorously cleaned data
        const validationResult = validateProgressData(cleanData);
        if (!validationResult.isValid) {
            console.error(`EXPORT validation failed AFTER cleaning: ${validationResult.error}`, cleanData);
            throw new Error(`Export data validation failed after cleaning: ${validationResult.error}`);
        }
        console.log('EXPORT - Rigorously cleaned data validated successfully.');

        // Convert to a JSON string
        const jsonData = JSON.stringify(cleanData, null, 2);
        console.log('EXPORT - JSON prepared, length:', jsonData.length);

        // --- File download logic (remains the same) ---
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const randomNumber = Math.floor(Math.random() * 1000000);
        a.download = `nqesh-progress-${new Date().toISOString().slice(0, 10)}-${randomNumber}.json`;
        document.body.appendChild(a);
        a.click();
        console.log('EXPORT - Download triggered');
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('EXPORT - Cleanup completed');
        }, 100);
        // --- End file download logic ---

    } catch (error) {
        console.error('Error exporting progress data:', error);
        // Inform the user
        if (isBrowser()) {
            alert(`Error exporting data: ${error instanceof Error ? error.message : String(error)}. Check console for details.`);
        }
    }
}

// Import progress data from a JSON file - with enhanced debugging
export async function importProgress(file: File): Promise<boolean> {
    try {
        if (!isBrowser()) {
            console.error('IMPORT error: Not in browser environment');
            return false;
        }

        // Read the file content
        const fileContent = await file.text();
        console.log('IMPORT - Reading file:', file.name, `(${fileContent.length} chars)`);

        if (!fileContent || !fileContent.trim().startsWith('{')) {
            console.error('IMPORT error: File is empty or does not start with {');
            return false;
        }

        let importedData: any;
        try {
            importedData = JSON.parse(fileContent);
            console.log('IMPORT - Successfully parsed JSON.');
        } catch (parseError) {
            console.error('IMPORT error: JSON parse failed:', parseError);
            return false;
        }

        // Validate the structure and content rigorously
        console.log('IMPORT - Starting validation...');
        const validationResult = validateProgressData(importedData);
        if (!validationResult.isValid) {
            console.error(`IMPORT validation failed: ${validationResult.error}`);
            // Log the data that failed validation for debugging - BE CAREFUL with large data
            // console.error('IMPORT - Invalid data structure:', JSON.stringify(importedData, null, 2).substring(0, 1000) + '...');
            return false;
        }
        console.log('IMPORT - Data validated successfully.');

        // Save the validated imported data (replacing existing data)
        console.log('IMPORT - Attempting to save validated data...');
        saveProgress(importedData as UserProgress); // saveProgress internally validates again

        // Reset the cache AFTER successful save to ensure next read gets the new data
        resetProgressCache();

        console.log('IMPORT successful - Data saved and cache reset.');
        return true;

    } catch (error) {
        console.error('Error during import process:', error);
        return false;
    }
}


// Enhanced validation with detailed logging for failure cases
function validateProgressData(data: any): { isValid: boolean; error?: string } {
    const logError = (context: string, index: number, field: string, value: any, reason: string) => {
        console.error(`VALIDATION FAIL: ${context}[${index}].${field} (value: ${JSON.stringify(value)}) - ${reason}`);
        return { isValid: false, error: `${context}[${index}].${field} - ${reason}` };
    };

    try {
        if (!data || typeof data !== 'object') return { isValid: false, error: `Data is not an object: ${typeof data}` };
        if (!Array.isArray(data.quizAttempts)) return { isValid: false, error: 'quizAttempts is missing or not an array' };
        if (!Array.isArray(data.questionAttempts)) return { isValid: false, error: 'questionAttempts is missing or not an array' };

        // Detailed validation for quiz attempts
        for (let i = 0; i < data.quizAttempts.length; i++) {
            const attempt = data.quizAttempts[i];
            if (!attempt || typeof attempt !== 'object') return logError('QuizAttempt', i, 'object', attempt, 'Invalid attempt object');
            if (!attempt.id || typeof attempt.id !== 'string') return logError('QuizAttempt', i, 'id', attempt.id, 'Missing/invalid string');
            if (!attempt.categoryId || typeof attempt.categoryId !== 'string') return logError('QuizAttempt', i, 'categoryId', attempt.categoryId, 'Missing/invalid string');
            if (!attempt.date || typeof attempt.date !== 'string' || isNaN(Date.parse(attempt.date))) return logError('QuizAttempt', i, 'date', attempt.date, 'Missing/invalid/unparsable date string');
            if (typeof attempt.score !== 'number' || isNaN(attempt.score)) return logError('QuizAttempt', i, 'score', attempt.score, 'Invalid number (or NaN)');
            if (typeof attempt.totalQuestions !== 'number' || isNaN(attempt.totalQuestions) || attempt.totalQuestions < 0) return logError('QuizAttempt', i, 'totalQuestions', attempt.totalQuestions, 'Invalid non-negative number (or NaN)');
            if ('timeSpent' in attempt && (typeof attempt.timeSpent !== 'number' || isNaN(attempt.timeSpent))) return logError('QuizAttempt', i, 'timeSpent', attempt.timeSpent, 'Invalid number (or NaN)');
        }

        // Detailed validation for question attempts
        for (let i = 0; i < data.questionAttempts.length; i++) {
            const question = data.questionAttempts[i];
            if (!question || typeof question !== 'object') return logError('QuestionAttempt', i, 'object', question, 'Invalid question object');
            if (!question.id || typeof question.id !== 'string') return logError('QuestionAttempt', i, 'id', question.id, 'Missing/invalid string');
            if (!question.quizAttemptId || typeof question.quizAttemptId !== 'string') return logError('QuestionAttempt', i, 'quizAttemptId', question.quizAttemptId, 'Missing/invalid string');
            if (!question.questionId || typeof question.questionId !== 'string') return logError('QuestionAttempt', i, 'questionId', question.questionId, 'Missing/invalid string');
            if (!question.categoryId || typeof question.categoryId !== 'string') return logError('QuestionAttempt', i, 'categoryId', question.categoryId, 'Missing/invalid string');
            if (typeof question.selectedOption !== 'number' || isNaN(question.selectedOption)) return logError('QuestionAttempt', i, 'selectedOption', question.selectedOption, 'Invalid number (or NaN)');
            if (typeof question.correctOption !== 'number' || isNaN(question.correctOption)) return logError('QuestionAttempt', i, 'correctOption', question.correctOption, 'Invalid number (or NaN)');
            if (typeof question.isCorrect !== 'boolean') return logError('QuestionAttempt', i, 'isCorrect', question.isCorrect, 'Invalid boolean');
            if ('timeSpent' in question && (typeof question.timeSpent !== 'number' || isNaN(question.timeSpent))) return logError('QuestionAttempt', i, 'timeSpent', question.timeSpent, 'Invalid number (or NaN)');
        }

        // If all checks pass
        return { isValid: true };

    } catch (error) {
        console.error("VALIDATION function caught error:", error);
        return {
            isValid: false,
            error: `Validation function error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}