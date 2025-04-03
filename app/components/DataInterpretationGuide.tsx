// app/components/DataInterpretationGuide.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import {
    BarChartHorizontalBig,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    ScatterChart as ScatterChartIcon,
    AlertTriangle,
    CalendarDays,
    Clock,
    TrendingUp,
    Info,
    Target,
    List,
    HelpCircle,
    BarChart2
} from 'lucide-react';

// Helper Component for consistent section cards
interface GuideSectionCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const GuideSectionCard: React.FC<GuideSectionCardProps> = ({ icon, title, children }) => {
    const iconClass = "h-5 w-5 text-blue-600 flex-shrink-0";

    const contentClass = "text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed px-4 py-4";

    const renderIconWithClass = () => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: iconClass
            });
        }
        return icon;
    };

    return (
        <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row gap-3 space-y-0 bg-gray-50/50 dark:bg-gray-900/30 px-4 py-2 border-b">
                {renderIconWithClass()}
                <div className="flex items-center">
                    <CardTitle className="text-base font-semibold leading-none">
                        {title}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className={contentClass}>
                {children}
            </CardContent>
        </Card>
    );
};


const DataInterpretationGuide: React.FC = () => {
    const listDiscClass = "list-disc space-y-1.5 pl-5";

    return (
        <div className="space-y-6">
            <Card className="border shadow-sm">
                <CardHeader className="px-4 py-4">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="h-6 w-6 text-blue-700" />
                        <div>
                            <CardTitle className="text-lg font-semibold leading-tight">
                                Understanding Your Dashboard
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                                Learn how to interpret the charts and metrics to guide your study efforts effectively.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <GuideSectionCard icon={<Info />} title="Overall Metrics (Attempts, Questions, Accuracy)">
                <p><strong>What it shows:</strong> A high-level summary of your total activity.</p>
                <ul className={listDiscClass}>
                    <li><strong>Review Attempts:</strong> Total number of quiz sessions started.</li>
                    <li><strong>Questions Answered:</strong> Total individual questions seen across all attempts.</li>
                    <li><strong>Overall Accuracy:</strong> Your average score (%) across all questions answered.</li>
                </ul>
                <p><strong>Interpretation:</strong> Monitor accuracy; aim for steady improvement or stabilization above 80%. Use attempt counts to gauge practice volume.</p>
                <p><strong>Action:</strong> Low accuracy? Revisit fundamentals. Low attempts? Increase practice frequency.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<List />} title="Recent Activity List">
                <p><strong>What it shows:</strong> Your latest quiz attempts with category and score.</p>
                <p><strong>Interpretation:</strong> Provides a quick glance at immediate performance. Useful for seeing results right after a session.</p>
                <p><strong>Action:</strong> If you notice a recent low score, consider reviewing that category's challenging questions or retaking a quiz soon.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<CalendarDays />} title="Practice Frequency Chart (Last 30 Days)">
                <p><strong>What it shows:</strong> A bar chart of daily quiz attempts over the past month.</p>
                <p><strong>Interpretation:</strong> Visualizes your study consistency. Consistent bars indicate regular practice; gaps show periods of inactivity.</p>
                <p><strong>Action:</strong> Aim for regular, spaced practice. Use this to maintain momentum and avoid cramming.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<BarChart2 />} title="Category Performance (Overview Bar Chart)">
                <p><strong>What it shows:</strong> Compares your average score (%) across different NQESH domains.</p>
                <p><strong>Interpretation:</strong> Easily spot your strongest and weakest categories by comparing bar heights.</p>
                <p><strong>Action:</strong> Prioritize studying the categories with the lowest scores. Use this as a starting point.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<PieChartIcon />} title="Domain Performance Breakdown (Categories Tab)">
                <p><strong>What it shows:</strong> Both the proportion of questions attempted per category (Pie Chart) and the specific average score/attempt count for each (Category Details List).</p>
                <p><strong>Interpretation:</strong> The pie chart reveals practice balance. The list provides precise performance numbers.</p>
                <p><strong>Action:</strong> Ensure sufficient practice volume in weaker areas. Balance practice if the pie chart shows neglect of important categories.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<LineChartIcon />} title="Category Performance Trend (Per Category)">
                <p><strong>What it shows:</strong> Line chart tracking score (%) over consecutive attempts within a *single selected category*.</p>
                <p><strong>Interpretation:</strong> An upward slope indicates learning. Flat or downward slopes suggest stagnation.</p>
                <p><strong>Action:</strong> For flat/downward trends, intensify study in that category. Review mistakes and core concepts.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<BarChartHorizontalBig />} title="First Attempt vs. Overall Performance">
                <p><strong>What it shows:</strong> Compares your first score (%) vs. your average score (%) for each category.</p>
                <p><strong>Interpretation:</strong> A higher average shows learning from practice. Small gaps might mean ineffective repetition.</p>
                <p><strong>Action:</strong> If improvement is minimal, analyze *why* you're repeating mistakes, don't just retake quizzes.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<AlertTriangle />} title="Most Challenging Questions Table">
                <p><strong>What it shows:</strong> Specific questions you miss most often, ranked by error rate/frequency.</p>
                <p><strong>Interpretation:</strong> Pinpoints precise knowledge gaps or misunderstandings.</p>
                <p><strong>Action:</strong> Highest priority for review! Study these questions and explanations thoroughly.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<Target />} title="Quiz Score Distribution">
                <p><strong>What it shows:</strong> Histogram grouping quiz scores into percentage brackets.</p>
                <p><strong>Interpretation:</strong> Shows the overall spread of your performance. Where do most scores land?</p>
                <p><strong>Action:</strong> Aim to shift the distribution higher (80%+). If clustered low, identify weak categories.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<Clock />} title="Time Spent Distribution (Per Quiz)">
                <p><strong>What it shows:</strong> Histogram showing how many quizzes are completed within certain total time ranges.</p>
                <p><strong>Interpretation:</strong> Reveals your typical pace for completing a full quiz session.</p>
                <p><strong>Action:</strong> Correlate with score data. Identify if your pacing is generally effective or needs adjustment.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<ScatterChartIcon />} title="Quiz Score vs. Total Time Spent">
                <p><strong>What it shows:</strong> Scatter plot correlating total quiz time (X) with final score % (Y).</p>
                <p><strong>Interpretation:</strong> Look for trends (upward, downward, none). Are there outliers?</p>
                <p><strong>Action:</strong> Adjust pacing. If short times = low scores, slow down. If long times = low scores, find efficiency blocks.</p>
            </GuideSectionCard>

            <GuideSectionCard icon={<ScatterChartIcon />} title="Accuracy vs. Time (Per Question)">
                <p><strong>What it shows:</strong> Scatter plot of time spent vs. correctness for *individual questions*.</p>
                <p><strong>Interpretation:</strong> Are errors typically quick (careless) or slow (difficult)?</p>
                <p><strong>Action:</strong> If errors are quick, focus on careful reading. If slow, focus on understanding concepts.</p>
            </GuideSectionCard>

        </div>
    );
};

export default DataInterpretationGuide;