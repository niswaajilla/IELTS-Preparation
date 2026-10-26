import React from 'react';
import {
  CalendarCheck,
  BookOpen,
  BookmarkCheck,
  BarChart3,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Award,
  Lightbulb,
  CheckCircle2,
  Headphones,
  FileText,
  Mic
} from 'lucide-react';
import { UserProgress, VocabWord } from '../types/index.ts';

interface DashboardProps {
  progress: UserProgress;
  vocabList: VocabWord[];
  onNavigate: (tab: string) => void;
  onStartDailySession: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  vocabList,
  onNavigate,
  onStartDailySession,
}) => {
  const masteredCount = vocabList.filter(v => v.status === 'mastered').length;
  const needsReviewCount = vocabList.filter(v => v.needsReview).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome & Daily Routine Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Target: Band 7.5+ Academic Ready</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            IELTS Academic Personal Training Hub
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-8">
            Pertajam keterampilan membaca akademik, perkaya kosakata band tinggi, dan lacak konsistensi latihan harian Anda dengan alur tiket terstruktur.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartDailySession}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>Start Daily Routine (Entry Ticket)</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={() => onNavigate('reading')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40 font-semibold text-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Reading Hub</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Band */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Estimated Band</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {progress.estimatedBands.reading.toFixed(1)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Academic Reading Target</span>
          </div>
        </div>

        {/* Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {progress.streak} <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Active Study Discipline
          </div>
        </div>

        {/* Mastered Vocabulary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Mastered Vocab</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {masteredCount} <span className="text-sm font-semibold text-slate-500">/ {vocabList.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {needsReviewCount > 0 ? `${needsReviewCount} words need review` : 'All words reviewed'}
          </div>
        </div>

        {/* Tests Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Tests Completed</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {progress.testsCompletedCount}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Practice & Simulations
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Academic Reading */}
        <div 
          onClick={() => onNavigate('reading')}
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Core Suite
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
              Reading Academic
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Latihan teks 700 kata dengan soal True/False/Not Given, Matching Headings, dan Multiple Choice lengkap dengan pembahasan dan kutipan teks pendukung.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Launch Reading Test</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Vocabulary Deck */}
        <div 
          onClick={() => onNavigate('vocabulary')}
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                3D Flashcards
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
              Vocabulary Bank
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Kartu flash interaktif bertema akademik, audio pelafalan Web Speech, status New/Learning/Mastered, dan daftar otomatis "Perlu Diulang".
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Explore Vocabulary ({vocabList.length} words)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Diagnostic Progress */}
        <div 
          onClick={() => onNavigate('progress')}
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Analytics
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
              Progress & Weaknesses
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Analisis akurasi per tipe soal (TFNG, matching headings, dll.), riwayat sesi tes, dan estimasi band score resmi Cambridge IELTS.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>View Detailed Analytics</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* IELTS Academic Strategy of the Day */}
      <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            IELTS Academic Strategy: Membedakan FALSE vs NOT GIVEN
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
            <strong>FALSE:</strong> Informasi pada passage secara eksplisit <em>kontradiktif</em> atau bertolak belakang dengan pernyataan soal.<br />
            <strong>NOT GIVEN:</strong> Passage mungkin menyebut topik yang mirip, namun fakta spesifik yang ditanyakan <em>tidak pernah dikonfirmasi atau dibantah</em> oleh penulis. Jangan gunakan pengetahuan umum di luar teks!
          </p>
        </div>
      </div>

    </div>
  );
};
