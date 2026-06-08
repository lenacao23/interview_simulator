export type QuestionType = 'behavioral' | 'open-ended' | 'situational';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SessionConfig {
  questionType: QuestionType;
  difficulty: Difficulty;
  jobDescription?: string;
}

export interface GeneratedQuestion {
  text: string;
  context?: string;
  tips?: string;
  mcqOptions: string[];
}

export interface STARScore {
  situation: number;
  task: number;
  action: number;
  result: number;
  feedback: string;
}

export interface FeedbackResult {
  strengths: string[];
  improvements: string[];
  starBreakdown?: STARScore;
  overallScore: number;
  coaching: string;
}

export interface Session {
  id: string;
  config: SessionConfig;
  question: GeneratedQuestion;
  userAnswer: string;
  answerMode: 'freeform' | 'mcq';
  createdAt: number;
  feedback?: FeedbackResult;
}
