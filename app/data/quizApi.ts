import {
    useQuery,
    QueryClient
} from '@tanstack/react-query';
import { categories } from "./categories";
import { questions } from "./questions";

// Query Keys
export const queryKeys = {
    categories: ['categories'] as const,
    questions: (categoryId: string) => ['questions', categoryId] as const,
};

// Base API functions (without React Query)
export function getCategories() {
    return Promise.resolve(categories);
}

export function getQuestionsByCategory(categoryId: string) {
    return Promise.resolve(
        questions.filter((q) => q.categoryId === categoryId)
    );
}

// TanStack Query Hooks
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: () => getCategories(),
    });
}

export function useQuestionsByCategory(categoryId: string) {
    return useQuery({
        queryKey: queryKeys.questions(categoryId),
        queryFn: () => getQuestionsByCategory(categoryId),
        enabled: !!categoryId, // Only run if categoryId is provided
    });
}

// Prefetch functions for use in loaders
export async function prefetchCategories(queryClient: QueryClient) {
    return queryClient.prefetchQuery({
        queryKey: queryKeys.categories,
        queryFn: () => getCategories(),
    });
}

export async function prefetchQuestionsByCategory(queryClient: QueryClient, categoryId: string) {
    return queryClient.prefetchQuery({
        queryKey: queryKeys.questions(categoryId),
        queryFn: () => getQuestionsByCategory(categoryId),
    });
}