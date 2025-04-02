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
        explanation: "Transformational leadership focuses on inspiring and motivating followers to exceed ordinary expectations and create meaningful change. It emphasizes vision, inspiration, and intellectual stimulation rather than just task completion or hierarchical control.",
        source: "https://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2015_44.pdf"
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
        explanation: "Participative leadership is most effective when implementing significant changes that may face resistance. By involving teachers in the decision-making process, they develop ownership of the changes, leading to better implementation and reduced resistance.",
        source: "https://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2015_44.pdf"
    },
    {
        id: "lead3",
        categoryId: "leadership",
        question: "What is the role of a school leader in fostering a positive school culture?",
        options: [
            "Enforcing strict disciplinary policies",
            "Promoting open communication, collaboration, and mutual respect",
            "Maintaining the status quo and avoiding change",
            "Focusing solely on academic performance"
        ],
        correctOptionIndex: 1,
        explanation: "A school leader plays a crucial role in fostering a positive school culture by promoting open communication, collaboration, and mutual respect among students, teachers, and staff. This creates a supportive and inclusive environment that enhances learning and well-being.",
        source: "https://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2015_44.pdf"
    },
    {
        id: "lead4",
        categoryId: "leadership",
        question: "A school principal notices a decline in teacher morale. Which action would be most effective in addressing this issue?",
        options: [
            "Ignoring the issue and hoping it resolves itself",
            "Implementing new performance metrics to increase accountability",
            "Conducting a staff survey to identify concerns and implementing strategies to address them",
            "Replacing underperforming teachers"
        ],
        correctOptionIndex: 2,
        explanation: "Conducting a staff survey to identify concerns and implementing strategies to address them is the most effective action. This demonstrates that the principal values teacher input and is committed to creating a positive work environment.",
        source: "https://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2015_44.pdf"
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
        explanation: "The primary purpose of a School Improvement Plan is to provide a strategic roadmap that translates the school's vision into actionable, measurable goals and objectives. It guides the school's efforts toward continuous improvement in student achievement and overall educational quality.",
        source: "https://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2015_44.pdf"
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
    {
        id: "mgmt3",
        categoryId: "management",
        question: "Which of the following is the best approach to managing conflict between teachers?",
        options: [
            "Ignoring the conflict and hoping it resolves itself",
            "Taking sides and supporting one teacher over the other",
            "Facilitating a mediation process to help the teachers find a mutually agreeable solution",
            "Transferring one of the teachers to another school"
        ],
        correctOptionIndex: 2,
        explanation: "Facilitating a mediation process is the best approach to managing conflict between teachers. This allows the teachers to communicate their concerns and work together to find a solution that addresses the needs of both parties."
    },
    {
        id: "mgmt4",
        categoryId: "management",
        question: "What is the importance of data-driven decision-making in educational management?",
        options: [
            "It is not important; intuition is sufficient",
            "It helps to justify decisions already made",
            "It provides objective evidence to inform decision-making and improve outcomes",
            "It complicates the decision-making process"
        ],
        correctOptionIndex: 2,
        explanation: "Data-driven decision-making is crucial in educational management because it provides objective evidence to inform decision-making and improve outcomes. This allows school leaders to make informed choices based on data rather than relying solely on intuition or personal biases."
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
    {
        id: "inst2",
        categoryId: "instructional",
        question: "What is the role of instructional leaders in promoting effective teaching practices?",
        options: [
            "Dictating teaching methods to teachers",
            "Providing resources, professional development, and support for teachers to improve their skills",
            "Ignoring ineffective teaching practices",
            "Focusing solely on student test scores"
        ],
        correctOptionIndex: 1,
        explanation: "Instructional leaders play a vital role in promoting effective teaching practices by providing resources, professional development, and support for teachers to improve their skills. This includes mentoring, coaching, and providing access to research-based instructional strategies."
    },
    {
        id: "inst3",
        categoryId: "instructional",
        question: "Which assessment method provides the most comprehensive understanding of student learning?",
        options: [
            "Standardized tests",
            "Formative assessments",
            "Summative assessments",
            "A combination of formative and summative assessments"
        ],
        correctOptionIndex: 3,
        explanation: "A combination of formative and summative assessments provides the most comprehensive understanding of student learning. Formative assessments provide ongoing feedback to guide instruction, while summative assessments measure overall learning outcomes."
    },
    {
        id: "inst4",
        categoryId: "instructional",
        question: "How can technology be effectively integrated into instruction?",
        options: [
            "Using technology for its own sake, regardless of its relevance to the curriculum",
            "Replacing traditional teaching methods entirely with technology",
            "Using technology to enhance and support teaching and learning, not replace it",
            "Limiting technology use to specific subjects"
        ],
        correctOptionIndex: 2,
        explanation: "Technology can be effectively integrated into instruction by using it to enhance and support teaching and learning, not replace it. This includes using technology to provide access to information, facilitate collaboration, and create engaging learning experiences."
    },

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
    {
        id: "admin2",
        categoryId: "administrative",
        question: "What is the role of the School Governing Council (SGC)?",
        options: [
            "To manage the day-to-day operations of the school",
            "To provide policy guidance and oversight for the school",
            "To raise funds for the school",
            "To discipline students"
        ],
        correctOptionIndex: 1,
        explanation: "The School Governing Council (SGC) plays a crucial role in providing policy guidance and oversight for the school. It is composed of representatives from the school administration, teachers, parents, students, and community members."
    },
    {
        id: "admin3",
        categoryId: "administrative",
        question: "Which of the following is the most effective way to manage school resources?",
        options: [
            "Spending all available funds as quickly as possible",
            "Prioritizing spending based on the school's SIP and student needs",
            "Keeping all funds in reserve for emergencies",
            "Distributing funds equally among all departments"
        ],
        correctOptionIndex: 1,
        explanation: "The most effective way to manage school resources is to prioritize spending based on the school's SIP and student needs. This ensures that resources are allocated in a way that supports the school's goals and improves student outcomes."
    },
    {
        id: "admin4",
        categoryId: "administrative",
        question: "What is the importance of maintaining accurate school records?",
        options: [
            "It is not important; only student grades matter",
            "It helps to track student progress and ensure accountability",
            "It is a waste of time and resources",
            "It is only necessary for large schools"
        ],
        correctOptionIndex: 1,
        explanation: "Maintaining accurate school records is crucial for tracking student progress and ensuring accountability. This includes student attendance, grades, test scores, and other relevant information."
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
    },
    {
        id: "legal2",
        categoryId: "legal",
        question: "What is the legal basis for the implementation of inclusive education in the Philippines?",
        options: [
            "Presidential Decree No. 603",
            "Republic Act No. 7277",
            "Batas Pambansa Blg. 232",
            "All of the above"
        ],
        correctOptionIndex: 3,
        explanation: "All of the above laws contribute to the legal basis for inclusive education in the Philippines. They aim to provide equal opportunities for all learners, including those with disabilities or special needs."
    },
    {
        id: "legal3",
        categoryId: "legal",
        question: "According to the Family Educational Rights and Privacy Act (FERPA), what rights do parents have regarding their child's education records?",
        options: [
            "The right to inspect and review their child's education records",
            "The right to request corrections to their child's education records",
            "The right to control who has access to their child's education records",
            "All of the above"
        ],
        correctOptionIndex: 3,
        explanation: "FERPA grants parents several rights regarding their child's education records, including the right to inspect and review the records, request corrections, and control who has access to the records."
    },
    {
        id: "legal4",
        categoryId: "legal",
        question: "Which of the following actions is a violation of a student's right to due process?",
        options: [
            "Informing a student of the charges against them",
            "Providing a student with an opportunity to present their side of the story",
            "Suspending a student without a hearing",
            "Imposing a fair and reasonable punishment"
        ],
        correctOptionIndex: 2,
        explanation: "Suspending a student without a hearing is a violation of their right to due process. Students have the right to be informed of the charges against them and to have an opportunity to present their side of the story before being disciplined."
    }
];
