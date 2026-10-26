import { ReadingPassage, VocabWord } from '../types/index.ts';
import { curatedPassages } from '../data/curatedPassages.ts';

export const aiService = {
  // Generate a reading test with AI, or safely fall back to curated authentic tests
  async generateReadingTest(topic?: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<ReadingPassage> {
    try {
      const response = await fetch('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.title && data.paragraphs && data.questions) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API generation unavailable or failed, falling back to curated passage library:', err);
    }

    // Curated fallback: pick an appropriate passage from our library
    const fallback = curatedPassages[Math.floor(Math.random() * curatedPassages.length)];
    return {
      ...fallback,
      id: `reading-curated-${Date.now()}`
    };
  },

  // Generate theme vocabulary
  async generateThemeVocab(theme: string): Promise<Partial<VocabWord>[]> {
    try {
      const response = await fetch('/api/vocab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, count: 5 }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('AI Vocab generation failed:', err);
    }

    // Pre-curated thematic fallbacks
    const themeFallbacks: Record<string, Partial<VocabWord>[]> = {
      'Environment & Ecology': [
        {
          word: 'biodegradable',
          phonetic: '/ˌbaɪ.əʊ.dɪˈɡreɪ.də.bəl/',
          partOfSpeech: 'adjective',
          definition: 'Capable of being decomposed by bacteria or other living organisms.',
          indonesianMeaning: 'Dapat terurai secara hayati oleh mikroorganisme.',
          synonyms: ['compostable', 'degradable', 'organic'],
          example: 'Packaging manufacturers are transitioning to fully biodegradable plant starch containers.',
          theme: 'Environment & Ecology'
        },
        {
          word: 'depletion',
          phonetic: '/dɪˈpliː.ʃən/',
          partOfSpeech: 'noun',
          definition: 'Reduction in the number or quantity of something.',
          indonesianMeaning: 'Penyusutan, pengurasan, atau penurunan jumlah sumber daya.',
          synonyms: ['exhaustion', 'reduction', 'consumption'],
          example: 'Overfishing has led to the drastic depletion of North Atlantic cod populations.',
          theme: 'Environment & Ecology'
        }
      ],
      'Technology & AI': [
        {
          word: 'autonomous',
          phonetic: '/ɔːˈtɒn.ə.məs/',
          partOfSpeech: 'adjective',
          definition: 'Acting independently or having the freedom to do so.',
          indonesianMeaning: 'Bekerja secara mandiri tanpa kendali langsung manusia.',
          synonyms: ['independent', 'self-governing', 'automated'],
          example: 'Autonomous electric delivery vehicles are undergoing extensive trials in smart cities.',
          theme: 'Technology & AI'
        },
        {
          word: 'paradigm',
          phonetic: '/ˈpær.ə.daɪm/',
          partOfSpeech: 'noun',
          definition: 'A typical example or pattern of something; a model.',
          indonesianMeaning: 'Paradigma, pola pikir, atau kerangka berpikir baku.',
          synonyms: ['model', 'archetype', 'framework', 'prototype'],
          example: 'Generative neural models represent a profound paradigm shift in software architecture.',
          theme: 'Technology & AI'
        }
      ]
    };

    return themeFallbacks[theme] || themeFallbacks['Environment & Ecology'];
  },

  // Calculate official IELTS Academic Reading Band Score (0.0 - 9.0)
  calculateIeltsBandScore(correct: number, total: number): number {
    if (total <= 0) return 0;
    const percentage = correct / total;

    if (percentage >= 0.95) return 9.0;
    if (percentage >= 0.90) return 8.5;
    if (percentage >= 0.85) return 8.0;
    if (percentage >= 0.77) return 7.5;
    if (percentage >= 0.70) return 7.0;
    if (percentage >= 0.63) return 6.5;
    if (percentage >= 0.55) return 6.0;
    if (percentage >= 0.45) return 5.5;
    if (percentage >= 0.38) return 5.0;
    if (percentage >= 0.30) return 4.5;
    if (percentage >= 0.22) return 4.0;
    return 3.5;
  }
};
