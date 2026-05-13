import {
  SUBJECT_LABELS,
  type TeachingObjectivesData,
} from "@/lib/saint-paul";

type RawLearningObjective = {
  id: string;
  description: string;
};

type RawQuizQuestion = {
  id: string;
  type: string;
  mapped_LO?: string[];
  stem: string;
  options?: Record<string, string>;
  correct_answer?: string;
  correct_answer_guide?: string;
  confidence_rating?: string;
};

type RawQuizRecord = {
  quiz_name_pre: string;
  quiz_name_post: string;
  subject: string;
  grade: string;
  exam_type: string;
  topic: string;
  learning_objectives: RawLearningObjective[];
  shared_questions: RawQuizQuestion[];
  new_questions_post_only: RawQuizQuestion[];
};

export type SaintPaulQuizBank = {
  quizzes: RawQuizRecord[];
};

export type SaintPaulAssessmentOption = {
  id: string;
  text: string;
};

export type SaintPaulAssessmentQuestion = {
  id: string;
  type: "MCQ" | "SA";
  prompt: string;
  options: SaintPaulAssessmentOption[];
  correctOptionId: string | null;
  answerGuide: string | null;
  confidenceRating: string | null;
  mappedLearningObjectives: string[];
};

export type SaintPaulLesson = {
  topic: string;
  objectives: string[];
  preQuizTitle: string;
  postQuizTitle: string;
  preQuestions: SaintPaulAssessmentQuestion[];
  postQuestions: SaintPaulAssessmentQuestion[];
};

const SUBJECT_KEYS_BY_LABEL = Object.fromEntries(
  Object.entries(SUBJECT_LABELS).map(([key, label]) => [label, key]),
) as Record<string, string>;

function normalizeQuestion(
  question: RawQuizQuestion,
): SaintPaulAssessmentQuestion {
  return {
    id: question.id,
    type: question.type === "SA" ? "SA" : "MCQ",
    prompt: question.stem,
    options: Object.entries(question.options ?? {}).map(([id, text]) => ({
      id,
      text,
    })),
    correctOptionId: question.correct_answer ?? null,
    answerGuide: question.correct_answer_guide ?? null,
    confidenceRating: question.confidence_rating ?? null,
    mappedLearningObjectives: question.mapped_LO ?? [],
  };
}

export function findSaintPaulLesson(
  quizBank: SaintPaulQuizBank,
  selection: {
    subject?: string;
    version?: string;
    grade?: string;
  },
): SaintPaulLesson | null {
  const subject = selection.subject ?? "";
  const version = selection.version ?? "";
  const grade = selection.grade ?? "";
  const localizedSubject = SUBJECT_LABELS[subject] ?? subject;

  const quiz = quizBank.quizzes.find(
    (item) =>
      item.subject === localizedSubject &&
      item.exam_type === version &&
      item.grade === grade,
  );

  if (!quiz) {
    return null;
  }

  const sharedQuestions = quiz.shared_questions.map(normalizeQuestion);
  const postOnlyQuestions = quiz.new_questions_post_only.map(normalizeQuestion);

  return {
    topic: quiz.topic,
    objectives: quiz.learning_objectives.map((objective) => objective.description),
    preQuizTitle: quiz.quiz_name_pre,
    postQuizTitle: quiz.quiz_name_post,
    preQuestions: sharedQuestions,
    postQuestions: [...sharedQuestions, ...postOnlyQuestions],
  };
}

export function buildTeachingObjectivesData(
  quizBank: SaintPaulQuizBank,
): TeachingObjectivesData {
  return quizBank.quizzes.reduce<TeachingObjectivesData>((data, quiz) => {
    const subject = SUBJECT_KEYS_BY_LABEL[quiz.subject] ?? quiz.subject;

    if (!data[subject]) {
      data[subject] = {};
    }

    if (!data[subject][quiz.exam_type]) {
      data[subject][quiz.exam_type] = {};
    }

    data[subject][quiz.exam_type][quiz.grade] = {
      topic: quiz.topic,
      objectives: quiz.learning_objectives.map(
        (objective) => objective.description,
      ),
    };

    return data;
  }, {});
}
