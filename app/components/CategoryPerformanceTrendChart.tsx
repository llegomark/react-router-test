// app/components/CategoryPerformanceTrendChart.tsx
import React, { useState, useMemo, useEffect } from 'react'; // Import useEffect
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Skeleton } from '~/components/ui/skeleton';
import { useProgressData } from '~/lib/dashboard-queries';
import { useCategories } from '~/data/quizApi';

// Interfaces (TrendDataPoint, TrendChartRenderer props) remain the same
interface TrendDataPoint {
    attemptNumber: number;
    score: number; // Percentage score
    date: string;
}
interface TrendChartRendererProps {
    chartData: TrendDataPoint[] | null;
    isLoading: boolean;
    categorySelected: boolean;
    categoryName?: string; // Optional: Pass category name for context
}


// TrendChartRenderer component remains the same
const TrendChartRenderer: React.FC<TrendChartRendererProps> = ({ chartData, isLoading, categorySelected, categoryName }) => {

    if (isLoading && !categorySelected) { // Show skeleton while initial category loads
        return (
            <div className="h-72 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-md" />
            </div>
        );
    }

    if (!categorySelected) {
        return (
            <div className="h-72 flex items-center justify-center text-gray-500 text-sm">
                Please select a category above to view the trend.
            </div>
        );
    }

    if (isLoading) { // Show skeleton if category is selected but data is still loading (unlikely with current setup, but good practice)
        return (
            <div className="h-72 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-md" />
            </div>
        );
    }


    if (!chartData || chartData.length < 2) {
        return (
            <div className="h-72 flex items-center justify-center text-gray-500 text-sm px-4 text-center">
                Not enough data (at least 2 attempts needed) for
                {categoryName ? <span className="font-medium"> {categoryName} </span> : " this category "}
                to show a trend.
            </div>
        );
    }

    // Chart rendering logic remains the same
    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="attemptNumber"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fontSize: 11 }}
                        label={{ value: 'Attempt Number', position: 'insideBottom', offset: -10, fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        label={{ value: 'Score %', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11 }}
                        width={50}
                    />
                    <Tooltip
                        formatter={(value: number, name: string, props: any) => {
                            return [`${value}%`, `Attempt ${props.payload.attemptNumber}`];
                        }}
                        labelFormatter={(label: number) => `Attempt ${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        name="Score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        dot={{ r: 3 }}
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


const CategoryPerformanceTrendChart: React.FC = () => {
    // Initialize state with empty string
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const { data: progress, isLoading: progressLoading } = useProgressData();
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    const isLoading = progressLoading || categoriesLoading;

    // --- Auto-select first category ---
    useEffect(() => {
        // Run only if categories are loaded, available, and NO category is currently selected
        if (categories && categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id); // Select the ID of the first category
        }
        // Dependencies: run when categories load or if selectedCategoryId changes (e.g., gets cleared)
    }, [categories, selectedCategoryId, setSelectedCategoryId]);
    // --- End auto-select ---


    // categoryTrendData calculation remains the same
    const categoryTrendData = useMemo<TrendDataPoint[] | null>(() => {
        if (isLoading || !progress?.quizAttempts || !selectedCategoryId) {
            // Return null if still loading OR no category is selected yet
            return null;
        }
        const categoryAttempts = progress.quizAttempts
            .filter(attempt =>
                attempt.categoryId === selectedCategoryId &&
                attempt.totalQuestions > 0 &&
                typeof attempt.score === 'number' && !isNaN(attempt.score)
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return categoryAttempts.map((attempt, index) => ({
            attemptNumber: index + 1,
            score: Math.round((attempt.score / attempt.totalQuestions) * 100),
            date: attempt.date,
        }));
    }, [progress, selectedCategoryId, isLoading]); // Added isLoading dependency


    const handleCategoryChange = (value: string) => {
        setSelectedCategoryId(value);
    };

    // Find the name of the currently selected category for the renderer
    const selectedCategoryName = useMemo(() => {
        return categories?.find(cat => cat.id === selectedCategoryId)?.name;
    }, [categories, selectedCategoryId]);


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-base mb-1">Category Performance Trend</CardTitle>
                        <CardDescription>
                            Track your score improvement over time for a specific category.
                        </CardDescription>
                    </div>
                    {/* Conditionally render skeleton OR select based on categoriesLoading */}
                    {categoriesLoading ? (
                        <Skeleton className="h-9 w-full sm:w-48" />
                    ) : (
                        <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full sm:w-48 h-9">
                                {/* Display placeholder only if NO category is selected */}
                                <SelectValue placeholder={!selectedCategoryId ? "Select Category..." : undefined} />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Ensure categories is not undefined before mapping */}
                                {(categories ?? []).map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <TrendChartRenderer
                    chartData={categoryTrendData}
                    // Pass combined loading state OR just progressLoading if you only want chart loading state
                    isLoading={progressLoading}
                    categorySelected={!!selectedCategoryId}
                    categoryName={selectedCategoryName} // Pass name
                />
            </CardContent>
        </Card>
    );
};

export default CategoryPerformanceTrendChart;