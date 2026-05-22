export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  type: "single" | "multiple";
};

export type WeeklyStudySubjectItem = {
  subjectName: string;
  icon: string;
  minutes: number;
};

export type WeeklyStudyItem = {
  date: string;
  label: string;
  minutes: number;
  subjects: WeeklyStudySubjectItem[];
};

export type SubjectDistributionItem = {
  subjectId: string;
  subjectName: string;
  icon: string;
  minutes: number;
};

export type WeaknessItem = {
  subjectName: string;
  knowledgePointName: string | null;
  avgScore: number;
  attemptCount: number;
  studyMinutes: number;
};

export type StudyPlanItem = {
  subject: string;
  focus: string;
  weeklyMinutes: number;
  tasks: string[];
};
