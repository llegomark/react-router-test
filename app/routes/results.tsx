// app/routes/results.tsx
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/results";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { CheckCircle2, BookOpen, ChevronLeft, RefreshCw, BarChart } from "lucide-react";
import { getProgress, debugLocalStorage } from "../services/progressStorage";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    // Debug localStorage in the loader
    debugLocalStorage();

    // Get any additional stats we might want to display based on the quiz attempt
    const url = new URL(request.url);
    const attemptId = url.searchParams.get('attempt');

    if (attemptId) {
        const progress = getProgress();

        // Find this specific attempt
        const attempt = progress.quizAttempts.find(a => a.id === attemptId);
        console.log("Found attempt:", attempt);

        // Get questions for this attempt
        const attemptQuestions = attempt
            ? progress.questionAttempts.filter(q => q.quizAttemptId === attemptId)
            : [];
        console.log("Found questions for attempt:", attemptQuestions.length);

        // Calculate average time per question
        const avgTimePerQuestion = attemptQuestions.length > 0
            ? Math.round(attemptQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / attemptQuestions.length)
            : 0;

        // Calculate fastest and slowest question times
        const fastestQuestion = attemptQuestions.length > 0
            ? Math.min(...attemptQuestions.map(q => q.timeSpent))
            : 0;

        const slowestQuestion = attemptQuestions.length > 0
            ? Math.max(...attemptQuestions.map(q => q.timeSpent))
            : 0;

        return {
            attempt,
            avgTimePerQuestion,
            fastestQuestion,
            slowestQuestion,
            totalQuestions: attemptQuestions.length
        };
    }

    return {
        attempt: null,
        avgTimePerQuestion: 0,
        fastestQuestion: 0,
        slowestQuestion: 0,
        totalQuestions: 0
    };
}

export default function Results({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();

    // Debug localStorage when component mounts
    useEffect(() => {
        console.log("Results component mounted");
        debugLocalStorage();
    }, []);

    const score = parseInt(searchParams.get('score') || '0', 10);
    const total = parseInt(searchParams.get('total') || '0', 10);
    const categoryId = searchParams.get('category') || '';
    const attemptId = searchParams.get('attempt') || '';

    const percentage = Math.round((score / total) * 100);

    let message = "Excellent Performance!";
    let subMessage = "You demonstrate strong competency in this domain.";
    let progressColor = "bg-green-500";
    let icon = <CheckCircle2 className="h-6 w-6 text-green-500" />;

    if (percentage < 50) {
        message = "Needs Improvement";
        subMessage = "Review this domain more thoroughly before the exam.";
        progressColor = "bg-red-500";
        icon = <BookOpen className="h-6 w-6 text-red-500" />;
    } else if (percentage < 80) {
        message = "Good Progress";
        subMessage = "Continue practicing to strengthen your understanding.";
        progressColor = "bg-blue-500";
        icon = <CheckCircle2 className="h-6 w-6 text-blue-500" />;
    }

    // Additional stats from clientLoader
    const avgTimePerQuestion = loaderData?.avgTimePerQuestion || 0;
    const fastestQuestion = loaderData?.fastestQuestion || 0;
    const slowestQuestion = loaderData?.slowestQuestion || 0;

    return (
        <div className="max-w-md mx-auto px-4 py-6">
            <Card className="mb-4">
                <CardHeader className="text-center p-4 pb-0">
                    <div className="mx-auto mb-2">{icon}</div>
                    <h2 className="text-base font-medium">Review Results</h2>
                    <p className="text-xs text-gray-600 mt-1">{message}</p>
                </CardHeader>

                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-3 my-2">
                        <div className="text-3xl font-bold text-blue-700">
                            {score}
                        </div>
                        <div className="text-lg text-gray-600">/</div>
                        <div className="text-lg text-gray-600">
                            {total}
                        </div>
                    </div>

                    <div className="flex justify-center text-sm mb-3">
                        <div className="font-medium">
                            {percentage}%
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                        <div className={`h-1.5 rounded-full ${progressColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    <p className="text-xs text-center text-gray-700 mb-3">
                        {subMessage}
                    </p>

                    {/* Time statistics */}
                    {avgTimePerQuestion > 0 && (
                        <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <div className="flex gap-2 items-center mb-2">
                                <BarChart className="h-3.5 w-3.5 text-blue-600" />
                                <div className="font-medium text-xs">Time Performance</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <div className="text-gray-500">Average</div>
                                    <div className="font-medium">{avgTimePerQuestion} sec</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Fastest</div>
                                    <div className="font-medium">{fastestQuestion} sec</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Slowest</div>
                                    <div className="font-medium">{slowestQuestion} sec</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-md p-3 text-xs">
                        <div className="flex gap-2 items-center mb-2">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                            <div className="font-medium">Study Recommendation</div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Focus on understanding the conceptual frameworks behind school management principles, not just memorizing facts.
                            Review DepEd Orders related to this domain.
                        </p>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="p-4 flex flex-col gap-2">
                    <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
                    >
                        <Link to={`/reviewer/${categoryId}`}>
                            <div className="flex items-center gap-1">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Try Again</span>
                            </div>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full h-9 text-sm border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    >
                        <Link to="/">Return to Categories</Link>
                    </Button>

                    {/* Dashboard link */}
                    <Button
                        asChild
                        variant="secondary"
                        className="w-full h-9 text-sm"
                    >
                        <Link to="/dashboard">View Progress Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>

            <div className="text-center text-xs text-gray-600">
                <p>Continue practicing in all domains to prepare comprehensively</p>
            </div>
        </div>
    );
}