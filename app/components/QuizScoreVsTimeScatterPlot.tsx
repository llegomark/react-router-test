// app/components/QuizScoreVsTimeScatterPlot.tsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis, // ZAxis is needed for Scatter plots in recharts
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
} from 'recharts';
import { Skeleton } from '~/components/ui/skeleton';
import { useProgressData } from '~/lib/dashboard-queries';
import { useCategories } from '~/data/quizApi';

// Define interface for chart data points
interface ScatterDataPoint {
    id: string;          // Unique attempt ID
    time: number;        // X-axis: Total time spent in seconds
    score: number;       // Y-axis: Percentage score
    category: string;    // Category ID for grouping/coloring
    categoryName: string;
    date: string;        // For tooltip info
    rawScore: number;
    totalQuestions: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ScatterDataPoint;
    }>;
}

// Helper to format seconds into MM:SS
const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Color mapping (consistent with other charts if possible)
// You might want to centralize this color logic later
const CATEGORY_COLORS: Record<string, string> = {
    'leadership': '#3b82f6',     // Blue
    'management': '#10b981',     // Green
    'instructional': '#f59e0b',  // Amber
    'administrative': '#ef4444', // Red
    'legal': '#8b5cf6',          // Violet
    'default': '#6b7280',        // Gray for unknown
};

const getCategoryColor = (categoryId: string): string => {
    return CATEGORY_COLORS[categoryId] || CATEGORY_COLORS['default'];
}

// Custom Tooltip Component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div className="bg-background p-2 border border-border rounded shadow-sm text-xs">
                <p className="font-medium mb-1 border-b pb-1">{data.categoryName}</p>
                <p>Score: {data.score.toFixed(0)}% ({data.rawScore}/{data.totalQuestions})</p>
                <p>Time: {formatTime(data.time)}</p>
                <p className="text-muted-foreground mt-1">{new Date(data.date).toLocaleDateString()}</p>
            </div>
        );
    }
    return null;
};


const QuizScoreVsTimeScatterPlot: React.FC = () => {
    const { data: progress, isLoading: progressLoading } = useProgressData();
    const { data: categories, isLoading: categoriesLoading } = useCategories(); // Fetch categories for names

    const isLoading = progressLoading || categoriesLoading;

    // Prepare data for the scatter plot
    const scatterData = useMemo<ScatterDataPoint[] | null>(() => {
        if (isLoading || !progress?.quizAttempts || !categories) {
            return null;
        }

        // Create a quick lookup for category names
        const categoryNameMap = categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {} as Record<string, string>);

        // 1. Filter for valid attempts
        const validAttempts = progress.quizAttempts.filter(attempt =>
            attempt.totalQuestions > 0 &&
            typeof attempt.score === 'number' && !isNaN(attempt.score) &&
            typeof attempt.timeSpent === 'number' && !isNaN(attempt.timeSpent)
        );

        // 2. Map to ScatterDataPoint structure
        return validAttempts.map((attempt) => {
            const percentageScore = Math.round((attempt.score / attempt.totalQuestions) * 100);
            return {
                id: attempt.id,
                time: attempt.timeSpent, // Keep in seconds for axis
                score: percentageScore,
                category: attempt.categoryId,
                categoryName: categoryNameMap[attempt.categoryId] || attempt.categoryId,
                date: attempt.date,
                rawScore: attempt.score,
                totalQuestions: attempt.totalQuestions,
            };
        });
    }, [progress, categories, isLoading]);

    // Group data by category for separate Scatter components
    const groupedData = useMemo(() => {
        if (!scatterData) return {};
        return scatterData.reduce((acc, point) => {
            if (!acc[point.category]) {
                acc[point.category] = [];
            }
            acc[point.category].push(point);
            return acc;
        }, {} as Record<string, ScatterDataPoint[]>);
    }, [scatterData]);


    // --- Loading State ---
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quiz Score vs. Total Time</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                </CardContent>
            </Card>
        );
    }

    // --- Empty State ---
    if (!scatterData || scatterData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quiz Score vs. Total Time</CardTitle>
                    <CardDescription>Analyze score correlation with time spent per quiz.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center text-gray-500 text-sm">
                    Complete quizzes to see this analysis.
                </CardContent>
            </Card>
        );
    }

    // --- Chart Rendering ---
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quiz Score vs. Total Time Spent</CardTitle>
                <CardDescription>
                    Each point represents a completed quiz attempt. See if score relates to total time taken.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80"> {/* Increased height */}
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                            margin={{
                                top: 10,
                                right: 30,
                                left: 20,
                                bottom: 30, // Increased margin for label
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="time"
                                name="Total Time"
                                unit="s" // Indicate unit is seconds
                                domain={['dataMin', 'dataMax']} // Adjust domain as needed, e.g., [0, 'dataMax']
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Total Time Spent (seconds)', position: 'insideBottom', offset: -15, fontSize: 11 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="score"
                                name="Score"
                                unit="%"
                                domain={[0, 100]} // Score is 0-100%
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Quiz Score (%)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11 }}
                                width={50} // Adjusted width
                            />
                            {/* ZAxis is required but we don't need to vary size */}
                            <ZAxis type="number" range={[60]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={<CustomTooltip />}
                            />
                            {/* Render a Scatter component for each category */}
                            {Object.entries(groupedData).map(([categoryId, data]) => (
                                <Scatter
                                    key={categoryId}
                                    name={data[0]?.categoryName || categoryId} // Use name from first point
                                    data={data}
                                    fill={getCategoryColor(categoryId)}
                                    shape="circle" // 'circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye'
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuizScoreVsTimeScatterPlot;