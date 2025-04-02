import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { useProgressData } from '~/lib/dashboard-queries';

// Define interfaces for our data and props
interface ScatterPoint {
    timeSpent: number;
    accuracy: number;
    category: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ScatterPoint;
    }>;
}

interface TimeAverages {
    correct: number;
    incorrect: number;
}

const AccuracyVsTimeChart: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();

    const scatterData = useMemo(() => {
        if (!progress?.questionAttempts || progress.questionAttempts.length === 0) {
            return [] as ScatterPoint[];
        }

        // Map question attempts to data points for scatter plot
        return progress.questionAttempts.map(attempt => ({
            timeSpent: attempt.timeSpent,
            accuracy: attempt.isCorrect ? 1 : 0,
            category: attempt.categoryId,
        })) as ScatterPoint[];
    }, [progress]);

    // Calculate averages for correct vs incorrect answers
    const averages = useMemo<TimeAverages>(() => {
        if (!progress?.questionAttempts || progress.questionAttempts.length === 0) {
            return { correct: 0, incorrect: 0 };
        }

        const correctAttempts = progress.questionAttempts.filter(a => a.isCorrect);
        const incorrectAttempts = progress.questionAttempts.filter(a => !a.isCorrect);

        const avgTimeCorrect = correctAttempts.length > 0
            ? Math.round(correctAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / correctAttempts.length)
            : 0;

        const avgTimeIncorrect = incorrectAttempts.length > 0
            ? Math.round(incorrectAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / incorrectAttempts.length)
            : 0;

        return { correct: avgTimeCorrect, incorrect: avgTimeIncorrect };
    }, [progress]);

    // Get category names for better display
    const getCategoryName = (categoryId: string): string => {
        const names: Record<string, string> = {
            'leadership': 'School Leadership',
            'management': 'Educational Management',
            'instructional': 'Instructional Leadership',
            'administrative': 'Administrative Management',
            'legal': 'Legal Aspects'
        };
        return names[categoryId] || categoryId;
    };

    // Custom tooltip for scatter plot
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">{getCategoryName(data.category)}</p>
                    <p>Time: {data.timeSpent} seconds</p>
                    <p>Status: {data.accuracy === 1 ? 'Correct' : 'Incorrect'}</p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Accuracy vs. Time Spent</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-200 w-full h-full rounded-md"></div>
                </CardContent>
            </Card>
        );
    }

    if (!progress || progress.questionAttempts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Accuracy vs. Time Spent</CardTitle>
                    <CardDescription>Answer more questions to see this analysis.</CardDescription>
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
                <CardTitle className="text-base">Accuracy vs. Time Spent</CardTitle>
                <CardDescription>
                    Analyzing if time spent correlates with correct answers.
                    <span className="block mt-1 text-gray-500 text-xs">
                        Avg. Time (Correct): <span className="font-medium">{averages.correct} sec</span> |
                        Avg. Time (Incorrect): <span className="font-medium">{averages.incorrect} sec</span>
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="timeSpent"
                                name="Time"
                                label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="accuracy"
                                name="Accuracy"
                                domain={[0, 1]}
                                ticks={[0, 1]}
                                tickFormatter={(value: number) => value === 1 ? 'Correct' : 'Incorrect'}
                                tick={{ fontSize: 11 }}
                                width={80}
                            />
                            <ZAxis range={[60, 60]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter
                                name="Correct"
                                data={scatterData.filter(d => d.accuracy === 1)}
                                fill="#10b981"
                            />
                            <Scatter
                                name="Incorrect"
                                data={scatterData.filter(d => d.accuracy === 0)}
                                fill="#ef4444"
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccuracyVsTimeChart;