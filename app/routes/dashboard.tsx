// app/routes/dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import type { QuizAttempt } from "../types/progress";
import { getProgress, debugLocalStorage } from "../services/progressStorage";
import {
    useCategoryPerformance,
    useTimeMetrics,
    useImprovementData,
    useDashboardMetrics
} from "../lib/dashboard-queries";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
    BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip, Bar,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "../components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { QueryErrorBoundary } from "../components/QueryErrorBoundary";

// Colors for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export async function clientLoader() {
    // Get the initial progress data for the first render
    const progress = getProgress();

    // Calculate metrics for the initial render
    const validAttempts = progress.quizAttempts.filter(attempt =>
        progress.questionAttempts.some(q => q.quizAttemptId === attempt.id) &&
        attempt.totalQuestions > 0
    );

    const recentAttempts = validAttempts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return {
        progress,
        totalAttempts: validAttempts.length,
        questionsAnswered: progress.questionAttempts.length,
        correctAnswers: progress.questionAttempts.filter(a => a.isCorrect).length,
        recentAttempts
    };
}

// Loading state for dashboard metrics
function LoadingMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Loading state for charts
function LoadingChart() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
    );
}

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

function LoadingRecentActivity() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const [activeTab, setActiveTab] = useState("overview");

    // Debug localStorage when component mounts
    useEffect(() => {
        console.log("Dashboard component mounted");
        debugLocalStorage();
    }, []);

    // Use TanStack Query hooks for reactivity
    const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
    const { data: categoryPerformance, isLoading: categoryLoading } = useCategoryPerformance();
    const { data: timeMetrics, isLoading: timeLoading } = useTimeMetrics();
    const { data: improvementData, isLoading: improvementLoading } = useImprovementData();

    // Fall back to loader data if queries haven't loaded yet
    const totalAttempts = metrics?.totalAttempts ?? loaderData?.totalAttempts ?? 0;
    const questionsAnswered = metrics?.questionsAnswered ?? loaderData?.questionsAnswered ?? 0;
    const correctAnswers = metrics?.correctAnswers ?? loaderData?.correctAnswers ?? 0;
    const recentAttempts = metrics?.recentAttempts ?? loaderData?.recentAttempts ?? [];

    const overallAccuracy = questionsAnswered > 0
        ? Math.round((correctAnswers / questionsAnswered) * 100)
        : 0;

    return (
        <TooltipProvider>
            <div className="max-w-5xl mx-auto px-4 py-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold text-blue-800">Your NQESH Progress</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your performance and identify areas for improvement
                    </p>
                </header>

                {metricsLoading ? (
                    <LoadingMetrics />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-1">
                                    <CardTitle className="text-sm font-medium text-gray-500">Quiz Attempts</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Total number of times you've taken a quiz across all categories</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalAttempts}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-1">
                                    <CardTitle className="text-sm font-medium text-gray-500">Questions Answered</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Total number of individual questions you've answered across all quizzes</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{questionsAnswered}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-1">
                                    <CardTitle className="text-sm font-medium text-gray-500">Overall Accuracy</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Percentage of correctly answered questions out of all questions attempted</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overallAccuracy}%</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="time">Time Analysis</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QueryErrorBoundary>
                                {categoryLoading ? (
                                    <LoadingChart />
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Category Performance</CardTitle>
                                            <CardDescription>Your scores across different domains</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {categoryPerformance && categoryPerformance.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={categoryPerformance}>
                                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                        <YAxis label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} />
                                                        <ChartTooltip formatter={(value) => [`${value}%`, 'Score']} />
                                                        <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-center text-gray-500 py-10">Complete quizzes to see your performance</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </QueryErrorBoundary>

                            <QueryErrorBoundary>
                                {metricsLoading ? (
                                    <LoadingRecentActivity />
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Recent Activity</CardTitle>
                                            <CardDescription>Your latest quiz attempts</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {recentAttempts.length > 0 ? (
                                                <div className="space-y-2">
                                                    {recentAttempts.map((attempt: QuizAttempt) => (
                                                        <div key={attempt.id} className="p-3 bg-gray-50 rounded-md">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <div className="font-medium">{getCategoryName(attempt.categoryId)}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {new Date(attempt.date).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <Badge variant={
                                                                    attempt.score / attempt.totalQuestions >= 0.7 ? "default" :
                                                                        attempt.score / attempt.totalQuestions >= 0.5 ? "secondary" : "destructive"
                                                                }>
                                                                    {attempt.score}/{attempt.totalQuestions}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 py-10">No recent quiz attempts</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </QueryErrorBoundary>
                        </div>
                    </TabsContent>

                    <TabsContent value="categories">
                        {categoryLoading ? (
                            <LoadingChart />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Domain Performance Breakdown</CardTitle>
                                    <CardDescription>Detailed analysis of your performance in each domain</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    {categoryPerformance && categoryPerformance.length > 0 ? (
                                        <>
                                            <div className="w-full max-w-lg mb-6">
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={categoryPerformance}
                                                            dataKey="attempts"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {categoryPerformance.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <ChartTooltip formatter={(value) => [value, 'Questions Attempted']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="w-full">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {categoryPerformance.map((category, index) => (
                                                        <div key={category.id} className="p-4 bg-gray-50 rounded-md">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                                <div className="font-medium">{category.name}</div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <div className="text-gray-500">Score</div>
                                                                    <div className="font-medium">{category.score}%</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500">Questions</div>
                                                                    <div className="font-medium">{category.attempts}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">Complete quizzes to see category performance</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="time">
                        {timeLoading ? (
                            <LoadingChart />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Time Analysis</CardTitle>
                                    <CardDescription>Average time spent per question across domains</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {timeMetrics && timeMetrics.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={timeMetrics}>
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                                                <ChartTooltip formatter={(value) => [`${value} sec`, 'Avg. Time']} />
                                                <Bar dataKey="avgTime" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">Complete quizzes to see time analysis</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="progress">
                        {improvementLoading ? (
                            <LoadingChart />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Progress Over Time</CardTitle>
                                    <CardDescription>Your improvement trajectory</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {improvementData && improvementData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={improvementData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                                <YAxis label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} />
                                                <ChartTooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="avgScore"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">Complete more quizzes to track progress over time</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="flex justify-center">
                    <Link
                        to="/"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Return to Categories
                    </Link>
                </div>
            </div>
        </TooltipProvider>
    );
}
