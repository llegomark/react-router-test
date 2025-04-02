import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProgressData } from '~/lib/dashboard-queries';

// Define interfaces for our data structures
interface ScoreBin {
    range: string;
    start: number;
    end: number;
    count: number;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ScoreBin;
    }>;
}

const QuizScoreDistribution: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();

    const distributionData = useMemo<ScoreBin[]>(() => {
        if (!progress?.quizAttempts || progress.quizAttempts.length === 0) {
            return [];
        }

        // Only include valid quiz attempts (with questions)
        const validAttempts = progress.quizAttempts.filter(attempt =>
            attempt.totalQuestions > 0
        );

        // Define score bins (0-9%, 10-19%, etc.)
        const bins: ScoreBin[] = Array.from({ length: 11 }, (_, i) => ({
            range: `${i * 10}-${i * 10 + 9}%`,
            start: i * 10,
            end: i * 10 + 9,
            count: 0,
            color: i <= 3 ? '#ef4444' : // Red for 0-39%
                i <= 6 ? '#f59e0b' : // Orange for 40-69%
                    '#10b981'   // Green for 70-100%
        }));

        // Special case for 100%
        bins[10].range = "100%";
        bins[10].start = 100;
        bins[10].end = 100;

        // Count attempts in each bin
        validAttempts.forEach(attempt => {
            const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

            // Find the appropriate bin
            if (percentage === 100) {
                bins[10].count++;
            } else {
                const binIndex = Math.floor(percentage / 10);
                if (binIndex >= 0 && binIndex < bins.length) {
                    bins[binIndex].count++;
                }
            }
        });

        // Filter out empty bins and return
        return bins.filter(bin => bin.count > 0);
    }, [progress]);

    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">Score Range: {data.range}</p>
                    <p>Number of Quizzes: {data.count}</p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quiz Score Distribution</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-200 w-full h-full rounded-md"></div>
                </CardContent>
            </Card>
        );
    }

    if (!progress || distributionData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quiz Score Distribution</CardTitle>
                    <CardDescription>Complete more quizzes to see score distribution.</CardDescription>
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
                <CardTitle className="text-base">Quiz Score Distribution</CardTitle>
                <CardDescription>
                    How your quiz scores are distributed across percentage ranges
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={distributionData}
                            margin={{ top: 10, right: 20, left: 40, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0}
                            />
                            <YAxis
                                allowDecimals={false}
                                label={{
                                    value: 'Number of Quizzes',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: -20,
                                    style: { textAnchor: 'middle', fontSize: 11 }
                                }}
                                tick={{ fontSize: 11 }}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={true}
                                animationDuration={1000}
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuizScoreDistribution;