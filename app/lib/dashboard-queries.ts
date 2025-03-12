// app/lib/dashboard-queries.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProgress } from '../types/progress';
import { getProgress, resetProgressCache } from '../services/progressStorage';

// Query keys for dashboard data
export const dashboardKeys = {
    all: ['dashboard'] as const,
    progress: () => [...dashboardKeys.all, 'progress'] as const,
    metrics: () => [...dashboardKeys.all, 'metrics'] as const,
    categoryPerformance: () => [...dashboardKeys.all, 'categoryPerformance'] as const,
    timeMetrics: () => [...dashboardKeys.all, 'timeMetrics'] as const,
    improvementData: () => [...dashboardKeys.all, 'improvementData'] as const,
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

// Calculate improvement data from progress data
export function calculateImprovementData(progress: UserProgress) {
    // Group attempts by week and calculate average scores
    const attempts = [...progress.quizAttempts].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (attempts.length === 0) return [];

    const weeklyData: Record<string, { scores: number, count: number }> = {};
    attempts.forEach((attempt) => {
        const weekStart = getWeekStart(new Date(attempt.date));
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { scores: 0, count: 0 };
        }

        weeklyData[weekKey].scores += (attempt.score / attempt.totalQuestions) * 100;
        weeklyData[weekKey].count++;
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
        week,
        avgScore: data.count > 0 ? Math.round(data.scores / data.count) : 0
    }));
}

// Helper function for getting week start date
function getWeekStart(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
}

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

// React Query hooks
export function useProgressData() {
    return useQuery({
        queryKey: dashboardKeys.progress(),
        queryFn: fetchProgress,
        // Reduce stale time to prompt more frequent refetching
        staleTime: 1000 * 5, // Consider data stale after 5 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}

export function useDashboardMetrics() {
    const queryClient = useQueryClient();
    const { data: progress, isLoading: progressLoading } = useProgressData();

    return useQuery({
        queryKey: dashboardKeys.metrics(),
        queryFn: () => {
            if (!progress) return null;

            // Filter out attempts with no questions answered
            const validAttempts = progress.quizAttempts.filter(attempt =>
                progress.questionAttempts.some(q => q.quizAttemptId === attempt.id) &&
                attempt.totalQuestions > 0
            );

            // Get recent attempts
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
        // Keep this data in sync with progress data
        staleTime: 1000 * 5, // Consider data stale after 5 seconds
    });
}

export function useCategoryPerformance() {
    const { data: progress, isLoading: progressLoading } = useProgressData();

    return useQuery({
        queryKey: dashboardKeys.categoryPerformance(),
        queryFn: () => progress ? calculateCategoryPerformance(progress) : [],
        enabled: !!progress,
        // Keep this data in sync with progress data
        staleTime: 1000 * 5, // Consider data stale after 5 seconds
    });
}

export function useTimeMetrics() {
    const { data: progress, isLoading: progressLoading } = useProgressData();

    return useQuery({
        queryKey: dashboardKeys.timeMetrics(),
        queryFn: () => progress ? calculateTimeMetrics(progress) : [],
        enabled: !!progress,
        // Keep this data in sync with progress data
        staleTime: 1000 * 5, // Consider data stale after 5 seconds
    });
}

export function useImprovementData() {
    const { data: progress, isLoading: progressLoading } = useProgressData();

    return useQuery({
        queryKey: dashboardKeys.improvementData(),
        queryFn: () => progress ? calculateImprovementData(progress) : [],
        enabled: !!progress,
        // Keep this data in sync with progress data
        staleTime: 1000 * 5, // Consider data stale after 5 seconds
    });
}

// Helper function to invalidate all dashboard queries to force a refresh
export function invalidateDashboardQueries() {
    const queryClient = useQueryClient();
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}