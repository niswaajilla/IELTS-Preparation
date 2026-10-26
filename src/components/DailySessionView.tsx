import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  RotateCcw,
  Clock,
  Check,
  Volume2
} from 'lucide-react';
import {
  VocabWord,
  SkillType,
  DailySessionRecord,
  ReadingPassage
} from '../types/index.ts';
import { ttsService } from '../services/ttsService.ts';

interface DailySessionViewProps {
  vocabList: VocabWord[];
  onUpdateVocab: (updated: VocabWord[]) => void;
  onSessionComplete: (record: DailySessionRecord) => void;
  onLaunchReadingTest: (passage?: ReadingPassage, onFinish?: (score: number, total: number, band: number, featuredWords: string[]) => void) => void;
  onGoToReadingTab: () => void;
}

interface TicketQ {
  wordData: VocabWord;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanationId: string;
}

export const DailySessionView: React.FC<DailySessionViewProps> = ({
  vocabList,
  onUpdateVocab,
  onSessionComplete,
  onLaunchReadingTest,
  onGoToReadingTab,
}) => {
  // Stages: 'intro' | 'entry_ticket' | 'entry_summary' | 'select_skill' | 'in_practice' | 'exit_ticket' | 'session_summary'
  const [currentStage, setCurrentStage] = useState<
    'intro' | 'entry_ticket' | 'entry_summary' | 'select_skill' | 'exit_ticket' | 'session_summary'
  >('intro');

  // Entry Ticket State
  const [entryQuestions, setEntryQuestions] = useState<TicketQ[]>([]);
  const [entryCurrentIdx, setEntryCurrentIdx] = useState(0);
  const [entrySelectedAnswer, setEntrySelectedAnswer] = useState<string | null>(null);
  const [entryIsAnswered, setEntryIsAnswered] = useState(false);
  const [entryScore, setEntryScore] = useState(0);
  const [entryMissedWords, setEntryMissedWords] = useState<string[]>([]);

  // Skill Selection
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('reading');

  // Practice Results from Reading test
  const [practiceResult, setPracticeResult] = useState<{
    correct: number;
    total: number;
    bandScore: number;
    title: string;
    featuredWords: string[];
  } | null>(null);

  // Exit Ticket State
  const [exitQuestions, setExitQuestions] = useState<TicketQ[]>([]);
  const [exitCurrentIdx, setExitCurrentIdx] = useState(0);
  const [exitSelectedAnswer, setExitSelectedAnswer] = useState<string | null>(null);
  const [exitIsAnswered, setExitIsAnswered] = useState(false);
  const [exitScore, setExitScore] = useState(0);
  const [exitMissedWords, setExitMissedWords] = useState<string[]>([]);

  // Prepare Entry Ticket questions
  const startEntryTicket = () => {
    // Select 5 words from learning/new or any vocab
    const pool = vocabList.filter(v => v.status !== 'mastered');
    const sourcePool = pool.length >= 5 ? pool : vocabList;
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random()).slice(0, 5);

    const questions: TicketQ[] = shuffled.map(targetWord => {
      // Pick 3 distractors from vocabList
      const distractors = vocabList
        .filter(w => w.id !== targetWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.indonesianMeaning);

      const options = [...distractors, targetWord.indonesianMeaning].sort(() => 0.5 - Math.random());

      return {
        wordData: targetWord,
        prompt: `Apa arti dan makna akademik dari kata "${targetWord.word}" (${targetWord.partOfSpeech})?`,
        options,
        correctAnswer: targetWord.indonesianMeaning,
        explanationId: `Kata "${targetWord.word}" berarti: ${targetWord.indonesianMeaning}. Definisi: "${targetWord.definition}". Contoh kalimat: "${targetWord.example}"`
      };
    });

    setEntryQuestions(questions);
    setEntryCurrentIdx(0);
    setEntryScore(0);
    setEntryMissedWords([]);
    setEntrySelectedAnswer(null);
    setEntryIsAnswered(false);
    setCurrentStage('entry_ticket');
  };

  const handleAnswerEntry = (option: string) => {
    if (entryIsAnswered) return;
    setEntrySelectedAnswer(option);
    setEntryIsAnswered(true);

    const currentQ = entryQuestions[entryCurrentIdx];
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setEntryScore(prev => prev + 1);
    } else {
      setEntryMissedWords(prev => [...prev, currentQ.wordData.word]);
      // Mark as needing review
      const updated = vocabList.map(v =>
        v.id === currentQ.wordData.id
          ? { ...v, needsReview: true, missedCount: (v.missedCount || 0) + 1 }
          : v
      );
      onUpdateVocab(updated);
    }
  };

  const handleNextEntry = () => {
    if (entryCurrentIdx + 1 < entryQuestions.length) {
      setEntryCurrentIdx(prev => prev + 1);
      setEntrySelectedAnswer(null);
      setEntryIsAnswered(false);
    } else {
      setCurrentStage('entry_summary');
    }
  };

  // Prepare Exit Ticket questions
  const startExitTicket = () => {
    // Collect words: combine newly encountered words from practice test with entry words
    const candidateWords: VocabWord[] = [];

    // Check practice result featured words
    if (practiceResult?.featuredWords) {
      practiceResult.featuredWords.forEach(wStr => {
        const found = vocabList.find(v => v.word.toLowerCase() === wStr.toLowerCase());
        if (found && !candidateWords.some(c => c.id === found.id)) {
          candidateWords.push(found);
        }
      });
    }

    // Add entry questions' words
    entryQuestions.forEach(q => {
      if (!candidateWords.some(c => c.id === q.wordData.id)) {
        candidateWords.push(q.wordData);
      }
    });

    // Fill up to 5 words from vocabList
    if (candidateWords.length < 5) {
      const remaining = vocabList.filter(v => !candidateWords.some(c => c.id === v.id));
      candidateWords.push(...remaining.slice(0, 5 - candidateWords.length));
    }

    const sliceWords = candidateWords.slice(0, 5);

    const questions: TicketQ[] = sliceWords.map(targetWord => {
      // Create synonym or meaning question
      const distractors = vocabList
        .filter(w => w.id !== targetWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.indonesianMeaning);

      const options = [...distractors, targetWord.indonesianMeaning].sort(() => 0.5 - Math.random());

      return {
        wordData: targetWord,
        prompt: `Exit Check: Apa arti tepat untuk kata "${targetWord.word}"?`,
        options,
        correctAnswer: targetWord.indonesianMeaning,
        explanationId: `Kata "${targetWord.word}" bermakna: ${targetWord.indonesianMeaning}. ${
          targetWord.synonyms?.length ? `Sinonim kunci: ${targetWord.synonyms.join(', ')}.` : ''
        }`
      };
    });

    setExitQuestions(questions);
    setExitCurrentIdx(0);
    setExitScore(0);
    setExitMissedWords([]);
    setExitSelectedAnswer(null);
    setExitIsAnswered(false);
    setCurrentStage('exit_ticket');
  };

  const handleAnswerExit = (option: string) => {
    if (exitIsAnswered) return;
    setExitSelectedAnswer(option);
    setExitIsAnswered(true);

    const currentQ = exitQuestions[exitCurrentIdx];
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setExitScore(prev => prev + 1);
    } else {
      setExitMissedWords(prev => [...prev, currentQ.wordData.word]);
      // Mark as needing review
      const updated = vocabList.map(v =>
        v.id === currentQ.wordData.id
          ? { ...v, needsReview: true, missedCount: (v.missedCount || 0) + 1 }
          : v
      );
      onUpdateVocab(updated);
    }
  };

  const handleNextExit = () => {
    if (exitCurrentIdx + 1 < exitQuestions.length) {
      setExitCurrentIdx(prev => prev + 1);
      setExitSelectedAnswer(null);
      setExitIsAnswered(false);
    } else {
      // Session Completed!
      triggerConfetti();
      finishDailySession();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const finishDailySession = () => {
    const sessionRecord: DailySessionRecord = {
      id: `daily-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      skillChosen: selectedSkill,
      entryTicketScore: {
        correct: entryScore,
        total: entryQuestions.length || 5,
        testedWords: entryQuestions.map(q => q.wordData.word),
      },
      practiceScore: practiceResult ? {
        correct: practiceResult.correct,
        total: practiceResult.total,
        bandScore: practiceResult.bandScore,
        testTitle: practiceResult.title,
        timeSpentSeconds: 900,
        mode: 'practice'
      } : undefined,
      exitTicketScore: {
        correct: exitScore,
        total: exitQuestions.length || 5,
        testedWords: exitQuestions.map(q => q.wordData.word),
      },
      newVocabLearned: practiceResult?.featuredWords || [],
      status: 'completed',
    };

    onSessionComplete(sessionRecord);
    setCurrentStage('session_summary');
  };

  // Launch reading practice for the main practice section
  const handleLaunchPractice = () => {
    if (selectedSkill === 'reading') {
      onLaunchReadingTest(undefined, (correct, total, band, featuredWords) => {
        setPracticeResult({
          correct,
          total,
          bandScore: band,
          title: 'IELTS Academic Reading Test',
          featuredWords
        });
        // After reading practice, continue to Exit Ticket
        setCurrentStage('exit_ticket');
        startExitTicket();
      });
    } else {
      // Mock practice for other preview skills if selected
      setPracticeResult({
        correct: 4,
        total: 5,
        bandScore: 7.0,
        title: `IELTS Academic ${selectedSkill.toUpperCase()} Practice`,
        featuredWords: ['ameliorate', 'resilience', 'prevalent']
      });
      setCurrentStage('exit_ticket');
      startExitTicket();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Stage */}
      {currentStage === 'intro' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm">
            <CalendarCheck className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            Structured 4-Step Daily Flow
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Daily IELTS Academic Routine
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
            Complete your targeted daily regimen: test 5 vocabulary words before starting, complete your main skill practice, verify vocabulary retention with the exit ticket, and review your progress.
          </p>

          {/* Regimen Flow Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">STEP 1</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Entry Ticket</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">5 Vocabulary check-in questions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">STEP 2</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Main Practice</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Academic Reading passage & tasks</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">STEP 3</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Exit Ticket</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">5 Vocabulary review questions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">STEP 4</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Summary</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Growth stats & streak boost</div>
            </div>
          </div>

          <button
            onClick={startEntryTicket}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>Begin Step 1: Entry Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stage: Entry Ticket */}
      {currentStage === 'entry_ticket' && entryQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
                Step 1: Entry Ticket
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Question {entryCurrentIdx + 1} of {entryQuestions.length}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Score: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{entryScore}</span> / {entryCurrentIdx + (entryIsAnswered ? 1 : 0)}
            </div>
          </div>

          {/* Current Word Info Card */}
          {(() => {
            const currentQ = entryQuestions[entryCurrentIdx];
            return (
              <div>
                <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-indigo-950 dark:text-indigo-200">
                        {currentQ.wordData.word}
                      </h2>
                      <span className="text-xs italic px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {currentQ.wordData.partOfSpeech}
                      </span>
                      {currentQ.wordData.phonetic && (
                        <span className="text-xs text-slate-500 font-mono">
                          {currentQ.wordData.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-1">
                      Academic Context: {currentQ.wordData.definition}
                    </p>
                  </div>
                  <button
                    onClick={() => ttsService.speak(currentQ.wordData.word)}
                    title="Listen to pronunciation"
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4">
                  {currentQ.prompt}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-3 mb-6">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = entrySelectedAnswer === opt;
                    const isCorrect = opt === currentQ.correctAnswer;
                    
                    let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';
                    if (entryIsAnswered) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      } else {
                        btnStyle = 'border-slate-200 dark:border-slate-800 opacity-50 bg-white dark:bg-slate-800';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerEntry(opt)}
                        disabled={entryIsAnswered}
                        className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {entryIsAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {entryIsAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Indonesian Explanation & Key terms */}
                {entryIsAnswered && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Pembahasan (Explanation in Indonesian):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanationId}
                    </p>
                  </div>
                )}

                {/* Next button */}
                {entryIsAnswered && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextEntry}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <span>{entryCurrentIdx + 1 < entryQuestions.length ? 'Next Question' : 'View Entry Score'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Stage: Entry Ticket Summary */}
      {currentStage === 'entry_summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Award className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Entry Ticket Completed!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Here is your pre-practice vocabulary score:
          </p>

          <div className="inline-block p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 mb-6">
            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">
              {entryScore} / {entryQuestions.length}
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400">
              Accuracy: {Math.round((entryScore / (entryQuestions.length || 1)) * 100)}%
            </div>
          </div>

          {entryMissedWords.length > 0 && (
            <div className="max-w-md mx-auto mb-8 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-left text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">Perlu diulang:</span> Kata-kata berikut otomatis ditambahkan ke daftar review Anda: <span className="font-semibold underline">{entryMissedWords.join(', ')}</span>.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentStage('select_skill')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
            >
              <span>Continue to Step 2: Main Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage: Skill Selection for Main Practice */}
      {currentStage === 'select_skill' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
              Step 2: Main Practice
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
              Select Your Practice Focus Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose the skill you want to train. Academic Reading is fully featured with interactive split-screen passages, TFNG, matching headings, and timer simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Reading Card */}
            <div
              onClick={() => setSelectedSkill('reading')}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedSkill === 'reading'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Reading Academic</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Full Suite
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                600-800 word academic passages with True/False/Not Given, Matching Headings, MCQs, and Sentence Completion.
              </p>
            </div>

            {/* Listening Card */}
            <div
              onClick={() => setSelectedSkill('listening')}
              className={`p-5 rounded-xl border cursor-pointer transition-all opacity-85 ${
                selectedSkill === 'listening'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Listening</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Preview
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                IELTS monologues/dialogues with Web Speech API audio playback and speed control.
              </p>
            </div>

            {/* Writing Card */}
            <div
              onClick={() => setSelectedSkill('writing')}
              className={`p-5 rounded-xl border cursor-pointer transition-all opacity-85 ${
                selectedSkill === 'writing'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Writing</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Preview
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Task 1 Charts & Task 2 Essays with live word count and 4-criteria assessment.
              </p>
            </div>

            {/* Speaking Card */}
            <div
              onClick={() => setSelectedSkill('speaking')}
              className={`p-5 rounded-xl border cursor-pointer transition-all opacity-85 ${
                selectedSkill === 'speaking'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Speaking</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Preview
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Part 1, Part 2 Cue Cards with 1m prep/2m speak timers, and speech recording.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-slate-900 dark:text-white capitalize">{selectedSkill}</strong>
            </span>
            <button
              onClick={handleLaunchPractice}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              <span>Launch {selectedSkill === 'reading' ? 'Reading Test' : 'Practice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage: Exit Ticket */}
      {currentStage === 'exit_ticket' && exitQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">
                Step 3: Exit Ticket
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Question {exitCurrentIdx + 1} of {exitQuestions.length}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Exit Score: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{exitScore}</span> / {exitCurrentIdx + (exitIsAnswered ? 1 : 0)}
            </div>
          </div>

          {/* Current Word */}
          {(() => {
            const currentQ = exitQuestions[exitCurrentIdx];
            return (
              <div>
                <div className="mb-6 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-200">
                        {currentQ.wordData.word}
                      </h2>
                      <span className="text-xs italic px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {currentQ.wordData.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                      Target Definition: {currentQ.wordData.definition}
                    </p>
                  </div>
                  <button
                    onClick={() => ttsService.speak(currentQ.wordData.word)}
                    title="Listen to pronunciation"
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4">
                  {currentQ.prompt}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-3 mb-6">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = exitSelectedAnswer === opt;
                    const isCorrect = opt === currentQ.correctAnswer;
                    
                    let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';
                    if (exitIsAnswered) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      } else {
                        btnStyle = 'border-slate-200 dark:border-slate-800 opacity-50 bg-white dark:bg-slate-800';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerExit(opt)}
                        disabled={exitIsAnswered}
                        className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {exitIsAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {exitIsAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pembahasan */}
                {exitIsAnswered && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Pembahasan (Indonesian explanation):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanationId}
                    </p>
                  </div>
                )}

                {/* Next button */}
                {exitIsAnswered && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextExit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <span>{exitCurrentIdx + 1 < exitQuestions.length ? 'Next Question' : 'Complete Daily Session'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Stage: Session Summary (Ringkasan Sesi) */}
      {currentStage === 'session_summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Routine Completed</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Session Summary & Growth
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Ringkasan pencapaian latihan harian dan perbandingan skor tiket kosakata Anda.
            </p>
          </div>

          {/* Comparison Cards: Entry vs Exit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Entry Ticket Score */}
            <div className="p-5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-center">
              <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
                Entry Ticket Score
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {entryScore} / {entryQuestions.length || 5}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {Math.round((entryScore / (entryQuestions.length || 5)) * 100)}% accuracy
              </div>
            </div>

            {/* Exit Ticket Score */}
            <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                Exit Ticket Score
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {exitScore} / {exitQuestions.length || 5}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {Math.round((exitScore / (exitQuestions.length || 5)) * 100)}% accuracy
              </div>
            </div>

            {/* Growth delta */}
            <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center flex flex-col justify-center">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Delta Growth</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {exitScore >= entryScore ? `+${(exitScore - entryScore)}` : `${exitScore - entryScore}`}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {exitScore >= entryScore ? 'Progress achieved!' : 'Review words needed'}
              </div>
            </div>
          </div>

          {/* Practice Test Performance */}
          {practiceResult && (
            <div className="mb-8 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    Main Practice Result
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    {practiceResult.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Score: {practiceResult.correct} of {practiceResult.total} questions correct
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-black text-sm shadow-sm">
                    Band {practiceResult.bandScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Words added / reviewed */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Vocabulary Reviewed in this Session:
            </h4>
            <div className="flex flex-wrap gap-2">
              {[...entryQuestions.map(q => q.wordData.word), ...exitQuestions.map(q => q.wordData.word)]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{word}</span>
                  </span>
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStage('intro')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Routine</span>
            </button>
            <button
              onClick={onGoToReadingTab}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Reading Hub</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
