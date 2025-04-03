// app/components/TimeSpentDistributionChart.tsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProgressData } from '~/lib/dashboard-queries';
import { Skeleton } from '~/components/ui/skeleton';

// Define interfaces for our data structures
interface TimeBin {
    range: string; // e.g., "0-5 min"
    rangeSecondsStart: number;
    rangeSecondsEnd: number | null; // null for the last unbounded bin
    count: number;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: TimeBin;
    }>;
}

// --- Configuration for Bins ---
// Define bins in minutes, convert to seconds for comparison
const TIME_BINS_MINUTES = [
    { label: '0-5 min', start: 0, end: 5 },
    { label: '5-10 min', start: 5, end: 10 },
    { label: '10-15 min', start: 10, end: 15 },
    { label: '15-20 min', start: 15, end: 20 },
    { label: '20-25 min', start: 20, end: 25 },
    { label: '25-30 min', start: 25, end: 30 },
    { label: '30+ min', start: 30, end: null }, // Last bin is unbounded
];

// Define colors for bins (optional, can use a single color)
// Using a gradient might be nice here, e.g., from faster (green) to slower (orange/red)
const BIN_COLORS = [
    '#10b981', // Green (fastest)
    '#34d399',
    '#6ee7b7',
    '#f59e0b', // Orange (medium)
    '#fbbf24',
    '#fcd34d',
    '#ef4444', // Red (slowest)
];
// --- End Configuration ---

const TimeSpentDistributionChart: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();

    const distributionData = useMemo<TimeBin[]>(() => {
        if (!progress?.quizAttempts || progress.quizAttempts.length === 0) {
            return [];
        }

        // Only include valid quiz attempts (with questions and valid time)
        const validAttempts = progress.quizAttempts.filter(attempt =>
            attempt.totalQuestions > 0 && typeof attempt.timeSpent === 'number' && !isNaN(attempt.timeSpent)
        );

        // Initialize bins based on configuration
        const bins: TimeBin[] = TIME_BINS_MINUTES.map((binConfig, index) => ({
            range: binConfig.label,
            rangeSecondsStart: binConfig.start * 60, // Convert minutes to seconds
            rangeSecondsEnd: binConfig.end !== null ? binConfig.end * 60 : null, // Convert minutes to seconds
            count: 0,
            color: BIN_COLORS[index % BIN_COLORS.length], // Assign color
        }));

        // Count attempts in each bin - Corrected Logic
        validAttempts.forEach(attempt => {
            const timeSpentSeconds = attempt.timeSpent;

            for (const bin of bins) {
                // Explicitly check if it's the last (unbounded) bin
                if (bin.rangeSecondsEnd === null) {
                    if (timeSpentSeconds >= bin.rangeSecondsStart) {
                        bin.count++;
                        break; // Found bin, move to next attempt
                    }
                }
                // If it's a bounded bin (rangeSecondsEnd is a number)
                else {
                    if (timeSpentSeconds >= bin.rangeSecondsStart && timeSpentSeconds < bin.rangeSecondsEnd) {
                        bin.count++;
                        break; // Found bin, move to next attempt
                    }
                }
            }
        });

        // Filter out empty bins if desired (optional, shows gaps if kept)
        return bins; // Return all bins, even empty ones, to show the full distribution scale
        // return bins.filter(bin => bin.count > 0); // Use this line to hide empty bins
    }, [progress]);

    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">Time Range: {data.range}</p>
                    <p>Number of Quizzes: {data.count}</p>
                </div>
            );
        }
        return null;
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Time Spent Distribution (Per Quiz)</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                </CardContent>
            </Card>
        );
    }

    // --- Empty State ---
    if (!progress || progress.quizAttempts.filter(a => a.totalQuestions > 0).length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Time Spent Distribution (Per Quiz)</CardTitle>
                    <CardDescription>Complete quizzes to see how long they take.</CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center text-gray-500">
                    No data available yet
                </CardContent>
            </Card>
        );
    }

    // --- Chart Rendering ---
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Time Spent Distribution (Per Quiz)</CardTitle>
                <CardDescription>
                    Shows how many quizzes fall into different total completion time ranges.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={distributionData}
                            margin={{ top: 10, right: 20, left: 40, bottom: 30 }}
                            barCategoryGap="20%" // Add gap between bars
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0} // Ensure all labels are shown
                                label={{ value: 'Quiz Completion Time', position: 'insideBottom', offset: -15, fontSize: 11 }}
                            />
                            <YAxis
                                allowDecimals={false}
                                label={{
                                    value: 'Number of Quizzes',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: -25,
                                    style: { textAnchor: 'middle', fontSize: 11 }
                                }}
                                tick={{ fontSize: 11 }}
                                width={60} // Increased width for label
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }} />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]} // Rounded top corners
                                isAnimationActive={true}
                                animationDuration={800}
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

export default TimeSpentDistributionChart;