import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Highlighter,
  Type,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  BookmarkPlus,
  Play,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  ReadingPassage,
  ReadingQuestion,
  TestSessionResult,
  VocabWord,
  QuestionType
} from '../types/index.ts';
import { curatedPassages } from '../data/curatedPassages.ts';
import { aiService } from '../services/aiService.ts';
import { fullscreenService } from '../services/fullscreenService.ts';

interface ReadingModuleProps {
  onSaveResult: (result: TestSessionResult) => void;
  onAddVocabWord: (word: Partial<VocabWord>) => void;
  initialPassage?: ReadingPassage;
  onFinishCallback?: (correct: number, total: number, band: number, featuredWords: string[]) => void;
}

export const ReadingModule: React.FC<ReadingModuleProps> = ({
  onSaveResult,
  onAddVocabWord,
  initialPassage,
  onFinishCallback,
}) => {
  // Test selection & loaded test
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage>(
    initialPassage || curatedPassages[0]
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Test mode: 'practice' (untimed) vs 'simulation' (60 minutes)
  const [testMode, setTestMode] = useState<'practice' | 'simulation'>('practice');
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  // User answers keyed by question ID
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Active question being viewed/focused
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');

  // Timer (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showFiveMinWarning, setShowFiveMinWarning] = useState<boolean>(false);

  // Passage styling & tools
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'cyan' | 'none'>('yellow');
  const passageContainerRef = useRef<HTMLDivElement>(null);

  // Exam Focus Mode (Fullscreen immersive test layout)
  const [isExamFocus, setIsExamFocus] = useState<boolean>(false);

  // Toggle Exam Focus Fullscreen
  const toggleExamFocus = async () => {
    const next = !isExamFocus;
    setIsExamFocus(next);
    if (next) {
      await fullscreenService.enterFullscreen();
    } else {
      await fullscreenService.exitFullscreen();
    }
  };

  // Listen for Escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExamFocus) {
        setIsExamFocus(false);
        fullscreenService.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExamFocus]);

  // Sync with native browser fullscreen changes
  useEffect(() => {
    const unsubscribe = fullscreenService.onChange((isNativeFull) => {
      if (!isNativeFull && isExamFocus) {
        setIsExamFocus(false);
      }
    });
    return unsubscribe;
  }, [isExamFocus]);

  // Set active question when passage changes
  useEffect(() => {
    if (selectedPassage.questions.length > 0) {
      setActiveQuestionId(selectedPassage.questions[0].id);
    }
    setUserAnswers({});
    setIsTestSubmitted(false);
    setIsTestStarted(false);
    setTimeLeft(60 * 60);
    setElapsedTime(0);
    setShowFiveMinWarning(false);
  }, [selectedPassage]);

  // Timer effect
  useEffect(() => {
    let timer: any = null;
    if (isTestStarted && !isTestSubmitted) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        if (testMode === 'simulation') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              handleSubmitTest(); // Auto submit when time is up!
              return 0;
            }
            // 5 minutes remaining warning (300 seconds)
            if (prev === 301) {
              setShowFiveMinWarning(true);
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestStarted, isTestSubmitted, testMode]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Answer handler
  const handleAnswerChange = (questionId: string, answer: string) => {
    if (isTestSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Submit test and compute results
  const handleSubmitTest = () => {
    setIsTestSubmitted(true);

    let correctCount = 0;
    const totalCount = selectedPassage.questions.length;

    const breakdown = selectedPassage.questions.map(q => {
      const uAnswer = (userAnswers[q.id] || '').trim();
      let isCorrect = false;

      if (q.type === 'sentence_completion') {
        const lowerU = uAnswer.toLowerCase();
        const lowerC = q.correctAnswer.toLowerCase();
        const acceptable = (q.acceptableAnswers || []).map(a => a.toLowerCase());
        isCorrect = lowerU === lowerC || acceptable.includes(lowerU);
      } else {
        isCorrect = uAnswer.toUpperCase() === q.correctAnswer.toUpperCase();
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        questionNumber: q.number,
        type: q.type,
        userAnswer: uAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanationId: q.explanationId,
        supportingQuote: q.supportingQuote,
      };
    });

    const band = aiService.calculateIeltsBandScore(correctCount, totalCount);

    const resultRecord: TestSessionResult = {
      id: `reading-test-${Date.now()}`,
      testId: selectedPassage.id,
      testTitle: selectedPassage.title,
      skill: 'reading',
      date: new Date().toISOString().split('T')[0],
      mode: testMode,
      score: correctCount,
      total: totalCount,
      bandScore: band,
      timeSpentSeconds: elapsedTime,
      userAnswers,
      questionBreakdown: breakdown,
    };

    onSaveResult(resultRecord);

    if (band >= 7.0) {
      confetti({ particleCount: 70, spread: 60 });
    }

    if (onFinishCallback) {
      const featured = (selectedPassage.featuredVocab || []).map(v => v.word);
      onFinishCallback(correctCount, totalCount, band, featured);
    }
  };

  // Generate passage with AI
  const handleGenerateAiPassage = async (customTopic?: string) => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const newPassage = await aiService.generateReadingTest(
        customTopic || aiTopicInput || 'Academic Environmental Science',
        'medium'
      );
      setSelectedPassage(newPassage);
      setShowAiModal(false);
      setAiTopicInput('');
    } catch (err: any) {
      setAiError('Failed to generate passage. Please try again or use curated tests.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Highlight selection helper
  const handleTextHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    if (highlightColor === 'yellow') {
      span.className = 'bg-amber-200/80 dark:bg-amber-400/30 text-inherit px-0.5 rounded';
    } else if (highlightColor === 'green') {
      span.className = 'bg-emerald-200/80 dark:bg-emerald-400/30 text-inherit px-0.5 rounded';
    } else {
      span.className = 'bg-cyan-200/80 dark:bg-cyan-400/30 text-inherit px-0.5 rounded';
    }

    try {
      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (e) {
      // If range crosses boundaries, ignore safely
    }
  };

  // Computed answered count
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k]?.trim() !== '').length;

  return (
    <div className={isExamFocus ? "fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 flex flex-col h-screen w-screen overflow-hidden" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}>
      
      {/* 5-Minute Warning Banner */}
      {showFiveMinWarning && !isTestSubmitted && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-bold text-sm">
              5-Minute Warning: Waktu tes tersisa kurang dari 5 menit! Periksa kembali jawaban Anda.
            </span>
          </div>
          <button
            onClick={() => setShowFiveMinWarning(false)}
            className="text-xs px-2 py-1 rounded bg-rose-200 dark:bg-rose-900 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Control Top Bar (Exam Focus HUD vs Standard Control Bar) */}
      {isExamFocus ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 mb-2.5 shadow-xs flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left: Test Identification */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Exam Focus Mode
              </span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-sm">
              {selectedPassage.title}
            </span>
          </div>

          {/* Center: Timer & Answered Progress */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-sm font-bold ${
              testMode === 'simulation' && timeLeft < 300
                ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{testMode === 'simulation' ? formatTime(timeLeft) : formatTime(elapsedTime)}</span>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {answeredCount}/{selectedPassage.questions.length} answered
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!isTestStarted && !isTestSubmitted && (
              <button
                onClick={() => setIsTestStarted(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start</span>
              </button>
            )}
            {isTestStarted && !isTestSubmitted && (
              <button
                onClick={handleSubmitTest}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            )}
            <button
              onClick={toggleExamFocus}
              title="Exit Exam Focus (Esc)"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Focus (Esc)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Test Info & Select */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                  {selectedPassage.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{selectedPassage.topic}</span>
                  <span>•</span>
                  <span>{selectedPassage.wordCount} words</span>
                  <span>•</span>
                  <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedPassage.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Curated Switcher */}
            <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
              {curatedPassages.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPassage(p)}
                  disabled={isTestStarted && !isTestSubmitted}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedPassage.id === p.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Passage {idx + 1}
                </button>
              ))}

              {/* AI Generator Button */}
              <button
                onClick={() => setShowAiModal(true)}
                disabled={isTestStarted && !isTestSubmitted}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Passage</span>
              </button>
            </div>
          </div>

          {/* Right: Mode, Timer, Exam Focus & Actions */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setTestMode('practice')}
                disabled={isTestStarted}
                className={`px-3 py-1 rounded-md transition-all ${
                  testMode === 'practice'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Practice (Untimed)
              </button>
              <button
                onClick={() => setTestMode('simulation')}
                disabled={isTestStarted}
                className={`px-3 py-1 rounded-md transition-all ${
                  testMode === 'simulation'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Simulation (60m)
              </button>
            </div>

            {/* Timer Display */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${
              testMode === 'simulation' && timeLeft < 300
                ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{testMode === 'simulation' ? formatTime(timeLeft) : formatTime(elapsedTime)}</span>
            </div>

            {/* Exam Focus Toggle Button */}
            <button
              onClick={toggleExamFocus}
              title="Enter Fullscreen Exam Focus Mode"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-xs transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Exam Focus</span>
            </button>

            {/* Start Test Button if not started */}
            {!isTestStarted && !isTestSubmitted && (
              <button
                onClick={() => setIsTestStarted(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Test</span>
              </button>
            )}

            {/* Submit Test Button if in progress */}
            {isTestStarted && !isTestSubmitted && (
              <button
                onClick={handleSubmitTest}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit ({answeredCount}/{selectedPassage.questions.length})</span>
              </button>
            )}

            {/* Retake button if already submitted */}
            {isTestSubmitted && (
              <button
                onClick={() => {
                  setIsTestSubmitted(false);
                  setUserAnswers({});
                  setIsTestStarted(true);
                  setTimeLeft(60 * 60);
                  setElapsedTime(0);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post-Submission Band Score Banner */}
      {isTestSubmitted && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Completed</span>
              </span>
              <h2 className="text-2xl font-black">
                Reading Academic Performance
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-xl">
                Pembahasan lengkap per soal, kutipan teks pendukung, dan penjelasan dalam bahasa Indonesia tersedia di panel kanan.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Raw Score
                </div>
                <div className="text-3xl font-extrabold">
                  {selectedPassage.questions.filter(q => {
                    const u = (userAnswers[q.id] || '').trim().toLowerCase();
                    const c = q.correctAnswer.toLowerCase();
                    const acc = (q.acceptableAnswers || []).map(a => a.toLowerCase());
                    return u === c || acc.includes(u);
                  }).length} / {selectedPassage.questions.length}
                </div>
              </div>

              <div className="h-10 w-px bg-indigo-700" />

              <div className="text-center bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                  IELTS Band
                </div>
                <div className="text-4xl font-black text-amber-300">
                  {aiService.calculateIeltsBandScore(
                    selectedPassage.questions.filter(q => {
                      const u = (userAnswers[q.id] || '').trim().toLowerCase();
                      const c = q.correctAnswer.toLowerCase();
                      const acc = (q.acceptableAnswers || []).map(a => a.toLowerCase());
                      return u === c || acc.includes(u);
                    }).length,
                    selectedPassage.questions.length
                  ).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout: Passage (Left) & Questions (Right) */}
      <div className={isExamFocus ? "grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
        
        {/* Left Column: Academic Passage */}
        <div className={`lg:col-span-7 flex flex-col ${isExamFocus ? 'h-full min-h-0 overflow-hidden' : ''}`}>
          <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col ${isExamFocus ? 'h-full flex-1' : 'h-[750px]'} overflow-hidden`}>
            
            {/* Passage Toolbar */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">READING PASSAGE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Select text to highlight
                </span>
              </div>

              {/* Text formatting & Highlighter tools */}
              <div className="flex items-center gap-2">
                {/* Font Size Adjuster */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-1 font-bold ${fontSize === 'sm' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-1 font-bold ${fontSize === 'base' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-1 font-bold ${fontSize === 'lg' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    A+
                  </button>
                </div>

                {/* Highlighter button */}
                <button
                  onClick={handleTextHighlight}
                  title="Highlight selected text"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlight</span>
                </button>
              </div>
            </div>

            {/* Passage Body */}
            <div 
              ref={passageContainerRef}
              className={`p-6 sm:p-8 overflow-y-auto space-y-6 leading-relaxed select-text ${
                fontSize === 'sm' ? 'text-xs sm:text-sm' : fontSize === 'base' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
              } text-slate-800 dark:text-slate-200`}
            >
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800">
                {selectedPassage.title}
              </h2>

              {selectedPassage.paragraphs.map((p) => (
                <div key={p.letter} id={`para-${p.letter}`} className="relative pl-7 group">
                  {/* Paragraph Letter Badge */}
                  <span className="absolute left-0 top-0 font-extrabold text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    [{p.letter}]
                  </span>
                  <p className="text-justify font-serif tracking-normal">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Paragraph Jump Chips */}
            <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold whitespace-nowrap">Jump:</span>
              {selectedPassage.paragraphs.map(p => (
                <button
                  key={p.letter}
                  onClick={() => {
                    const el = document.getElementById(`para-${p.letter}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 font-bold"
                >
                  [{p.letter}]
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: IELTS Questions & Pembahasan */}
        <div className={`lg:col-span-5 flex flex-col ${isExamFocus ? 'h-full min-h-0 overflow-hidden' : ''}`}>
          <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col ${isExamFocus ? 'h-full flex-1' : 'h-[750px]'} overflow-hidden`}>
            
            {/* Question Quick Palette Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase">
                Questions ({selectedPassage.questions.length})
              </span>
              <div className="flex items-center gap-1.5">
                {selectedPassage.questions.map(q => {
                  const isAnswered = !!(userAnswers[q.id]?.trim());
                  const isActive = activeQuestionId === q.id;
                  
                  let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                  if (isTestSubmitted) {
                    const u = (userAnswers[q.id] || '').trim().toLowerCase();
                    const c = q.correctAnswer.toLowerCase();
                    const acc = (q.acceptableAnswers || []).map(a => a.toLowerCase());
                    const ok = u === c || acc.includes(u);
                    badgeColor = ok
                      ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                      : 'bg-rose-500 text-white border-rose-600 font-bold';
                  } else if (isAnswered) {
                    badgeColor = 'bg-indigo-600 text-white border-indigo-700 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${badgeColor} ${
                        isActive ? 'ring-2 ring-indigo-500 scale-105' : ''
                      }`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions List / Focus Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Optional Headings List Reference */}
              {selectedPassage.headingsList && selectedPassage.headingsList.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    List of Headings (Roman Numerals):
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {selectedPassage.headingsList.map(h => (
                      <div key={h.id} className="flex items-start gap-2">
                        <span className="font-bold font-serif text-indigo-600 dark:text-indigo-400 w-6">
                          {h.id}.
                        </span>
                        <span>{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render each Question */}
              {selectedPassage.questions.map((q) => {
                const uAnswer = userAnswers[q.id] || '';
                const isAnswered = uAnswer.trim() !== '';

                // Scoring check
                const lowerU = uAnswer.trim().toLowerCase();
                const lowerC = q.correctAnswer.toLowerCase();
                const acceptable = (q.acceptableAnswers || []).map(a => a.toLowerCase());
                const isCorrect = lowerU === lowerC || acceptable.includes(lowerU);

                return (
                  <div
                    key={q.id}
                    id={`question-box-${q.id}`}
                    className={`p-5 rounded-2xl border transition-all ${
                      activeQuestionId === q.id
                        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {q.number}
                        </span>
                        <span className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-400">
                          {q.type === 'tfng' ? 'True / False / Not Given' : q.type === 'matching_headings' ? 'Matching Headings' : q.type === 'multiple_choice' ? 'Multiple Choice' : 'Sentence Completion'}
                        </span>
                      </div>

                      {/* Paragraph jump target */}
                      {q.paragraphTarget && (
                        <button
                          onClick={() => {
                            const el = document.getElementById(`para-${q.paragraphTarget}`);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700"
                        >
                          Find in [{q.paragraphTarget}]
                        </button>
                      )}
                    </div>

                    {/* Instruction */}
                    <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-2">
                      {q.instruction}
                    </p>

                    {/* Question Statement / Prompt */}
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      {q.statement || q.question}
                    </p>

                    {/* Interactive Input based on Question Type */}
                    <div className="space-y-2 mb-4">
                      {/* 1. True / False / Not Given */}
                      {q.type === 'tfng' && (
                        <div className="grid grid-cols-3 gap-2">
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => {
                            const isSelected = uAnswer === opt;
                            let style = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                            if (isTestSubmitted) {
                              if (opt === q.correctAnswer) {
                                style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (isSelected) {
                                style = 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-bold';
                              } else {
                                style = 'opacity-40 border-slate-200 dark:border-slate-800';
                              }
                            } else if (isSelected) {
                              style = 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs';
                            }

                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                disabled={isTestSubmitted}
                                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. Matching Headings */}
                      {q.type === 'matching_headings' && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options || ['i', 'ii', 'iii', 'iv', 'v', 'vi']).map(opt => {
                            const isSelected = uAnswer === opt;
                            let style = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
                            if (isTestSubmitted) {
                              if (opt === q.correctAnswer) {
                                style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (isSelected) {
                                style = 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200';
                              } else {
                                style = 'opacity-40 border-slate-200 dark:border-slate-800';
                              }
                            } else if (isSelected) {
                              style = 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs';
                            }

                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                disabled={isTestSubmitted}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-serif font-bold transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Multiple Choice */}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {(q.options || []).map(opt => {
                            const optLetter = opt.charAt(0);
                            const isSelected = uAnswer === optLetter;
                            let style = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';
                            if (isTestSubmitted) {
                              if (optLetter === q.correctAnswer) {
                                style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-semibold';
                              } else if (isSelected) {
                                style = 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-semibold';
                              } else {
                                style = 'opacity-40 border-slate-200 dark:border-slate-800';
                              }
                            } else if (isSelected) {
                              style = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold ring-1 ring-indigo-500';
                            }

                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswerChange(q.id, optLetter)}
                                disabled={isTestSubmitted}
                                className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-2.5 ${style}`}
                              >
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {optLetter}.
                                </span>
                                <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. Sentence Completion */}
                      {q.type === 'sentence_completion' && (
                        <div>
                          <input
                            type="text"
                            value={uAnswer}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={isTestSubmitted}
                            placeholder="Type exact word(s) from passage..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Post-Submission Review (Pembahasan) */}
                    {isTestSubmitted && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {/* Result Verdict Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct! (Jawaban Benar)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Incorrect (Kurang Tepat)</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            Jawaban Resmi: <strong className="text-slate-900 dark:text-white">{q.correctAnswer}</strong>
                          </span>
                        </div>

                        {/* Supporting Quote in English */}
                        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                            Kutipan Teks Pendukung (Supporting Quote):
                          </span>
                          <p className="italic text-slate-700 dark:text-slate-300 font-serif">
                            "{q.supportingQuote}"
                          </p>
                        </div>

                        {/* Indonesian Explanation with English key terms */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Pembahasan & Analisis Soal (Indonesian):
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {q.explanationId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Featured Passage Vocabulary (Add to deck) */}
              {selectedPassage.featuredVocab && selectedPassage.featuredVocab.length > 0 && (
                <div className="mt-8 p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Academic Vocabulary from this Passage</span>
                    </h3>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                      Band 7.5 - 9.0 Lexicon
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedPassage.featuredVocab.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{v.word}</span>
                            <span className="text-[10px] italic text-slate-500">({v.partOfSpeech})</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {v.indonesianMeaning} — <span className="italic">{v.definition}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onAddVocabWord({
                              word: v.word,
                              partOfSpeech: v.partOfSpeech,
                              definition: v.definition,
                              indonesianMeaning: v.indonesianMeaning,
                              example: v.example,
                              synonyms: v.synonyms,
                              theme: selectedPassage.topic,
                              status: 'learning',
                            });
                          }}
                          title="Add to personal vocabulary deck"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 flex-shrink-0"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Add to Deck</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Answered: <strong className="text-slate-800 dark:text-slate-200">{answeredCount}</strong> of {selectedPassage.questions.length}
              </span>

              {!isTestSubmitted ? (
                <button
                  onClick={handleSubmitTest}
                  disabled={!isTestStarted}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isTestStarted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    const nextIndex = (curatedPassages.findIndex(p => p.id === selectedPassage.id) + 1) % curatedPassages.length;
                    setSelectedPassage(curatedPassages[nextIndex]);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span>Next Passage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* AI Passage Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Generate Academic Reading with AI
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
              Enter an academic subject or pick a topic below. The AI will generate a fresh 700-word passage with True/False/Not Given, Matching Headings, and Indonesian explanations.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Topic:
              </label>
              <input
                type="text"
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                placeholder="e.g. Deep Ocean Geothermal Vents, Renaissance Cryptography..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Preset Topics */}
            <div className="mb-6">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">Preset Academic Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Ancient Mesopotamian Irrigation',
                  'Neuroplasticity & Memory Consolidation',
                  'Quantum Metrology in Astronomy',
                  'The Rise of Vertical Urban Farming',
                  'Linguistic Relativity and Thought'
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAiTopicInput(preset)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-slate-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {aiError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {aiError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isLoadingAi}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateAiPassage()}
                disabled={isLoadingAi}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                {isLoadingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Passage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
