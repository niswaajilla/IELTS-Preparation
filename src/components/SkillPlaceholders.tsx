import React, { useState, useEffect } from 'react';
import {
  Headphones,
  FileText,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  Sparkles,
  BarChart,
  CheckCircle2,
  Eye,
  EyeOff,
  Square
} from 'lucide-react';
import { ttsService } from '../services/ttsService.ts';

// 1. Listening Preview & Interactive Audio Simulator
export const ListeningPreview: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [showScript, setShowScript] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const sampleDialogue = `
Welcome to the International University Student Housing Office. My name is Mark, and I'll be assisting you with your campus accommodation preferences for the upcoming autumn semester.
First, could you please confirm your full name and primary degree program?
"Yes, certainly. My name is Arthur Pendelton, and I am enrolled in the Master of Environmental Engineering program."
Excellent, Arthur. Now, regarding room types, we have standard single en-suite rooms in North Hall and shared twin studio apartments in West Gardens. North Hall is situated approximately eight hundred meters from the central engineering laboratory...
  `.trim();

  const handlePlayAudio = () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsService.speak(sampleDialogue, playbackSpeed).then(() => {
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Listening Section 1 Simulation
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                University Accommodation Registration
              </h2>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Interactive Audio Engine
          </span>
        </div>

        {/* Audio Player Control Card */}
        <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayAudio}
                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all"
              >
                {isPlaying ? <Square className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Web Speech API British Audio Stream</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isPlaying ? 'Playing authentic IELTS speech stream...' : 'Click to start monologue playback'}
                </p>
              </div>
            </div>

            {/* Speed Controller */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Speed:</span>
              {[0.8, 0.95, 1.2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {speed === 0.95 ? '1.0x' : `${speed}x`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Form Completion Sample */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Questions 1–2: Form Completion
          </h3>
          <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-4">
            Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.
          </p>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Degree Program:</span>
              <span className="font-medium text-slate-900 dark:text-white">Master of [ 1 ]</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Question 1 Answer:</span>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type answer here..."
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
              />
              <button
                onClick={() => setIsAnswerChecked(true)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Check Answer
              </button>
            </div>

            {isAnswerChecked && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Correct Answer:</span> Environmental Engineering (Arthur states: <em>"enrolled in the Master of Environmental Engineering program"</em>).
              </div>
            )}
          </div>
        </div>

        {/* Script Toggle (Hidden until completed) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col items-start gap-2">
          <button
            onClick={() => setShowScript(!showScript)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showScript ? 'Hide Audio Transcript' : 'Reveal Audio Transcript (IELTS Exam Rule: hidden until finished)'}</span>
          </button>

          {showScript && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed w-full">
              {sampleDialogue}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// 2. Writing Preview & Essay Word Counter
export const WritingPreview: React.FC = () => {
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [essayText, setEssayText] = useState('');
  
  // Word count calculation
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const targetWords = taskType === 'task1' ? 150 : 250;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                IELTS Academic Writing Studio
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Task 1 & Task 2 Evaluator
              </h2>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setTaskType('task1')}
              className={`px-3 py-1 rounded-md transition-all ${
                taskType === 'task1' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Task 1 (Chart/Report)
            </button>
            <button
              onClick={() => setTaskType('task2')}
              className={`px-3 py-1 rounded-md transition-all ${
                taskType === 'task2' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Task 2 (Essay)
            </button>
          </div>
        </div>

        {/* Prompt Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mb-4 text-xs sm:text-sm">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] block mb-1">
            Official Prompt:
          </span>
          {taskType === 'task2' ? (
            <p className="font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
              "Some people believe that university education should focus strictly on practical employment skills, while others argue that the main purpose of university is to acquire theoretical knowledge regardless of career outcomes. Discuss both views and give your own opinion."
            </p>
          ) : (
            <p className="font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
              "The chart illustrates the percentage of energy generated from renewable sources in four European nations between 2000 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
            </p>
          )}
        </div>

        {/* Live Word Counter Header */}
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-500">Essay Draft:</span>
          <span className={wordCount >= targetWords ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
            Word Count: {wordCount} / {targetWords} words minimum
          </span>
        </div>

        {/* Textarea without <form> */}
        <textarea
          rows={10}
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder={`Type your response here... (Aim for at least ${targetWords} words)`}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        {/* Official 4-Criteria Rubric Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-500 block">Criteria 1</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Task Achievement</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-500 block">Criteria 2</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Coherence & Cohesion</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-500 block">Criteria 3</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Lexical Resource</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-500 block">Criteria 4</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Grammar & Accuracy</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// 3. Speaking Preview & Cue Card Timer
export const SpeakingPreview: React.FC = () => {
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [isPrepRunning, setIsPrepRunning] = useState(false);
  const [speakSeconds, setSpeakSeconds] = useState(120);
  const [isSpeakRunning, setIsSpeakRunning] = useState(false);

  useEffect(() => {
    let t: any = null;
    if (isPrepRunning && prepSeconds > 0) {
      t = setInterval(() => setPrepSeconds(p => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [isPrepRunning, prepSeconds]);

  useEffect(() => {
    let t: any = null;
    if (isSpeakRunning && speakSeconds > 0) {
      t = setInterval(() => setSpeakSeconds(p => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [isSpeakRunning, speakSeconds]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Speaking Part 2 Cue Card Simulator
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Individual Long Turn
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Web Speech STT Ready
            </span>
          </div>
        </div>

        {/* Cue Card Frame */}
        <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-2">
            Candidate Cue Card:
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Describe a piece of technology that you find difficult to use.
          </h3>
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <p>You should say:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>What it is and when you first encountered it</li>
              <li>What you use it for</li>
              <li>Why you find it complicated or unintuitive</li>
              <li>And explain how you feel when having to operate this technology.</li>
            </ul>
          </div>
        </div>

        {/* Timers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Prep Timer (1 minute) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
            <div className="text-xs text-slate-500 font-semibold mb-1">Preparation Time (1 min)</div>
            <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400 mb-3">
              {prepSeconds}s
            </div>
            <button
              onClick={() => setIsPrepRunning(!isPrepRunning)}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              {isPrepRunning ? 'Pause Prep' : 'Start 1m Prep'}
            </button>
          </div>

          {/* Speaking Timer (2 minutes) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
            <div className="text-xs text-slate-500 font-semibold mb-1">Speaking Time (2 min)</div>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mb-3">
              {Math.floor(speakSeconds / 60)}:{(speakSeconds % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={() => setIsSpeakRunning(!isSpeakRunning)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
            >
              {isSpeakRunning ? 'Stop Recording' : 'Start 2m Speaking'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
