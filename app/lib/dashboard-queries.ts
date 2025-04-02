// app/lib/dashboard-queries.ts
import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query';
import type { UserProgress } from '../types/progress';
import { getProgress, resetProgressCache } from '../services/progressStorage';

// Query keys for dashboard data
export const dashboardKeys = {
    all: ['dashboard'] as const,
    progress: () => [...dashboardKeys.all, 'progress'] as const,
    metrics: () => [...dashboardKeys.all, 'metrics'] as const,
    categoryPerformance: () => [...dashboardKeys.all, 'categoryPerformance'] as const,
    timeMetrics: () => [...dashboardKeys.all, 'timeMetrics'] as const,
    // New key for daily progress
    dailyProgress: () => [...dashboardKeys.all, 'dailyProgress'] as const,
};

// Data fetching functions
export function fetchProgress(): UserProgress {
    // Reset cache to ensure fresh data
    resetProgressCache();
    return getProgress();
}

// Calculate category performance from progress data
export function calculateCategoryPerformance(progress: UserProgress) {
    // Group question attempts by category and calculate success rates
    const categories: Record<string, { total: number, correct: number, name: string }> = {};

    progress.questionAttempts.forEach((attempt) => {
        if (!categories[attempt.categoryId]) {
            categories[attempt.categoryId] = {
                total: 0, correct: 0, name: getCategoryName(attempt.categoryId)
            };
        }

        categories[attempt.categoryId].total++;
        if (attempt.isCorrect) {
            categories[attempt.categoryId].correct++;
        }
    });

    return Object.entries(categories).map(([id, data]) => ({
        id,
        name: data.name,
        score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        attempts: data.total
    }));
}

// Calculate time metrics from progress data
export function calculateTimeMetrics(progress: UserProgress) {
    // Calculate average time per question per category
    const categories: Record<string, { totalTime: number, count: number, name: string }> = {};

    progress.questionAttempts.forEach((attempt) => {
        if (!categories[attempt.categoryId]) {
            categories[attempt.categoryId] = {
                totalTime: 0, count: 0, name: getCategoryName(attempt.categoryId)
            };
        }

        categories[attempt.categoryId].totalTime += attempt.timeSpent;
        categories[attempt.categoryId].count++;
    });

    return Object.entries(categories).map(([id, data]) => ({
        id,
        name: data.name,
        avgTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0
    }));
}

// *** NEW: Calculate daily progress data ***
export function calculateDailyProgress(progress: UserProgress) {
    // Filter out invalid attempts and sort by date
    const validAttempts = [...progress.quizAttempts]
        .filter(attempt => attempt.totalQuestions > 0) // Ensure attempt has questions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (validAttempts.length === 0) return [];

    const dailyData: Record<string, { scoreSum: number, count: number }> = {};

    validAttempts.forEach((attempt) => {
        // Group by YYYY-MM-DD format
        const dateKey = new Date(attempt.date).toISOString().split('T')[0];

        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { scoreSum: 0, count: 0 };
        }

        // Calculate percentage score for this attempt
        const percentageScore = (attempt.score / attempt.totalQuestions) * 100;

        dailyData[dateKey].scoreSum += percentageScore;
        dailyData[dateKey].count++;
    });

    // Convert grouped data to array format for the chart, calculating average
    return Object.entries(dailyData).map(([date, data]) => ({
        date, // Keep the YYYY-MM-DD format for sorting
        avgScore: data.count > 0 ? Math.round(data.scoreSum / data.count) : 0
    }));
}
// *** END NEW FUNCTION ***

// Helper function for category names
function getCategoryName(categoryId: string): string {
    const names: Record<string, string> = {
        'leadership': 'School Leadership',
        'management': 'Educational Management',
        'instructional': 'Instructional Leadership',
        'administrative': 'Administrative Management',
        'legal': 'Legal Aspects'
    };
    return names[categoryId] || categoryId;
}

// Query options
export const progressDataOptions = () => queryOptions({
    queryKey: dashboardKeys.progress(),
    queryFn: fetchProgress,
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
});

export const dashboardMetricsOptions = (progress: UserProgress | undefined) => queryOptions({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => {
        if (!progress) return null;

        const validAttempts = progress.quizAttempts.filter(attempt =>
            progress.questionAttempts.some(q => q.quizAttemptId === attempt.id) &&
            attempt.totalQuestions > 0
        );

        const recentAttempts = validAttempts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        return {
            totalAttempts: validAttempts.length,
            questionsAnswered: progress.questionAttempts.length,
            correctAnswers: progress.questionAttempts.filter(a => a.isCorrect).length,
            recentAttempts
        };
    },
    enabled: !!progress,
    staleTime: 1000 * 5,
});

export const categoryPerformanceOptions = (progress: UserProgress | undefined) => queryOptions({
    queryKey: dashboardKeys.categoryPerformance(),
    queryFn: () => progress ? calculateCategoryPerformance(progress) : [],
    enabled: !!progress,
    staleTime: 1000 * 5,
});

export const timeMetricsOptions = (progress: UserProgress | undefined) => queryOptions({
    queryKey: dashboardKeys.timeMetrics(),
    queryFn: () => progress ? calculateTimeMetrics(progress) : [],
    enabled: !!progress,
    staleTime: 1000 * 5,
});

// *** NEW: Query options for daily progress ***
export const dailyProgressOptions = (progress: UserProgress | undefined) => queryOptions({
    queryKey: dashboardKeys.dailyProgress(),
    queryFn: () => progress ? calculateDailyProgress(progress) : [],
    enabled: !!progress,
    staleTime: 1000 * 60 * 5, // 5 minutes staleTime as requested
});
// *** END NEW OPTIONS ***

// React Query hooks
export function useProgressData() {
    return useQuery(progressDataOptions());
}

export function useDashboardMetrics() {
    const { data: progress } = useProgressData();
    return useQuery(dashboardMetricsOptions(progress));
}

export function useCategoryPerformance() {
    const { data: progress } = useProgressData();
    return useQuery(categoryPerformanceOptions(progress));
}

export function useTimeMetrics() {
    const { data: progress } = useProgressData();
    return useQuery(timeMetricsOptions(progress));
}

// *** NEW: Hook for daily progress ***
export function useDailyProgress() {
    const { data: progress } = useProgressData();
    return useQuery(dailyProgressOptions(progress));
}