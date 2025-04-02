import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProgressData } from '~/lib/dashboard-queries';
import type { QuizAttempt } from '~/types/progress';

// Define interfaces for our data structures
interface CategoryAttemptData {
    date: Date;
    score: number;
    rawData: QuizAttempt;
}

interface CategoryData {
    id: string;
    name: string;
    attempts: CategoryAttemptData[];
    firstAttemptScore: number | null;
    firstAttemptDate: Date | null;
    overallAvgScore?: number;
    improvement?: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        payload: CategoryData;
    }>;
    label?: string;
}

const FirstVsOverallChart: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();

    const categoryData = useMemo(() => {
        if (!progress?.quizAttempts || progress.quizAttempts.length === 0) {
            return [] as CategoryData[];
        }

        // Group quiz attempts by category
        const categories: Record<string, CategoryData> = {};
        progress.quizAttempts.forEach(attempt => {
            const categoryId = attempt.categoryId;

            if (!categories[categoryId]) {
                categories[categoryId] = {
                    id: categoryId,
                    name: getCategoryName(categoryId),
                    attempts: [],
                    firstAttemptScore: null,
                    firstAttemptDate: null,
                };
            }

            // Calculate percentage score for this attempt
            const percentageScore = attempt.totalQuestions > 0
                ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                : 0;

            // Add to attempts array with date and score
            const attemptWithDate: CategoryAttemptData = {
                date: new Date(attempt.date),
                score: percentageScore,
                rawData: attempt
            };

            categories[categoryId].attempts.push(attemptWithDate);
        });

        // Process each category to get first and overall scores
        Object.values(categories).forEach(category => {
            // Sort attempts by date
            category.attempts.sort((a, b) => a.date.getTime() - b.date.getTime());

            // First attempt is the earliest one
            if (category.attempts.length > 0) {
                const first = category.attempts[0];
                category.firstAttemptScore = first.score;
                category.firstAttemptDate = first.date;
            }

            // Calculate overall average
            const totalScore = category.attempts.reduce((sum, a) => sum + a.score, 0);
            category.overallAvgScore = category.attempts.length > 0
                ? Math.round(totalScore / category.attempts.length)
                : 0;

            // Calculate improvement
            if (category.firstAttemptScore !== null && category.attempts.length > 1) {
                category.improvement = (category.overallAvgScore || 0) - category.firstAttemptScore;
            } else {
                category.improvement = 0;
            }
        });

        // Convert to array for chart
        return Object.values(categories)
            .filter(cat => cat.attempts.length > 0) // Only include categories with attempts
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    }, [progress]);

    // Helper function to get category names
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

    // Formatter for tooltip
    const tooltipFormatter = (value: number, name: string) => {
        return [`${value}%`, name === 'firstAttemptScore' ? 'First Attempt' : 'Overall Average'];
    };

    // Custom tooltip content
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Find matching category for more data
            const categoryItem = label ? categoryData.find(c => c.name === label) : undefined;

            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">First Attempt: {payload[0]?.value}%</p>
                    <p className="text-green-600">Overall Avg: {payload[1]?.value}%</p>
                    {categoryItem && categoryItem.improvement !== undefined && categoryItem.improvement !== 0 && (
                        <p className={`${(categoryItem.improvement || 0) > 0 ? 'text-green-600' : 'text-red-600'} font-medium mt-1`}>
                            {(categoryItem.improvement || 0) > 0 ? `+${categoryItem.improvement}%` : `${categoryItem.improvement}%`} improvement
                        </p>
                    )}
                    {categoryItem && (
                        <p className="text-gray-500 text-xs mt-1">
                            {categoryItem.attempts.length} total attempt{categoryItem.attempts.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">First Attempt vs. Overall Performance</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-200 w-full h-full rounded-md"></div>
                </CardContent>
            </Card>
        );
    }

    if (!progress || categoryData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">First Attempt vs. Overall Performance</CardTitle>
                    <CardDescription>Take more quizzes to see this comparison.</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center text-gray-500">
                    No data available yet
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">First Attempt vs. Overall Performance</CardTitle>
                <CardDescription>
                    Compare your first quiz attempt in each category with your overall average
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={categoryData}
                            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
                            barGap={4}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value: string) => {
                                    // Show abbreviation for long category names
                                    const words = value.split(' ');
                                    if (words.length > 1) {
                                        return words[0].substring(0, 6) + ".";
                                    }
                                    return value.substring(0, 6);
                                }}
                                height={50}
                                interval={0}
                            />
                            <YAxis
                                label={{ value: 'Score %', angle: -90, position: 'insideLeft', offset: -15 }}
                                domain={[0, 100]}
                                tick={{ fontSize: 11 }}
                                width={40}
                            />
                            <Tooltip
                                formatter={tooltipFormatter}
                                content={<CustomTooltip />}
                            />
                            <Legend wrapperStyle={{ fontSize: 11, marginTop: "10px" }} />
                            <Bar
                                dataKey="firstAttemptScore"
                                name="First Attempt"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="overallAvgScore"
                                name="Overall Average"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default FirstVsOverallChart;