// app/data/questions.ts
import type { QuizQuestion } from "../types/quiz";

export const questions: QuizQuestion[] = [
    // School Leadership questions
    {
        id: "lead1",
        categoryId: "leadership",
        question: "Which of the following best reflects a transformational leadership approach in a school setting?",
        options: [
            "Establishing a structured chain of command with clear roles",
            "Inspiring teachers to develop innovative teaching practices beyond standard requirements",
            "Ensuring all decisions follow established protocols and procedures",
            "Providing concrete rewards for teachers who meet performance targets"
        ],
        correctOptionIndex: 1,
        explanation: "Transformational leadership focuses on inspiring and motivating followers to exceed ordinary expectations and create meaningful change. It emphasizes vision, inspiration, and intellectual stimulation rather than just task completion or hierarchical control."
    },
    {
        id: "lead2",
        categoryId: "leadership",
        question: "Which leadership style is most appropriate when implementing significant curricular changes that may face resistance from experienced teachers?",
        options: [
            "Laissez-faire leadership",
            "Transactional leadership",
            "Participative leadership",
            "Autocratic leadership"
        ],
        correctOptionIndex: 2,
        explanation: "Participative leadership is most effective when implementing significant changes that may face resistance. By involving teachers in the decision-making process, they develop ownership of the changes, leading to better implementation and reduced resistance."
    },

    // Educational Management questions
    {
        id: "mgmt1",
        categoryId: "management",
        question: "What is the primary purpose of a School Improvement Plan (SIP)?",
        options: [
            "To comply with DepEd regulatory requirements",
            "To provide a roadmap for achieving the school's vision through specific, measurable goals",
            "To assign responsibilities to school personnel",
            "To justify budget allocations from the division office"
        ],
        correctOptionIndex: 1,
        explanation: "The primary purpose of a School Improvement Plan is to provide a strategic roadmap that translates the school's vision into actionable, measurable goals and objectives. It guides the school's efforts toward continuous improvement in student achievement and overall educational quality."
    },
    {
        id: "mgmt2",
        categoryId: "management",
        question: "According to DepEd Order No. 83, s. 2012, which of the following is NOT one of the key result areas in the Results-based Performance Management System (RPMS)?",
        options: [
            "Learning environment",
            "Financial management",
            "Community linkages",
            "Teaching and learning"
        ],
        correctOptionIndex: 1,
        explanation: "The key result areas in RPMS include Learning Environment, Community Linkages, Teaching and Learning, and Human Resource Management and Development. Financial Management is not explicitly defined as a key result area in DO 83, s. 2012, although it falls under broader management concerns."
    },

    // Instructional Leadership questions
    {
        id: "inst1",
        categoryId: "instructional",
        question: "Which of the following best describes the concept of 'differentiated instruction'?",
        options: [
            "Teaching different grade levels with varying approaches",
            "Customizing teaching approaches based on students' learning styles, readiness, and interests",
            "Delegating teaching responsibilities to different teachers based on their expertise",
            "Using different instructional materials for public and private schools"
        ],
        correctOptionIndex: 1,
        explanation: "Differentiated instruction refers to tailoring teaching approaches to address the diverse learning needs, styles, readiness levels, and interests of individual students within a classroom. It recognizes that students learn in different ways and at different rates."
    },

    // More questions for each category...

    // Administrative Management questions
    {
        id: "admin1",
        categoryId: "administrative",
        question: "Under DepEd guidelines, which of the following is the correct procedure for handling school funds from voluntary contributions?",
        options: [
            "Deposit them in the principal's personal account for easier access during emergencies",
            "Keep them in a secure cabinet in the principal's office",
            "Deposit them in an authorized government depository bank",
            "Use them immediately to avoid accounting complications"
        ],
        correctOptionIndex: 2,
        explanation: "According to DepEd guidelines, all school funds, including voluntary contributions, must be deposited in an authorized government depository bank. This ensures proper safekeeping, transparency, and adherence to government accounting and auditing rules."
    },

    // Legal Aspects questions
    {
        id: "legal1",
        categoryId: "legal",
        question: "Which law provides the basic framework for protecting children in the Philippine educational system from abuse, violence, exploitation, and discrimination?",
        options: [
            "Republic Act 10533 (Enhanced Basic Education Act of 2013)",
            "Republic Act 9155 (Governance of Basic Education Act of 2001)",
            "Republic Act 7610 (Special Protection of Children Against Abuse, Exploitation and Discrimination Act)",
            "Republic Act 10627 (Anti-Bullying Act of 2013)"
        ],
        correctOptionIndex: 2,
        explanation: "Republic Act 7610, or the Special Protection of Children Against Abuse, Exploitation and Discrimination Act, provides the comprehensive legal framework for protecting children from various forms of abuse, including in educational settings. It covers a broader range of protections than the Anti-Bullying Act or education-specific legislation."
    }
];