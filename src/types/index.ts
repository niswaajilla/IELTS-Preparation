export type SkillType = 'reading' | 'listening' | 'writing' | 'speaking';

export type VocabStatus = 'new' | 'learning' | 'mastered';

export interface VocabWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  indonesianMeaning: string;
  synonyms?: string[];
  antonyms?: string[];
  example: string;
  theme?: string;
  status: VocabStatus;
  needsReview?: boolean;
  missedCount?: number;
  lastPracticed?: string;
}

export type QuestionType =
  | 'tfng'
  | 'matching_headings'
  | 'multiple_choice'
  | 'sentence_completion';

export interface HeadingItem {
  id: string; // e.g. "i", "ii", "iii"
  text: string;
}

export interface ReadingParagraph {
  letter: string; // "A", "B", "C"...
  text: string;
}

export interface ReadingQuestion {
  id: string;
  number: number;
  type: QuestionType;
  instruction: string;
  statement?: string; // used for TFNG, Matching Headings, or Sentence Completion
  question?: string;  // used for Multiple Choice
  options?: string[]; // choices for Multiple Choice or Headings
  correctAnswer: string;
  acceptableAnswers?: string[]; // alternate casing or small variations for sentence completion
  paragraphTarget?: string; // e.g. "B"
  explanationId: string; // Explanation in Indonesian with English key terms
  supportingQuote: string; // Direct English quote from passage
}

export interface ReadingPassage {
  id: string;
  title: string;
  topic: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  passage?: string;
  paragraphs: ReadingParagraph[];
  headingsList?: HeadingItem[];
  questions: ReadingQuestion[];
  featuredVocab?: Array<{
    word: string;
    partOfSpeech: string;
    definition: string;
    indonesianMeaning: string;
    synonyms?: string[];
    example: string;
  }>;
}

export interface TicketQuestion {
  vocabId: string;
  word: string;
  type: 'meaning_id' | 'synonym' | 'fill_in';
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanationId: string;
  wordData: VocabWord;
}

export interface DailySessionRecord {
  id: string;
  date: string;
  skillChosen: SkillType;
  entryTicketScore: {
    correct: number;
    total: number;
    testedWords: string[];
  };
  practiceScore?: {
    correct: number;
    total: number;
    bandScore: number;
    testTitle: string;
    timeSpentSeconds: number;
    mode: 'practice' | 'simulation';
  };
  exitTicketScore?: {
    correct: number;
    total: number;
    testedWords: string[];
  };
  newVocabLearned: string[];
  status: 'entry_done' | 'practice_done' | 'completed';
}

export interface TestSessionResult {
  id: string;
  testId: string;
  testTitle: string;
  skill: SkillType;
  date: string;
  mode: 'practice' | 'simulation';
  score: number;
  total: number;
  bandScore: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>;
  questionBreakdown: Array<{
    questionId: string;
    questionNumber: number;
    type: QuestionType;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanationId: string;
    supportingQuote: string;
  }>;
}

export interface UserProgress {
  streak: number;
  lastActiveDate: string;
  activityDates: string[]; // YYYY-MM-DD
  totalSessionsCompleted: number;
  testsCompletedCount: number;
  estimatedBands: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
    overall: number;
  };
  questionTypeStats: Record<
    QuestionType,
    { correct: number; total: number }
  >;
  history: TestSessionResult[];
  dailySessions: DailySessionRecord[];
}
