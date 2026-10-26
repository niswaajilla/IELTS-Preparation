import { VocabWord, UserProgress } from '../types/index.ts';
import { initialVocabList } from '../data/defaultVocab.ts';

// Key names
const STORAGE_KEYS = {
  VOCAB: 'ielts_academic_vocab_v1',
  PROGRESS: 'ielts_academic_progress_v1',
  SETTINGS: 'ielts_academic_settings_v1',
};

// Polyfill window.storage if absent so that window.storage is ALWAYS the persistent artifact layer
if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.storage) {
    win.storage = {
      async get(key: string): Promise<any> {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.warn('Storage get fallback error:', e);
          return null;
        }
      },
      async set(key: string, value: any): Promise<void> {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.warn('Storage set fallback error:', e);
        }
      },
      async remove(key: string): Promise<void> {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Storage remove error:', e);
        }
      },
      async clear(): Promise<void> {
        try {
          localStorage.removeItem(STORAGE_KEYS.VOCAB);
          localStorage.removeItem(STORAGE_KEYS.PROGRESS);
          localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        } catch (e) {
          console.warn('Storage clear error:', e);
        }
      }
    };
  }
}

// Initial state for progress
export const initialProgress: UserProgress = {
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activityDates: [new Date().toISOString().split('T')[0]],
  totalSessionsCompleted: 0,
  testsCompletedCount: 0,
  estimatedBands: {
    reading: 6.5,
    listening: 6.5,
    writing: 6.0,
    speaking: 6.5,
    overall: 6.5,
  },
  questionTypeStats: {
    tfng: { correct: 0, total: 0 },
    matching_headings: { correct: 0, total: 0 },
    multiple_choice: { correct: 0, total: 0 },
    sentence_completion: { correct: 0, total: 0 },
  },
  history: [],
  dailySessions: [],
};

export const storageService = {
  async getVocabList(): Promise<VocabWord[]> {
    const win = window as any;
    if (win.storage && typeof win.storage.get === 'function') {
      try {
        const stored = await win.storage.get(STORAGE_KEYS.VOCAB);
        if (stored && Array.isArray(stored) && stored.length > 0) {
          return stored;
        }
      } catch (err) {
        console.error('Error reading from window.storage:', err);
      }
    }
    // Return initial list and persist it
    await this.saveVocabList(initialVocabList);
    return initialVocabList;
  },

  async saveVocabList(vocabList: VocabWord[]): Promise<void> {
    const win = window as any;
    if (win.storage && typeof win.storage.set === 'function') {
      try {
        await win.storage.set(STORAGE_KEYS.VOCAB, vocabList);
      } catch (err) {
        console.error('Error writing to window.storage:', err);
      }
    }
  },

  async getUserProgress(): Promise<UserProgress> {
    const win = window as any;
    if (win.storage && typeof win.storage.get === 'function') {
      try {
        const stored = await win.storage.get(STORAGE_KEYS.PROGRESS);
        if (stored && typeof stored === 'object') {
          return {
            ...initialProgress,
            ...stored,
            questionTypeStats: {
              ...initialProgress.questionTypeStats,
              ...(stored.questionTypeStats || {}),
            },
            estimatedBands: {
              ...initialProgress.estimatedBands,
              ...(stored.estimatedBands || {}),
            },
          };
        }
      } catch (err) {
        console.error('Error reading progress from window.storage:', err);
      }
    }
    await this.saveUserProgress(initialProgress);
    return initialProgress;
  },

  async saveUserProgress(progress: UserProgress): Promise<void> {
    const win = window as any;
    if (win.storage && typeof win.storage.set === 'function') {
      try {
        await win.storage.set(STORAGE_KEYS.PROGRESS, progress);
      } catch (err) {
        console.error('Error writing progress to window.storage:', err);
      }
    }
  },

  async resetAll(): Promise<void> {
    const win = window as any;
    if (win.storage) {
      if (typeof win.storage.remove === 'function') {
        await win.storage.remove(STORAGE_KEYS.VOCAB);
        await win.storage.remove(STORAGE_KEYS.PROGRESS);
        await win.storage.remove(STORAGE_KEYS.SETTINGS);
      } else if (typeof win.storage.set === 'function') {
        await win.storage.set(STORAGE_KEYS.VOCAB, initialVocabList);
        await win.storage.set(STORAGE_KEYS.PROGRESS, initialProgress);
      }
    }
    await this.saveVocabList(initialVocabList);
    await this.saveUserProgress(initialProgress);
  },
};
