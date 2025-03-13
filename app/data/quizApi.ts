// app/data/quizApi.ts
import {
    useQuery,
    QueryClient,
    queryOptions
} from '@tanstack/react-query';
import { categories } from "./categories";
import { questions } from "./questions";
import type { QuizCategory, QuizQuestion } from "../types/quiz";

// Query Keys
export const queryKeys = {
    categories: ['categories'] as const,
    questions: (categoryId: string) => ['questions', categoryId] as const,
};

// Base API functions (without React Query)
export function getCategories(): Promise<QuizCategory[]> {
    return Promise.resolve(categories);
}

export function getQuestionsByCategory(categoryId: string): Promise<QuizQuestion[]> {
    return Promise.resolve(
        questions.filter((q) => q.categoryId === categoryId)
    );
}

// Query Options
export const categoriesOptions = () => queryOptions({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(),
});

export const questionsByCategoryOptions = (categoryId: string) => queryOptions({
    queryKey: queryKeys.questions(categoryId),
    queryFn: () => getQuestionsByCategory(categoryId),
    enabled: !!categoryId, // Only run if categoryId is provided
});

// TanStack Query Hooks
export function useCategories() {
    return useQuery(categoriesOptions());
}

export function useQuestionsByCategory(categoryId: string) {
    return useQuery(questionsByCategoryOptions(categoryId));
}

// Prefetch functions for use in loaders
export async function prefetchCategories(queryClient: QueryClient) {
    return queryClient.prefetchQuery(categoriesOptions());
}

export async function prefetchQuestionsByCategory(queryClient: QueryClient, categoryId: string) {
    return queryClient.prefetchQuery(questionsByCategoryOptions(categoryId));
}