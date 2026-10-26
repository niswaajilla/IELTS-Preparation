import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { UserProgress, VocabWord, QuestionType } from '../types/index.ts';

interface ProgressModuleProps {
  progress: UserProgress;
  vocabList: VocabWord[];
  onResetData: () => void;
}

export const ProgressModule: React.FC<ProgressModuleProps> = ({
  progress,
  vocabList,
  onResetData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Question type names & labels
  const questionTypeLabels: Record<QuestionType, { title: string; desc: string }> = {
    tfng: {
      title: 'True / False / Not Given',
      desc: 'Identifying factual claims and author views.'
    },
    matching_headings: {
      title: 'Matching Headings',
      desc: 'Identifying main theme / macro idea per paragraph.'
    },
    multiple_choice: {
      title: 'Multiple Choice',
      desc: 'Selecting detailed specific arguments among 4 options.'
    },
    sentence_completion: {
      title: 'Sentence / Summary Completion',
      desc: 'Scanning exact words with strict word count limits.'
    }
  };

  // Vocab metrics
  const totalVocab = vocabList.length;
  const masteredVocab = vocabList.filter(v => v.status === 'mastered').length;
  const learningVocab = vocabList.filter(v => v.status === 'learning').length;
  const reviewVocab = vocabList.filter(v => v.needsReview).length;
  const vocabMasteryPct = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Personal Progress & Band Score Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Track your official IELTS Academic band estimates, question-type accuracy, and daily learning consistency.
          </p>
        </div>

        {/* Reset Data Button */}
        <div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Progress Data</span>
          </button>
        </div>
      </div>

      {/* Grid: Band Score Estimates & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        
        {/* Estimated Band Scores Card */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Official Scale Benchmark
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Estimated IELTS Academic Band
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Overall Target:</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                Band {progress.estimatedBands.overall.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Reading */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Reading
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {progress.estimatedBands.reading.toFixed(1)}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase mt-1">
                Active Assessment
              </div>
            </div>

            {/* Listening */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center opacity-85">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Listening
              </div>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">
                {progress.estimatedBands.listening.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                Initial Baseline
              </div>
            </div>

            {/* Writing */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center opacity-85">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Writing
              </div>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">
                {progress.estimatedBands.writing.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                Initial Baseline
              </div>
            </div>

            {/* Speaking */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center opacity-85">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Speaking
              </div>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">
                {progress.estimatedBands.speaking.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                Initial Baseline
              </div>
            </div>
          </div>
        </div>

        {/* Streak & Consistency Card */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Consistency Tracker
              </span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {progress.streak} <span className="text-base font-semibold text-slate-500">days streak</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Keep your daily study rhythm! Completing 1 daily session (Entry Ticket + Practice + Exit Ticket) sustains your streak.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Practice Tests:</span>
            <span className="font-bold text-slate-900 dark:text-white">{progress.testsCompletedCount} completed</span>
          </div>
        </div>

      </div>

      {/* Question Type Accuracy Breakdown (Pinpoint Weaknesses) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Diagnostic Analysis
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Accuracy by Question Type (Analisis Kelemahan Soal)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identifikasi tipe soal yang membutuhkan perhatian ekstra berdasarkan riwayat pengerjaan tes Anda.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {(['tfng', 'matching_headings', 'multiple_choice', 'sentence_completion'] as QuestionType[]).map(type => {
            const stats = progress.questionTypeStats[type] || { correct: 0, total: 0 };
            const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            const info = questionTypeLabels[type];

            let barColor = 'bg-indigo-600';
            let statusLabel = 'Belum Cukup Data';
            if (stats.total > 0) {
              if (pct >= 80) {
                barColor = 'bg-emerald-500';
                statusLabel = 'Kuat (High Accuracy)';
              } else if (pct >= 60) {
                barColor = 'bg-amber-500';
                statusLabel = 'Cukup (Moderate)';
              } else {
                barColor = 'bg-rose-500';
                statusLabel = 'Perlu Ditingkatkan (Needs Focus)';
              }
            }

            return (
              <div key={type} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {info.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {info.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {stats.correct} / {stats.total} correct
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {stats.total > 0 ? `${pct}%` : '—'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      pct < 60 && stats.total > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${stats.total > 0 ? pct : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Mastery Ratio Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Lexical Resource
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Vocabulary Mastery Progress
            </h2>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {vocabMasteryPct}% Mastered
          </span>
        </div>

        {/* Multi-segmented Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
          <div
            title="Mastered"
            className="bg-emerald-500 h-full"
            style={{ width: `${(masteredVocab / (totalVocab || 1)) * 100}%` }}
          />
          <div
            title="Learning"
            className="bg-indigo-500 h-full"
            style={{ width: `${(learningVocab / (totalVocab || 1)) * 100}%` }}
          />
          <div
            title="Needs Review"
            className="bg-amber-500 h-full"
            style={{ width: `${(reviewVocab / (totalVocab || 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Mastered: <strong className="text-slate-900 dark:text-white">{masteredVocab}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-400">Learning: <strong className="text-slate-900 dark:text-white">{learningVocab}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">Needs Review: <strong className="text-slate-900 dark:text-white">{reviewVocab}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-slate-600 dark:text-slate-400">Total in Deck: <strong className="text-slate-900 dark:text-white">{totalVocab}</strong></span>
          </div>
        </div>
      </div>

      {/* Practice Test Session History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Recent Test Sessions History
        </h2>

        {progress.history.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm text-slate-500">
              Belum ada riwayat tes latihan. Mulai dengan menyelesaikan satu tes di tab Reading atau Daily Session!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {progress.history.slice(0, 10).map((h) => (
              <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {h.testTitle}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {h.mode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{h.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.round(h.timeSpentSeconds / 60)} mins</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Score</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {h.score} / {h.total}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-black text-sm">
                    Band {h.bandScore.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Reset All Progress Data?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Tindakan ini akan menghapus riwayat tes latihan, catatan daily session, dan mengembalikan kosakata ke daftar bawaan awal. Data yang tersimpan di storage akan diatur ulang.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
