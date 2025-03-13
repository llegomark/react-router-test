// app/lib/quiz-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    recordQuestionAttempt as recordQuestionAttemptFn,
    finalizeQuizAttempt as finalizeQuizAttemptFn
} from '../services/progressStorage';
import { dashboardKeys } from './dashboard-queries';
import { toast } from 'sonner';
import type { UserProgress, QuestionAttempt } from '../types/progress';

export function useRecordQuestionAttempt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizAttemptId, questionId, categoryId, selectedOption, correctOption, timeSpent }: {
            quizAttemptId: string,
            questionId: string,
            categoryId: string,
            selectedOption: number,
            correctOption: number,
            timeSpent: number
        }) => {
            return new Promise<void>((resolve, reject) => {
                try {
                    recordQuestionAttemptFn(quizAttemptId, questionId, categoryId, selectedOption, correctOption, timeSpent);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        onMutate: async ({ quizAttemptId, questionId, categoryId, selectedOption, correctOption, timeSpent }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: dashboardKeys.progress() });

            // Snapshot the previous value
            const previousProgress = queryClient.getQueryData<UserProgress>(dashboardKeys.progress());

            // Optimistically update to the new value
            queryClient.setQueryData<UserProgress>(dashboardKeys.progress(), (old) => {
                if (!old) return old;

                const newQuestionAttempt: QuestionAttempt = {
                    id: 'optimistic-' + Date.now(), // Generate a unique ID
                    quizAttemptId,
                    questionId,
                    categoryId,
                    selectedOption,
                    correctOption,
                    isCorrect: selectedOption === correctOption,
                    timeSpent,
                };

                return {
                    ...old,
                    questionAttempts: [...(old.questionAttempts || []), newQuestionAttempt],
                };
            });

            // Return a context object with the snapshotted value
            return { previousProgress };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, roll back to the previous value
            if (context?.previousProgress) {
                queryClient.setQueryData<UserProgress>(dashboardKeys.progress(), context.previousProgress);
            }
            toast.error("Failed to record question attempt."); // Display error toast
        },
        onSettled: () => {
            // Always refetch query after error or success:
            queryClient.invalidateQueries({ queryKey: dashboardKeys.progress() });
        },
    });
}

export function useFinalizeQuizAttempt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (quizAttemptId: string) => {
            return new Promise<void>((resolve, reject) => {
                try {
                    finalizeQuizAttemptFn(quizAttemptId);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dashboardKeys.progress() });
        },
        onError: () => {
            toast.error("Failed to finalize quiz attempt."); // Display error toast
        }
    });
}