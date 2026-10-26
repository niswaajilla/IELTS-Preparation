import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { DailySessionView } from './components/DailySessionView.tsx';
import { ReadingModule } from './components/ReadingModule.tsx';
import { VocabularyModule } from './components/VocabularyModule.tsx';
import { ProgressModule } from './components/ProgressModule.tsx';
import { ListeningPreview, WritingPreview, SpeakingPreview } from './components/SkillPlaceholders.tsx';
import {
  VocabWord,
  UserProgress,
  TestSessionResult,
  DailySessionRecord,
  ReadingPassage,
  QuestionType
} from './types/index.ts';
import { storageService, initialProgress } from './services/storage.ts';
import { initialVocabList } from './data/defaultVocab.ts';
import { aiService } from './services/aiService.ts';
import { fullscreenService } from './services/fullscreenService.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [vocabList, setVocabList] = useState<VocabWord[]>(initialVocabList);
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cross-component launching for Reading from Daily Session
  const [targetedPassage, setTargetedPassage] = useState<ReadingPassage | undefined>(undefined);
  const [onReadingFinishCb, setOnReadingFinishCb] = useState<
    ((correct: number, total: number, band: number, featuredWords: string[]) => void) | undefined
  >(undefined);

  // Sync fullscreen state with browser events
  useEffect(() => {
    setIsFullscreen(fullscreenService.isFullscreen());
    const unsubscribe = fullscreenService.onChange((isFull) => {
      setIsFullscreen(isFull);
    });
    return unsubscribe;
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load persistent data from window.storage
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedVocab, loadedProgress] = await Promise.all([
          storageService.getVocabList(),
          storageService.getUserProgress(),
        ]);
        if (loadedVocab && loadedVocab.length > 0) {
          setVocabList(loadedVocab);
        }
        if (loadedProgress) {
          setProgress(loadedProgress);
        }
      } catch (err) {
        console.error('Failed to load storage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update vocabulary list and persist
  const handleUpdateVocab = (updated: VocabWord[]) => {
    setVocabList(updated);
    storageService.saveVocabList(updated);
  };

  // Add new word
  const handleAddVocabWord = (wordData: Partial<VocabWord>) => {
    // Check if word already exists
    const exists = vocabList.some(
      v => v.word.toLowerCase() === (wordData.word || '').toLowerCase()
    );
    if (exists) {
      const updated = vocabList.map(v =>
        v.word.toLowerCase() === (wordData.word || '').toLowerCase()
          ? { ...v, status: (wordData.status || 'learning'), needsReview: false }
          : v
      );
      handleUpdateVocab(updated);
      return;
    }

    const newWord: VocabWord = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: wordData.word || 'ubiquitous',
      partOfSpeech: wordData.partOfSpeech || 'adjective',
      definition: wordData.definition || 'Present everywhere.',
      indonesianMeaning: wordData.indonesianMeaning || 'Ada di mana-mana.',
      synonyms: wordData.synonyms || [],
      example: wordData.example || 'This is an example sentence.',
      theme: wordData.theme || 'Academic General',
      status: wordData.status || 'new',
      needsReview: false,
      missedCount: 0,
      lastPracticed: new Date().toISOString().split('T')[0],
    };

    const updated = [newWord, ...vocabList];
    handleUpdateVocab(updated);
  };

  // Save practice test result
  const handleSaveTestResult = (result: TestSessionResult) => {
    const today = new Date().toISOString().split('T')[0];

    setProgress(prev => {
      // Calculate updated question type accuracy
      const newStats = { ...prev.questionTypeStats };
      result.questionBreakdown.forEach(item => {
        const current = newStats[item.type] || { correct: 0, total: 0 };
        newStats[item.type] = {
          correct: current.correct + (item.isCorrect ? 1 : 0),
          total: current.total + 1,
        };
      });

      // Recalculate Reading band average
      const pastReadingBands = [
        ...prev.history.filter(h => h.skill === 'reading').map(h => h.bandScore),
        result.bandScore,
      ];
      const avgReadingBand =
        pastReadingBands.reduce((a, b) => a + b, 0) / pastReadingBands.length;

      const updatedProgress: UserProgress = {
        ...prev,
        testsCompletedCount: prev.testsCompletedCount + 1,
        lastActiveDate: today,
        activityDates: prev.activityDates.includes(today)
          ? prev.activityDates
          : [...prev.activityDates, today],
        estimatedBands: {
          ...prev.estimatedBands,
          reading: Number(avgReadingBand.toFixed(1)),
          overall: Number(
            (
              (avgReadingBand +
                prev.estimatedBands.listening +
                prev.estimatedBands.writing +
                prev.estimatedBands.speaking) /
              4
            ).toFixed(1)
          ),
        },
        questionTypeStats: newStats,
        history: [result, ...prev.history],
      };

      storageService.saveUserProgress(updatedProgress);
      return updatedProgress;
    });
  };

  // Save Daily Session completion record
  const handleDailySessionComplete = (session: DailySessionRecord) => {
    const today = new Date().toISOString().split('T')[0];

    setProgress(prev => {
      // Check streak: if last active was yesterday, increment streak; if today, keep same
      let newStreak = prev.streak;
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterday) {
          newStreak = prev.streak + 1;
        } else if (!prev.lastActiveDate) {
          newStreak = 1;
        }
      }

      const updated: UserProgress = {
        ...prev,
        streak: newStreak,
        lastActiveDate: today,
        activityDates: prev.activityDates.includes(today)
          ? prev.activityDates
          : [...prev.activityDates, today],
        totalSessionsCompleted: prev.totalSessionsCompleted + 1,
        dailySessions: [session, ...prev.dailySessions],
      };

      storageService.saveUserProgress(updated);
      return updated;
    });
  };

  // Reset all data handler
  const handleResetData = async () => {
    await storageService.resetAll();
    setVocabList(initialVocabList);
    setProgress(initialProgress);
  };

  // Launch reading test specifically from Daily Session flow
  const handleLaunchReadingFromDaily = (
    passage?: ReadingPassage,
    onFinish?: (correct: number, total: number, band: number, featuredWords: string[]) => void
  ) => {
    if (passage) setTargetedPassage(passage);
    setOnReadingFinishCb(() => onFinish);
    setActiveTab('reading');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading IELTS PrepMaster...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Persistent Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={progress.streak}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onStartDailySession={() => setActiveTab('daily-session')}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => fullscreenService.toggleFullscreen()}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            progress={progress}
            vocabList={vocabList}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartDailySession={() => setActiveTab('daily-session')}
          />
        )}

        {activeTab === 'daily-session' && (
          <DailySessionView
            vocabList={vocabList}
            onUpdateVocab={handleUpdateVocab}
            onSessionComplete={handleDailySessionComplete}
            onLaunchReadingTest={handleLaunchReadingFromDaily}
            onGoToReadingTab={() => setActiveTab('reading')}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingModule
            initialPassage={targetedPassage}
            onSaveResult={handleSaveTestResult}
            onAddVocabWord={handleAddVocabWord}
            onFinishCallback={onReadingFinishCb}
          />
        )}

        {activeTab === 'listening' && <ListeningPreview />}
        {activeTab === 'writing' && <WritingPreview />}
        {activeTab === 'speaking' && <SpeakingPreview />}

        {activeTab === 'vocabulary' && (
          <VocabularyModule
            vocabList={vocabList}
            onUpdateVocab={handleUpdateVocab}
            onAddWord={handleAddVocabWord}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressModule
            progress={progress}
            vocabList={vocabList}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Calm, Minimal Academic Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">IELTS PrepMaster</span>
            <span>•</span>
            <span>Academic Training Suite</span>
          </div>
          <div className="text-[11px]">
            Explanations in Bahasa Indonesia with English key terminology • Cambridge Academic Standard
          </div>
        </div>
      </footer>

    </div>
  );
}
