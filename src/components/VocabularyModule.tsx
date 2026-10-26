import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Sparkles,
  Volume2,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { VocabWord, VocabStatus } from '../types/index.ts';
import { ttsService } from '../services/ttsService.ts';
import { aiService } from '../services/aiService.ts';

interface VocabularyModuleProps {
  vocabList: VocabWord[];
  onUpdateVocab: (updated: VocabWord[]) => void;
  onAddWord: (word: Partial<VocabWord>) => void;
}

export const VocabularyModule: React.FC<VocabularyModuleProps> = ({
  vocabList,
  onUpdateVocab,
  onAddWord,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active flashcard flip state: track flipped card IDs
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Add Manual Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('verb');
  const [newDefinition, setNewDefinition] = useState('');
  const [newIndonesian, setNewIndonesian] = useState('');
  const [newSynonyms, setNewSynonyms] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newTheme, setNewTheme] = useState('Academic Science');

  // AI Theme Generator Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSelectedTheme, setAiSelectedTheme] = useState('Environment & Ecology');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Themes list
  const themes = [
    'all',
    'Environment & Ecology',
    'Technology & AI',
    'Economy & Development',
    'Education & Pedagogy',
    'Health & Psychology',
    'Science & Research',
    'Law & Governance',
    'History & Archaeology',
  ];

  // Filtered words
  const filteredWords = vocabList.filter(item => {
    // Status filter
    if (statusFilter === 'needs_review' && !item.needsReview) return false;
    if (statusFilter !== 'all' && statusFilter !== 'needs_review' && item.status !== statusFilter) return false;

    // Theme filter
    if (selectedTheme !== 'all' && item.theme !== selectedTheme) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchMeaning = item.indonesianMeaning.toLowerCase().includes(q);
      const matchDef = item.definition.toLowerCase().includes(q);
      if (!matchWord && !matchMeaning && !matchDef) return false;
    }

    return true;
  });

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStatusChange = (id: string, newStatus: VocabStatus) => {
    const updated = vocabList.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: newStatus,
          needsReview: newStatus === 'mastered' ? false : v.needsReview,
        };
      }
      return v;
    });
    onUpdateVocab(updated);
  };

  const handleClearReview = (id: string) => {
    const updated = vocabList.map(v =>
      v.id === id ? { ...v, needsReview: false } : v
    );
    onUpdateVocab(updated);
  };

  const handleDeleteWord = (id: string) => {
    const updated = vocabList.filter(v => v.id !== id);
    onUpdateVocab(updated);
  };

  const handleManualAddSubmit = () => {
    if (!newWord.trim() || !newDefinition.trim() || !newIndonesian.trim()) return;

    onAddWord({
      word: newWord.trim().toLowerCase(),
      partOfSpeech: newPartOfSpeech,
      definition: newDefinition.trim(),
      indonesianMeaning: newIndonesian.trim(),
      example: newExample.trim() || `The researcher examined the ${newWord.trim()} phenomenon thoroughly.`,
      synonyms: newSynonyms.split(',').map(s => s.trim()).filter(Boolean),
      theme: newTheme,
      status: 'new',
    });

    // Reset fields
    setNewWord('');
    setNewDefinition('');
    setNewIndonesian('');
    setNewSynonyms('');
    setNewExample('');
    setShowAddModal(false);
  };

  const handleGenerateAiTheme = async () => {
    setIsGeneratingAi(true);
    try {
      const words = await aiService.generateThemeVocab(aiSelectedTheme);
      words.forEach(w => {
        onAddWord({
          ...w,
          status: 'learning',
        });
      });
      setShowAiModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Counts
  const totalCount = vocabList.length;
  const masteredCount = vocabList.filter(v => v.status === 'mastered').length;
  const learningCount = vocabList.filter(v => v.status === 'learning').length;
  const newCount = vocabList.filter(v => v.status === 'new').length;
  const needsReviewCount = vocabList.filter(v => v.needsReview).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner & Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookmarkCheck className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Academic Vocabulary Bank
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Interactive 3D flashcards with Oxford/Cambridge academic definitions, pronunciation, and Indonesian translations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Generator Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Academic Theme</span>
          </button>

          {/* Add Word Manual Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Stats & Quick Status Filter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Words</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('mastered')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'mastered'
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{masteredCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('learning')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'learning'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Learning</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{learningCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('new')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'new'
              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">New Added</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{newCount}</div>
        </button>

        {/* Needs Review Filter */}
        <button
          onClick={() => setStatusFilter('needs_review')}
          className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'needs_review'
              ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Perlu Diulang</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{needsReviewCount}</div>
        </button>
      </div>

      {/* Search & Theme Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search word, meaning, or definition..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Theme Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Theme:</span>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {themes.map(t => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Themes' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid: 3D Flip Flashcards */}
      {filteredWords.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No vocabulary matches your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching themes or clearing the search box.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWords.map((item) => {
            const isFlipped = !!flippedCards[item.id];

            return (
              <div
                key={item.id}
                className="relative h-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Needs Review Badge */}
                {item.needsReview && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <AlertCircle className="w-3 h-3" />
                      <span>Perlu Diulang ({item.missedCount || 1}x salah)</span>
                    </span>
                  </div>
                )}

                {/* Flip Trigger Header Button */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => ttsService.speak(item.word)}
                      title="Audio Pronunciation"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFlip(item.id)}
                      title="Flip flashcard"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div
                  onClick={() => toggleFlip(item.id)}
                  className="p-5 flex-1 flex flex-col justify-center cursor-pointer select-none"
                >
                  {!isFlipped ? (
                    /* FRONT OF FLASHCARD */
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {item.word}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs italic text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60">
                          {item.partOfSpeech}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs font-mono text-slate-500">
                            {item.phonetic}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto line-clamp-2 mt-2">
                        {item.definition}
                      </p>
                      <div className="pt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                        Click card to see Indonesian meaning & example
                      </div>
                    </div>
                  ) : (
                    /* BACK OF FLASHCARD */
                    <div className="text-left space-y-2.5 overflow-y-auto max-h-44 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Arti (Indonesian):</span>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                          {item.indonesianMeaning}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Academic Example:</span>
                        <p className="italic text-slate-600 dark:text-slate-400 font-serif leading-relaxed mt-0.5">
                          "{item.example}"
                        </p>
                      </div>

                      {item.synonyms && item.synonyms.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">Synonyms: </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {item.synonyms.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Status Controls & Dismiss review */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(item.id, 'learning')}
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase transition-colors ${
                        item.status === 'learning'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Learning
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'mastered')}
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase transition-colors ${
                        item.status === 'mastered'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Mastered
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.needsReview && (
                      <button
                        onClick={() => handleClearReview(item.id)}
                        title="Tandai sudah dipelajari (Clear review mark)"
                        className="text-[10px] font-bold text-amber-700 hover:underline px-1.5 py-0.5"
                      >
                        Clear Review
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteWord(item.id)}
                      title="Delete card"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Word Modal (No <form> tags used) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Add Academic Vocabulary Word
            </h3>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    English Word:
                  </label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="e.g. corroborate"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Part of Speech:
                  </label>
                  <select
                    value={newPartOfSpeech}
                    onChange={(e) => setNewPartOfSpeech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="verb">Verb</option>
                    <option value="noun">Noun</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arti / Makna dalam Bahasa Indonesia:
                </label>
                <input
                  type="text"
                  value={newIndonesian}
                  onChange={(e) => setNewIndonesian(e.target.value)}
                  placeholder="e.g. Memperkuat atau membuktikan kebenaran..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Definition (in English):
                </label>
                <textarea
                  rows={2}
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="e.g. To confirm or give support to a statement, theory, or finding..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Example Sentence:
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="e.g. Recent satellite imagery corroborates the climate model predictions."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Synonyms (separated by comma):
                </label>
                <input
                  type="text"
                  value={newSynonyms}
                  onChange={(e) => setNewSynonyms(e.target.value)}
                  placeholder="e.g. substantiate, validate, verify"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAddSubmit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                Save Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Academic Theme Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate Academic Lexicon
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Select an official IELTS Academic theme. The AI will generate 5 high-yield Band 7.5 - 9.0 vocabulary cards with definitions, Indonesian meanings, and academic collocations.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Theme:
              </label>
              <select
                value={aiSelectedTheme}
                onChange={(e) => setAiSelectedTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Environment & Ecology">Environment & Ecology</option>
                <option value="Technology & AI">Technology & AI</option>
                <option value="Economy & Development">Economy & Development</option>
                <option value="Education & Pedagogy">Education & Pedagogy</option>
                <option value="Health & Psychology">Health & Psychology</option>
                <option value="Law & Governance">Law & Governance</option>
                <option value="History & Archaeology">History & Archaeology</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiTheme}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Cards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate 5 Words</span>
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
