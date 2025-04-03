// app/components/MostChallengingQuestionsTable.tsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { Skeleton } from '~/components/ui/skeleton';
import { useProgressData } from '~/lib/dashboard-queries';
import { questions as allQuestionsData } from '~/data/questions';

// Interface remains the same
interface QuestionPerformance {
    questionId: string;
    questionText: string;
    totalAttempts: number;
    incorrectAttempts: number;
    incorrectRate: number; // Percentage
}

const MAX_QUESTIONS_TO_SHOW = 10;
const TRUNCATE_LENGTH = 100; // Keep truncation

// truncateText helper remains the same
const truncateText = (text: string, length: number): string => {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
};

// --- Updated TableRenderer ---
const TableRenderer: React.FC<{ performanceData: QuestionPerformance[] | null; isLoading: boolean }> = ({ performanceData, isLoading }) => {
    // Common cell styling
    const headCellStyle = "h-12 px-6 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0"; // Removed text-muted-foreground, added h-12
    const bodyCellStyle = "px-6 py-4 align-middle [&:has([role=checkbox])]:pr-0"; // Increased py-4

    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={`${headCellStyle} w-[60%]`}>Question</TableHead>
                        <TableHead className={`${headCellStyle} w-[12%] text-right`}>Incorrect</TableHead>
                        <TableHead className={`${headCellStyle} w-[12%] text-right`}>Total</TableHead>
                        <TableHead className={`${headCellStyle} w-[16%] text-right`}>Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className={`${bodyCellStyle}`}><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell className={`${bodyCellStyle} text-right`}><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                            <TableCell className={`${bodyCellStyle} text-right`}><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                            <TableCell className={`${bodyCellStyle} text-right`}><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    if (!performanceData || performanceData.length === 0) {
        return (
            <div className="text-center text-gray-500 py-16 px-6 text-sm"> {/* Added more padding */}
                Answer more questions to identify challenging areas.
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="w-full overflow-x-auto"> {/* Ensure horizontal scroll on small screens if needed */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={`${headCellStyle} w-[60%]`}>Question</TableHead>
                            <TableHead className={`${headCellStyle} w-[12%] text-right`}>Incorrect</TableHead>
                            <TableHead className={`${headCellStyle} w-[12%] text-right`}>Total</TableHead>
                            <TableHead className={`${headCellStyle} w-[16%] text-right`}>Incorrect Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {performanceData.map((q) => (
                            <TableRow key={q.questionId} className="hover:bg-muted/50"> {/* Ensure hover state */}
                                <TableCell className={`${bodyCellStyle} font-medium`}>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            {/* Using div for better layout control with line-clamp */}
                                            <div className="cursor-help line-clamp-2 leading-snug">
                                                {truncateText(q.questionText, TRUNCATE_LENGTH)}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start" className="max-w-md text-balance">
                                            <p className="text-xs">{q.questionText}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className={`${bodyCellStyle} text-right`}>{q.incorrectAttempts}</TableCell>
                                <TableCell className={`${bodyCellStyle} text-right`}>{q.totalAttempts}</TableCell>
                                <TableCell className={`${bodyCellStyle} text-right text-red-600 font-medium`}>
                                    {q.incorrectRate.toFixed(0)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
};


const MostChallengingQuestionsTable: React.FC = () => {
    const { data: progress, isLoading } = useProgressData();

    // useMemo calculation logic remains the same
    const topChallengingQuestions = useMemo<QuestionPerformance[] | null>(() => {
        if (!progress?.questionAttempts || progress.questionAttempts.length === 0) {
            return null;
        }
        const attemptsByQuestion: Record<string, { total: number; incorrect: number }> = {};
        progress.questionAttempts.forEach(attempt => {
            if (!attemptsByQuestion[attempt.questionId]) {
                attemptsByQuestion[attempt.questionId] = { total: 0, incorrect: 0 };
            }
            attemptsByQuestion[attempt.questionId].total++;
            if (!attempt.isCorrect) {
                attemptsByQuestion[attempt.questionId].incorrect++;
            }
        });
        const performanceList = Object.entries(attemptsByQuestion)
            .map(([questionId, counts]) => {
                const questionData = allQuestionsData.find(q => q.id === questionId);
                if (!questionData) return null;
                return {
                    questionId: questionId,
                    questionText: questionData.question,
                    totalAttempts: counts.total,
                    incorrectAttempts: counts.incorrect,
                    incorrectRate: counts.total > 0 ? (counts.incorrect / counts.total) * 100 : 0,
                };
            })
            .filter((item): item is QuestionPerformance => item !== null && item.incorrectAttempts > 0);
        performanceList.sort((a, b) => {
            if (b.incorrectRate !== a.incorrectRate) {
                return b.incorrectRate - a.incorrectRate;
            }
            return b.incorrectAttempts - a.incorrectAttempts;
        });
        return performanceList.slice(0, MAX_QUESTIONS_TO_SHOW);
    }, [progress]);

    return (
        <Card> {/* Card padding will apply */}
            <CardHeader> {/* Default px-6 py-6 */}
                <CardTitle className="text-base">Most Challenging Questions</CardTitle>
                <CardDescription>
                    Questions you've answered incorrectly most often. Focus your review here.
                </CardDescription>
            </CardHeader>
            {/* Use default CardContent padding (px-6) but remove top padding */}
            <CardContent className="pt-0">
                <TableRenderer
                    performanceData={topChallengingQuestions}
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
};

export default MostChallengingQuestionsTable;