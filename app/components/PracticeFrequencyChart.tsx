// app/components/PracticeFrequencyChart.tsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
} from 'recharts';
import { Skeleton } from '~/components/ui/skeleton';
import { useProgressData } from '~/lib/dashboard-queries';

// Define interface for chart data points
interface FrequencyDataPoint {
    date: string; // 'YYYY-MM-DD' format
    count: number; // Number of quiz attempts on that day
}

// Helper to get dates for the last N days in 'YYYY-MM-DD' format
const getLastNDates = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }
    return dates.reverse(); // Return in chronological order
};

// Helper to format 'YYYY-MM-DD' to 'MM/DD' for XAxis ticks
const formatDateTick = (dateString: string): string => {
    try {
        // Add time and Z to ensure parsing as UTC
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    } catch (e) {
        return dateString; // Fallback
    }
};

const PracticeFrequencyChart: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();
    const numberOfDays = 30; // Show last 30 days

    // Prepare data for the frequency chart
    const frequencyData = useMemo<FrequencyDataPoint[]>(() => {
        if (isLoading || !progress?.quizAttempts) {
            // Return dummy data structure for loading skeleton
            return getLastNDates(numberOfDays).map(date => ({ date, count: 0 }));
        }

        // 1. Group attempts by date
        const attemptsByDate: Record<string, number> = {};
        progress.quizAttempts.forEach(attempt => {
            try {
                // Extract YYYY-MM-DD from ISO string
                const attemptDateStr = attempt.date.substring(0, 10);
                if (!attemptsByDate[attemptDateStr]) {
                    attemptsByDate[attemptDateStr] = 0;
                }
                attemptsByDate[attemptDateStr]++;
            } catch (e) {
                console.warn("Could not parse date from quiz attempt:", attempt.date);
            }
        });

        // 2. Generate dates for the last N days
        const lastNDays = getLastNDates(numberOfDays);

        // 3. Map dates to counts
        return lastNDays.map(dateStr => ({
            date: dateStr,
            count: attemptsByDate[dateStr] || 0, // Get count or default to 0
        }));

    }, [progress, isLoading, numberOfDays]);

    // Check if there's any activity in the calculated period
    const hasActivity = useMemo(() => {
        return frequencyData.some(d => d.count > 0);
    }, [frequencyData]);

    // --- Loading State ---
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Practice Frequency (Last 30 Days)</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-60 flex items-center justify-center"> {/* Adjusted height */}
                    <Skeleton className="h-full w-full rounded-md" />
                </CardContent>
            </Card>
        );
    }

    // --- Empty/No Activity State ---
    if (!hasActivity) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Practice Frequency (Last 30 Days)</CardTitle>
                    <CardDescription>Track your daily quiz activity.</CardDescription>
                </CardHeader>
                <CardContent className="h-60 flex items-center justify-center text-gray-500 text-sm">
                    No quiz attempts recorded in the last 30 days. Stay consistent!
                </CardContent>
            </Card>
        );
    }

    // --- Chart Rendering ---
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Practice Frequency (Last 30 Days)</CardTitle>
                <CardDescription>
                    Number of quizzes attempted each day recently.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-60"> {/* Adjusted height */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={frequencyData}
                            margin={{
                                top: 5,
                                right: 5, // Reduced right margin
                                left: 5,  // Reduced left margin
                                bottom: 20, // Keep bottom margin for label
                            }}
                            barGap={2} // Small gap between bars
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDateTick}
                                tick={{ fontSize: 10 }} // Smaller font size
                                interval="preserveStartEnd" // Show first and last ticks
                                // Optionally show fewer ticks if too crowded:
                                // tickCount={7} // Example: show ~7 ticks
                                // Or dynamic interval: interval={Math.floor(frequencyData.length / 7)}
                                label={{ value: 'Date', position: 'insideBottom', offset: -10, fontSize: 11 }}
                            />
                            <YAxis
                                dataKey="count"
                                allowDecimals={false}
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Attempts', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                                width={40} // Adjusted width
                            />
                            <Tooltip
                                formatter={(value: number, name: string, props: any) => {
                                    // Format date for tooltip label for clarity
                                    const dateLabel = new Date(props.payload.date + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                                    return [value, 'Attempts']; // Show count and label
                                }}
                                labelFormatter={(label: string) => {
                                    const dateLabel = new Date(label + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                                    return dateLabel;
                                }}
                                contentStyle={{ fontSize: '12px' }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#3b82f6" // Blue color
                                radius={[2, 2, 0, 0]} // Slightly rounded top
                                isAnimationActive={true}
                                animationDuration={500}
                            >
                                {/* Optional: Add Cells if you want color based on count */}
                                {/* {
                                    frequencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : '#e5e7eb'} /> // Example: Gray for 0
                                    ))
                                } */}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PracticeFrequencyChart;