// app/routes/quiz.tsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Form, redirect, useNavigation, Link } from "react-router";
import type { Route } from "./+types/quiz";
import {
    getQuestionsByCategory,
    prefetchQuestionsByCategory,
    useQuestionsByCategory
} from "../data/quizApi";
import { getQueryClient } from "../lib/query-client";
import { Timer } from "../components/Timer";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
    startQuizAttempt,
    resetProgressCache,
    debugLocalStorage
} from "../services/progressStorage";
import { useRecordQuestionAttempt } from "../lib/quiz-mutations";

export function HydrateFallback() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-xs gap-1 text-blue-600">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <Skeleton className="h-4 w-24" />
                </div>

                <Skeleton className="h-6 w-32" />
            </div>

            <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
            </div>

            <div className="mb-4 w-full">
                <Skeleton className="h-6 w-full mb-1.5" />
                <Skeleton className="h-1.5 w-full" />
            </div>

            <Card className="mb-4">
                <CardHeader className="p-4 pb-2 border-b">
                    <Skeleton className="h-16 w-full" />
                </CardHeader>

                <CardContent className="p-4">
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="flex items-center rounded-md p-3 border border-gray-200">
                                <Skeleton className="h-4 w-4 rounded-full mr-2" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="px-4 py-3 flex justify-between items-center border-t text-xs text-gray-600">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                </CardFooter>
            </Card>
        </div>
    );
}

export async function loader({ params }: Route.LoaderArgs) {
    const { categoryId } = params;
    if (!categoryId) throw new Response("Category ID is required", { status: 400 });

    // Fetch questions with React Router first
    const questions = await getQuestionsByCategory(categoryId);
    if (questions.length === 0) {
        throw new Response("No questions found for this category", { status: 404 });
    }

    // Then prefetch for TanStack Query
    const queryClient = getQueryClient();
    await prefetchQuestionsByCategory(queryClient, categoryId);

    return {
        questions,
        categoryId
    };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const currentQuestionIndex = Number(formData.get("currentQuestionIndex"));
    const currentScore = Number(formData.get("currentScore") || 0);
    const isCorrect = formData.get("isCorrect") === "true";
    const isTimeUp = formData.get("isTimeUp") === "true";
    const quizAttemptId = formData.get("quizAttemptId") as string;

    if (!quizAttemptId) {
        // If we don't have an attempt ID, something went wrong
        console.error("Missing quiz attempt ID in form submission");
        return redirect(`/quiz/${categoryId}`);
    }
    // Calculate the new score
    const newScore = isTimeUp ? currentScore : (isCorrect ? currentScore + 1 : currentScore);

    // Debug localStorage in the action handler
    debugLocalStorage();

    // If this was the last question, redirect to results
    const totalQuestions = Number(formData.get("totalQuestions"));
    if (currentQuestionIndex >= totalQuestions - 1) {
        // Finalize the quiz attempt
        const attemptId = formData.get("quizAttemptId") as string;
        if (attemptId) {
            // Finalize the quiz attempt
            return redirect(`/results?score=${newScore}&total=${totalQuestions}&category=${categoryId}&attempt=${attemptId}`);
        } else {
            console.error("Missing quiz attempt ID in form submission");
            return redirect(`/quiz/${categoryId}`);
        }
    }

    // Otherwise, go to the next question
    return redirect(`/quiz/${categoryId}?q=${currentQuestionIndex + 1}&score=${newScore}&attempt=${quizAttemptId}`);
}

export default function Quiz({ loaderData }: Route.ComponentProps) {
    // ALL hooks must be at the top level, before any conditional returns
    const [searchParams] = useSearchParams();
    const navigation = useNavigation();
    const hasInitialized = useRef(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
    const [attemptId, setAttemptId] = useState<string>('');
    const [startTime, setStartTime] = useState<number>(Date.now());
    const isLoading = navigation.state === "loading";

    // Extract data safely - even if loaderData is null
    const categoryId = loaderData?.categoryId || '';
    const initialQuestions = loaderData?.questions || [];

    // Move ALL hooks to the top, before any conditional returns
    const { data: questions = initialQuestions, error } = useQuestionsByCategory(categoryId);

    const currentQuestionIndexParam = searchParams.get('q');
    const currentQuestionIndex = currentQuestionIndexParam ? parseInt(currentQuestionIndexParam, 10) : 0;
    const currentScore = parseInt(searchParams.get('score') || '0', 10);
    const urlAttemptId = searchParams.get('attempt') || '';

    // Reset the progress cache when loading the quiz component
    useEffect(() => {
        if (typeof window !== 'undefined') {
            resetProgressCache();
            console.log("Reset progress cache for fresh data");
        }
    }, []);

    // Update attemptId from URL if needed
    useEffect(() => {
        if (urlAttemptId && urlAttemptId !== attemptId) {
            setAttemptId(urlAttemptId);
        }
    }, [urlAttemptId, attemptId]);

    // Initialize quiz attempt when component loads
    useEffect(() => {
        const initQuiz = async () => {
            // Only run once
            if (hasInitialized.current || !categoryId) return;

            const effectiveAttemptId = urlAttemptId || '';
            console.log("Quiz initialization with urlAttemptId:", effectiveAttemptId);

            // Either reuse the existing ID or create a new one
            const attempt = startQuizAttempt(categoryId, effectiveAttemptId);
            console.log("Initialized quiz with attempt:", attempt.id);

            hasInitialized.current = true;
            setAttemptId(attempt.id);

            // If the ID from the URL doesn't match the one we got, update the URL
            if (attempt.id !== effectiveAttemptId) {
                const newUrl = `/quiz/${categoryId}?q=${currentQuestionIndex}&score=${currentScore}&attempt=${attempt.id}`;
                console.log("Updating URL to include correct attempt ID:", newUrl);
                window.history.replaceState(null, '', newUrl);
            }
        };

        initQuiz();
    }, [categoryId, currentQuestionIndex, urlAttemptId, currentScore]);

    // Get current question safely
    const currentQuestion = questions && questions.length > currentQuestionIndex
        ? questions[currentQuestionIndex]
        : null;

    // Start timing when question is displayed
    useEffect(() => {
        if (currentQuestion) {
            setStartTime(Date.now());
        }
    }, [currentQuestionIndex, currentQuestion]);

    // Reset state when the question changes
    useEffect(() => {
        setSelectedOption(null);
        setIsTimeUp(false);
    }, [currentQuestionIndex, currentQuestion]);

    // Ensure we save data if navigating away (component unmounting)
    useEffect(() => {
        return () => {
            // Don't do anything if initialization hasn't happened
            if (!hasInitialized.current || !attemptId) return;

            console.log("Quiz component unmounting, saving attempt:", attemptId);
        };
    }, [attemptId]);

    const { mutate: recordQuestionAttemptMutation } = useRecordQuestionAttempt();

    // Handle time up
    const handleTimeUp = () => {
        setIsTimeUp(true);

        // Record the timeout (using -1 as the selectedOption for timeouts)
        if (attemptId && currentQuestion) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            recordQuestionAttemptMutation({
                quizAttemptId: attemptId,
                questionId: currentQuestion.id,
                categoryId: categoryId,
                selectedOption: -1, // Use -1 to indicate timeout
                correctOption: currentQuestion.correctOptionIndex,
                timeSpent: timeSpent
            });
        }
    };

    // Record answer function
    const recordAnswer = (option: number) => {
        if (!isAnswered && attemptId && currentQuestion) {
            // Calculate time spent on this question
            const timeSpent = Math.round((Date.now() - startTime) / 1000);

            recordQuestionAttemptMutation({
                quizAttemptId: attemptId,
                questionId: currentQuestion.id,
                categoryId: categoryId,
                selectedOption: option,
                correctOption: currentQuestion.correctOptionIndex,
                timeSpent: timeSpent
            });

            setSelectedOption(option);
        }
    };

    // Define isAnswered here to ensure it's available for recordAnswer
    const isAnswered = selectedOption !== null || isTimeUp;
    // Only define isCorrect if we have a current question and an answer
    const isCorrect = currentQuestion && selectedOption === currentQuestion.correctOptionIndex;

    // NOW we can have conditional returns
    if (isLoading || !loaderData) {
        return <HydrateFallback />;
    }

    // Check for invalid questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="p-4 bg-red-50 rounded-md">
                    <h2 className="text-red-700 font-medium">No questions available</h2>
                    <p className="text-sm mt-2">Please try another category or check back later.</p>
                    <Link
                        to="/"
                        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                        Back to Categories
                    </Link>
                </div>
            </div>
        );
    }

    // Check if we have a valid current question
    if (!currentQuestion) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="p-4 bg-yellow-50 rounded-md">
                    <h2 className="text-yellow-700 font-medium">Question not found</h2>
                    <p className="text-sm mt-2">The requested question could not be found.</p>
                    <Link
                        to={`/quiz/${categoryId}`}
                        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                        Start from beginning
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
                <Link
                    to="/"
                    className="flex items-center text-xs gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to Categories
                </Link>

                <Badge variant="outline" className="text-xs font-normal px-2 py-1">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
            </div>

            <div className="flex justify-between items-center mb-2">
                <h1 className="text-sm font-medium">NQESH Practice Quiz</h1>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    Score: {currentScore}/{currentQuestionIndex}
                </Badge>
            </div>

            {!isAnswered && (
                <Timer duration={120} onTimeUp={handleTimeUp} />
            )}

            <Card className="mb-4">
                <CardHeader className="p-4 pb-2 border-b">
                    <div className="text-sm font-medium leading-5">{currentQuestion.question}</div>
                </CardHeader>

                <CardContent className="p-4">
                    <Form method="post">
                        <input type="hidden" name="questionId" value={currentQuestion.id} />
                        <input type="hidden" name="categoryId" value={categoryId} />
                        <input type="hidden" name="currentQuestionIndex" value={currentQuestionIndex} />
                        <input type="hidden" name="totalQuestions" value={questions.length} />
                        <input type="hidden" name="currentScore" value={currentScore} />
                        <input type="hidden" name="isCorrect" value={isCorrect ? "true" : "false"} />
                        <input type="hidden" name="isTimeUp" value={isTimeUp.toString()} />
                        <input type="hidden" name="selectedOption" value={selectedOption !== null ? selectedOption : ''} />
                        <input type="hidden" name="quizAttemptId" value={attemptId} />

                        <RadioGroup
                            value={selectedOption !== null ? selectedOption.toString() : ""}
                            onValueChange={(value) => !isAnswered && recordAnswer(Number(value))}
                            className="space-y-2"
                        >
                            {currentQuestion.options.map((option: string, index: number) => {
                                let itemClassName = "border border-gray-200 hover:border-blue-300 cursor-pointer";

                                if (isAnswered) {
                                    if (index === currentQuestion.correctOptionIndex) {
                                        itemClassName = "border-2 border-green-500 bg-green-50 cursor-default";
                                    } else if (index === selectedOption) {
                                        itemClassName = "border-2 border-red-500 bg-red-50 cursor-default";
                                    } else {
                                        itemClassName = "opacity-70 cursor-default";
                                    }
                                }

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center rounded-md p-3 ${itemClassName}`}
                                    >
                                        <RadioGroupItem
                                            value={index.toString()}
                                            id={`option-${index}`}
                                            disabled={isAnswered}
                                            className="border-gray-400 cursor-pointer"
                                        />
                                        <Label htmlFor={`option-${index}`} className="flex-1 pl-2 text-sm cursor-pointer">
                                            {option}
                                        </Label>

                                        {isAnswered && index === currentQuestion.correctOptionIndex && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 ml-1 flex-shrink-0" />
                                        )}

                                        {isAnswered && index === selectedOption && selectedOption !== currentQuestion.correctOptionIndex && (
                                            <XCircle className="h-4 w-4 text-red-500 ml-1 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </RadioGroup>

                        {isAnswered && (
                            <>
                                <Separator className="my-4" />

                                <div className={`rounded-md p-4 mb-4 ${isTimeUp ? "bg-red-50 border border-red-200" :
                                    (isCorrect ? "bg-green-50 border border-green-200" :
                                        "bg-red-50 border border-red-200")
                                    }`}>
                                    <div className="flex gap-2">
                                        {isTimeUp ? (
                                            <Clock className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        ) : isCorrect ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <div className="font-medium mb-1 text-sm">
                                                {isTimeUp ? "Time's up!" : isCorrect ? "Correct!" : "Incorrect!"}
                                            </div>
                                            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                                                {currentQuestion.explanation}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm cursor-pointer"
                                    disabled={navigation.state === "submitting"}
                                >
                                    {navigation.state === "submitting" ? (
                                        "Loading..."
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span>Next Question</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>

                {!isAnswered && (
                    <CardFooter className="px-4 py-3 flex justify-between items-center border-t text-xs text-gray-600">
                        <div>Click an option to answer</div>
                        <div>2 minutes per question</div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
