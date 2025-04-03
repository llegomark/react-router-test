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
                                Understanding Your Performance Dashboard
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                                This guide explains each section of your dashboard. Use these insights to analyze your strengths, identify weaknesses, track progress, and optimize your NQESH review strategy.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <GuideSectionCard icon={<Info />} title="Overall Metrics Snapshot">
                <p>
                    <strong>What it shows:</strong> This section provides a high-level, cumulative summary of your entire engagement with the review materials. It acts as your primary progress indicator at a glance.
                </p>
                <ul className={listDiscClass}>
                    <li><strong>Review Attempts:</strong> Counts every time you started a quiz or review session. A higher number indicates more practice sessions initiated.</li>
                    <li><strong>Questions Answered:</strong> The total number of individual questions you've encountered and answered across all your attempts. This reflects the breadth of your practice.</li>
                    <li><strong>Overall Accuracy:</strong> Your global average score, calculated as (Total Correct Answers / Total Questions Answered) * 100%. This is a key measure of your current knowledge retention and application across all topics.</li>
                </ul>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li>Monitor your <strong>Overall Accuracy</strong> trend. Is it increasing, decreasing, or plateauing? An upward trend is ideal, showing learning. A plateau might indicate hitting a learning ceiling or needing new strategies. A decrease warrants immediate attention.</li>
                    <li>Use <strong>Review Attempts</strong> and <strong>Questions Answered</strong> to gauge your study volume and consistency. Are you practicing frequently enough and covering a sufficient number of questions?</li>
                    <li>Aim for an accuracy rate comfortably above the passing threshold (often recommended 80-85%+) as you approach the exam date, but expect lower scores initially.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Low Accuracy (&lt;70%):</strong> Your foundational knowledge might be weak. Revisit core concepts, textbooks, or learning modules before focusing heavily on practice questions.</li>
                    <li><strong>Stagnant Accuracy:</strong> Analyze deeper metrics (like Category Performance) to pinpoint specific weak areas. Change your study methods – try different resources, active recall, or concept mapping.</li>
                    <li><strong>Low Attempts/Questions:</strong> Increase your practice frequency. Schedule regular, shorter study sessions rather than infrequent marathon sessions.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<List />} title="Recent Activity Log">
                <p>
                    <strong>What it shows:</strong> A chronological list of your most recent quiz attempts, typically displaying the date, the category/domain covered, and the score achieved for that specific session.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li>Provides immediate feedback on your performance right after completing a session.</li>
                    <li>Allows you to quickly spot patterns in your very recent performance. Did you have a sudden dip or improvement in a specific area?</li>
                    <li>Useful for recalling what you just practiced and how well you did without needing to dig through overall statistics.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Unexpected Low Score:</strong> If a recent score is surprisingly low, immediately review the questions you missed in that session while the context is fresh. Was it a careless mistake, a misunderstood concept, or a genuinely difficult topic?</li>
                    <li><strong>Consistent Low Scores in One Category:</strong> If multiple recent attempts in the same category show low scores, this confirms it as a high-priority area for focused review.</li>
                    <li><strong>Use for Quick Review Loops:</strong> Take a quiz, check the score here, review mistakes, study the weak concepts, and then retake a related quiz soon after to check for improvement.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<CalendarDays />} title="Practice Frequency Calendar (Last 30 Days)">
                <p>
                    <strong>What it shows:</strong> A visual representation (often a bar chart or heatmap) indicating the days you engaged in practice sessions over the past month. The height of the bar or intensity of the color usually corresponds to the number of attempts or questions answered on that day.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Consistency is Key:</strong> Look for regular activity. Consistent, spaced practice (e.g., studying most days, even for short periods) is far more effective for long-term retention than cramming.</li>
                    <li><strong>Identify Gaps:</strong> Long stretches with no activity highlight periods where your study momentum might have dropped.</li>
                    <li><strong>Visualize Study Habits:</strong> Do you study more on weekdays or weekends? Are there specific days you consistently miss? This helps understand your actual study patterns versus your intended ones.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Establish a Routine:</strong> If the chart shows inconsistent practice, try scheduling dedicated study times. Aim for realistic, sustainable goals (e.g., 30-60 minutes daily) rather than overly ambitious ones.</li>
                    <li><strong>Maintain Momentum:</strong> Use the visual feedback to motivate yourself to fill in the gaps and maintain a consistent study streak.</li>
                    <li><strong>Avoid Burnout:</strong> If you see excessively high activity every single day, ensure you're also scheduling rest days to prevent burnout. Balance is important.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<BarChart2 />} title="Category Performance Overview">
                <p>
                    <strong>What it shows:</strong> A comparative bar chart displaying your average accuracy score (%) for each major NQESH domain or category side-by-side.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Identify Strengths and Weaknesses:</strong> This is a crucial diagnostic tool. Categories with the lowest bars represent your weakest areas and require the most attention. Categories with the highest bars are your current strengths.</li>
                    <li><strong>Prioritize Study Efforts:</strong> The relative heights of the bars clearly indicate where to focus your limited study time for maximum impact on your overall score.</li>
                    <li><strong>Quick Comparison:</strong> Allows for an immediate visual comparison of your proficiency across all tested domains.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Focus on the Lowest Bars:</strong> Dedicate specific study sessions to the 1-3 categories where your performance is weakest. Dive deep into the concepts and practice questions related to these areas.</li>
                    <li><strong>Maintain Strengths:</strong> Don't completely ignore your strong areas. Periodically review them to ensure retention, but allocate less time compared to weaker domains.</li>
                    <li><strong>Cross-Reference with Exam Weighting:</strong> Consider the official NQESH domain weightings (if known). A weak area that constitutes a large part of the exam needs even higher priority.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<PieChartIcon />} title="Domain Performance Breakdown (Categories Tab)">
                <p>
                    <strong>What it shows:</strong> This section typically combines two views:
                    <ol className="list-decimal space-y-1.5 pl-5 mt-2"> {/* Keep nested list styles for clarity */}
                        <li><strong>Practice Distribution (Pie Chart):</strong> Shows the proportion (%) of total questions you've answered that fall into each category.</li>
                        <li><strong>Detailed Category Stats (List/Table):</strong> Provides specific metrics for each category, such as the exact average score (%), the number of questions attempted, and possibly the number of attempts focused on that category.</li>
                    </ol>
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Pie Chart - Effort Balance:</strong> Does the distribution of your practice align with your identified weak areas or the exam's weighting? A large slice for a strong category might mean you're over-practicing comfort zones. Small slices for weak areas indicate neglect.</li>
                    <li><strong>Detailed List - Precise Performance:</strong> Confirms the average scores seen in the overview bar chart but adds crucial context like the *number of questions attempted*. A low score based on only a few questions is less reliable than a low score based on many questions.</li>
                    <li><strong>Combine Insights:</strong> Use the pie chart to assess *where* you're spending your time and the list to see *how effective* that time is.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Adjust Practice Focus:</strong> If the pie chart shows you're neglecting weak categories (identified by low scores in the list), consciously choose to practice more questions from those specific domains.</li>
                    <li><strong>Ensure Sufficient Data:</strong> If a category has a low score but very few questions attempted, make sure to answer more questions in that area to get a reliable measure of your proficiency before making drastic study changes.</li>
                    <li><strong>Validate Weaknesses:</strong> Use the detailed list to confirm the weak areas identified in the overview chart. Prioritize those with both low scores and a reasonable number of attempts.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<LineChartIcon />} title="Category Performance Trend (Per Category)">
                <p>
                    <strong>What it shows:</strong> A line chart tracking your performance (usually accuracy percentage) over time or across consecutive attempts *within a single, specific category* that you select. The X-axis typically represents time or attempt number, and the Y-axis represents the score (%).
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Track Learning Progress:</strong> An upward sloping trend indicates improvement and successful learning within that specific category.</li>
                    <li><strong>Identify Plateaus:</strong> A flat line suggests that your performance in this area has stagnated. You might be stuck or need to change your study approach for this topic.</li>
                    <li><strong>Detect Regression:</strong> A downward sloping trend is a red flag, indicating you might be forgetting material or developing misconceptions in this category.</li>
                    <li><strong>Volatility:</strong> A very jagged line might indicate inconsistent performance or perhaps too few data points per measurement period.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Upward Trend:</strong> Keep doing what you're doing for this category, but continue practicing to solidify gains.</li>
                    <li><strong>Flat/Downward Trend:</strong> This requires intervention. Revisit the fundamental concepts of this category. Analyze the specific questions you're missing (see "Most Challenging Questions"). Try different study techniques (e.g., flashcards, concept maps, teaching the topic to someone else). Seek alternative explanations or resources.</li>
                    <li><strong>Investigate Volatility:</strong> If the trend jumps around wildly, ensure you're completing enough questions in each session focused on this category to get a stable score reading.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<BarChartHorizontalBig />} title="First Attempt vs. Overall Performance Comparison">
                <p>
                    <strong>What it shows:</strong> For each category, this chart compares your average score on your *very first attempt* at questions within that category against your *current overall average score* in that same category (which includes all subsequent attempts).
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Measure Improvement from Practice:</strong> The gap between the first attempt score (baseline knowledge) and the overall average score (knowledge after practice/review) directly quantifies how much you've learned through repetition and study within that category.</li>
                    <li><strong>Identify Effective Learning:</strong> A significantly higher overall average compared to the first attempt indicates that your practice and review process for that category is effective.</li>
                    <li><strong>Spot Ineffective Repetition:</strong> If the overall average is only slightly higher than, or even equal to, the first attempt score, it suggests that simply re-doing quizzes isn't leading to improvement. You might be repeating mistakes or not actively learning from them.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Large Gap (Good):</strong> Reinforces that your current study methods for this category are working.</li>
                    <li><strong>Small Gap (Needs Attention):</strong> Don't just retake quizzes passively. When you review mistakes, actively try to understand *why* the correct answer is right and *why* your initial answer was wrong. Write down explanations, look up related concepts, or create flashcards for challenging questions. Ensure you're not just memorizing answers to specific questions but understanding the underlying principles.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<AlertTriangle />} title="Most Challenging Questions Analysis">
                <p>
                    <strong>What it shows:</strong> A ranked list or table highlighting the specific questions you have answered incorrectly most often or have the lowest success rate on across all your attempts. It often includes the question text (or an identifier), the correct answer, your common incorrect answer(s), and the frequency/percentage of errors.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Pinpoint Specific Knowledge Gaps:</strong> This is highly granular feedback, moving beyond category-level weaknesses to the exact concepts or question types causing trouble.</li>
                    <li><strong>Identify Misconceptions:</strong> Seeing your common incorrect answers can reveal specific misunderstandings or patterns in your errors (e.g., consistently mixing up two similar terms).</li>
                    <li><strong>Highlight Tricky Wording:</strong> Some questions might be missed frequently due to confusing phrasing or subtle distractors, not just lack of knowledge.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Highest Priority Review:</strong> These specific questions demand immediate and thorough review. Treat them as mini-lessons.</li>
                    <li><strong>Deep Dive Analysis:</strong> For each challenging question:
                        <ul className="list-['-_'] space-y-1 pl-4 mt-1"> {/* Kept nested list style for clarity */}
                            <li>Read the question carefully again.</li>
                            <li>Understand the provided explanation thoroughly. Why is the correct answer right?</li>
                            <li>Analyze why you chose the incorrect answer. What was your thought process? Where did it go wrong?</li>
                            <li>Look up the underlying concept in your study materials.</li>
                            <li>Consider creating a flashcard or note specifically for this question/concept.</li>
                        </ul>
                    </li>
                    <li><strong>Look for Patterns:</strong> Are many of your challenging questions related to a single sub-topic within a broader category? This further refines your study focus.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<Target />} title="Quiz Score Distribution Histogram">
                <p>
                    <strong>What it shows:</strong> A histogram chart that groups your individual quiz scores (percentages) into ranges or "bins" (e.g., 0-10%, 11-20%, ..., 91-100%) and shows how many of your completed quizzes fall into each score range.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Overall Performance Consistency:</strong> Shows the spread of your scores. Are most of your scores clustered together (consistent performance) or spread out widely (variable performance)?</li>
                    <li><strong>Central Tendency:</strong> Where does the bulk of your scores lie? Is the distribution skewed towards lower scores, higher scores, or centered in the middle?</li>
                    <li><strong>Progress Towards Target:</strong> Visually represents how many of your attempts are meeting your target score range (e.g., 80%+).</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Shift the Distribution Right:</strong> The goal is generally to have the majority of the bars clustered in the higher score ranges (e.g., 80-90%, 91-100%).</li>
                    <li><strong>High Concentration in Low Scores:</strong> If many quizzes fall into lower score brackets, it signals a widespread need for improvement. Revisit fundamentals and focus on weak categories identified elsewhere.</li>
                    <li><strong>Wide Spread:</strong> If scores are all over the place, work on consistency. This might involve standardizing your approach to quizzes (e.g., environment, time management) or addressing foundational knowledge gaps that cause unpredictable performance.</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<Clock />} title="Time Spent Distribution (Per Quiz Session)">
                <p>
                    <strong>What it shows:</strong> A histogram chart displaying the distribution of the *total time* taken to complete entire quiz sessions. It groups sessions into time duration brackets (e.g., 0-15 mins, 15-30 mins, 30-45 mins, etc.) and shows how many sessions fall into each bracket.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Typical Pacing:</strong> Reveals how long you typically spend on a full quiz session. Is there a common time range?</li>
                    <li><strong>Identify Outliers:</strong> Shows if some sessions are unusually fast or slow compared to your average.</li>
                    <li><strong>Time Management Habits:</strong> Provides insight into your general time allocation per session. Are you rushing, or are you spending extensive time?</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Correlate with Scores:</strong> This chart is most useful when considered alongside score data (see the next scatter plot). Are your fastest sessions associated with lower scores (rushing)? Are your longest sessions associated with higher scores (carefulness) or lower scores (struggling)?</li>
                    <li><strong>Establish Realistic Time Goals:</strong> Understand your natural pace to better plan study schedules.</li>
                    <li><strong>Investigate Outliers:</strong> If you have many very short or very long sessions, reflect on why. Were you interrupted? Did you get stuck? Were you trying a speed run?</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<ScatterChartIcon />} title="Quiz Score vs. Total Time Spent Scatter Plot">
                <p>
                    <strong>What it shows:</strong> A scatter plot where each dot represents a single completed quiz session. The X-axis plots the total time spent on that quiz, and the Y-axis plots the final score (%) achieved.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Correlation between Time and Score:</strong> Look for overall patterns or trends:
                        <ul className="list-['-_'] space-y-1 pl-4 mt-1"> {/* Kept nested list style for clarity */}
                            <li><strong>Upward Trend (Positive Correlation):</strong> Spending more time generally leads to better scores (suggests carefulness pays off).</li>
                            <li><strong>Downward Trend (Negative Correlation):</strong> Spending more time leads to worse scores (might indicate getting bogged down, struggling excessively with harder quizzes).</li>
                            <li><strong>No Clear Trend:</strong> Time spent doesn't seem to strongly influence the score, or the relationship is complex.</li>
                        </ul>
                    </li>
                    <li><strong>Identify Optimal Time Zone:</strong> Is there a range of time spent that consistently yields high scores?</li>
                    <li><strong>Spot Outliers:</strong>
                        <ul className="list-['-_'] space-y-1 pl-4 mt-1"> {/* Kept nested list style for clarity */}
                            <li><em>High Score, Low Time:</em> Efficient and knowledgeable, or perhaps an easy quiz?</li>
                            <li><em>Low Score, Low Time:</em> Rushing, lack of effort, or carelessness?</li>
                            <li><em>Low Score, High Time:</em> Significant difficulty, struggling with concepts?</li>
                            <li><em>High Score, High Time:</em> Thoroughness, or perhaps time pressure isn't a major issue yet?</li>
                        </ul>
                    </li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Adjust Pacing Strategy:</strong> If low time consistently correlates with low scores, consciously slow down, read carefully, and double-check answers. If high time correlates with low scores, identify bottlenecks – are you spending too long on questions you don't know? Practice time management techniques like skipping very hard questions and returning later.</li>
                    <li><strong>Find Your Sweet Spot:</strong> Aim for the time range that seems to produce your best results, balancing speed and accuracy.</li>
                    <li><strong>Analyze Outliers:</strong> Reflect on the specific quizzes represented by outlier dots. What happened during those sessions?</li>
                </ul>
            </GuideSectionCard>

            <GuideSectionCard icon={<ScatterChartIcon />} title="Per-Question Accuracy vs. Time Spent Scatter Plot">
                <p>
                    <strong>What it shows:</strong> A scatter plot where each dot represents a *single question* you've answered. The X-axis plots the time you spent on that specific question, and the Y-axis indicates whether you answered it correctly (e.g., Y=1) or incorrectly (e.g., Y=0), or sometimes uses color/shape to differentiate correct/incorrect.
                </p>
                <p><strong>Interpretation:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Diagnose Error Types:</strong> This powerful visual helps distinguish between different reasons for errors:
                        <ul className="list-['-_'] space-y-1 pl-4 mt-1"> {/* Kept nested list style for clarity */}
                            <li><strong>Quick & Incorrect (Bottom-Left Cluster):</strong> Suggests careless mistakes, misreading the question, rushing, or guessing quickly without understanding.</li>
                            <li><strong>Slow & Incorrect (Bottom-Right Cluster):</strong> Indicates struggling with the concept, spending time but still not arriving at the correct answer. Suggests fundamental knowledge gaps or difficulty applying concepts.</li>
                            <li><strong>Quick & Correct (Top-Left Cluster):</strong> Represents questions you know well and can answer efficiently.</li>
                            <li><strong>Slow & Correct (Top-Right Cluster):</strong> Represents challenging questions that you were able to solve correctly with sufficient time and effort.</li>
                        </ul>
                    </li>
                    <li><strong>Identify Time Sinks:</strong> Are there many questions where you spend a very long time, regardless of correctness? These might be areas where you lack confidence or efficiency.</li>
                </ul>
                <p><strong>Actionable Insights:</strong></p>
                <ul className={listDiscClass}>
                    <li><strong>Address Quick Errors:</strong> If you have many dots in the "Quick & Incorrect" zone, practice active reading techniques. Slow down slightly, highlight keywords, and re-read the question before answering. Double-check simple calculations.</li>
                    <li><strong>Address Slow Errors:</strong> If you have many dots in the "Slow & Incorrect" zone, this points to core conceptual weaknesses. These topics require focused study, reviewing fundamentals, and working through explanations – refer back to the "Most Challenging Questions" list and category weaknesses.</li>
                    <li><strong>Improve Efficiency:</strong> Analyze the "Slow & Correct" questions. Could you have solved them faster with better techniques or deeper understanding? Are there calculation shortcuts or reasoning patterns you could learn?</li>
                    <li><strong>Build Confidence:</strong> Recognize the "Quick & Correct" areas as strengths to build upon.</li>
                </ul>
            </GuideSectionCard>

        </div>
    );
};

export default DataInterpretationGuide;