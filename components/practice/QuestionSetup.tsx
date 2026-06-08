'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { saveSession } from '@/lib/storage';
import type { QuestionType, Difficulty, SessionConfig, GeneratedQuestion } from '@/lib/types';

const questionTypes: { value: QuestionType; label: string; desc: string; selected: string; idle: string }[] = [
  {
    value: 'behavioral',
    label: 'Behavioral',
    desc: 'STAR-method questions about past experiences',
    selected: 'border-purple-400 bg-purple-50 text-purple-800',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-purple-200',
  },
  {
    value: 'open-ended',
    label: 'Open-Ended',
    desc: 'Strategic questions about values and approach',
    selected: 'border-teal-400 bg-teal-50 text-teal-800',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-teal-200',
  },
  {
    value: 'situational',
    label: 'Situational',
    desc: 'Hypothetical scenario-based questions',
    selected: 'border-blue-400 bg-blue-50 text-blue-800',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-blue-200',
  },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function QuestionSetup() {
  const router = useRouter();
  const [questionType, setQuestionType] = useState<QuestionType>('behavioral');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const config: SessionConfig = {
      questionType,
      difficulty,
      jobDescription: jobDescription.trim() || undefined,
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const cleaned = accumulated.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const question: GeneratedQuestion = JSON.parse(cleaned);

      const id = crypto.randomUUID();
      saveSession({ id, config, question, userAnswer: '', answerMode: 'freeform', createdAt: Date.now() });
      router.push(`/practice/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Question Type
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {questionTypes.map((qt) => (
            <button
              key={qt.value}
              onClick={() => setQuestionType(qt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                questionType === qt.value ? qt.selected : qt.idle
              }`}
            >
              <div className="font-semibold text-sm">{qt.label}</div>
              <div className="text-xs mt-1 opacity-70">{qt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Difficulty
        </h2>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                difficulty === d.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowJD(!showJD)}
          className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <span className="w-5 h-5 rounded-full border border-indigo-300 flex items-center justify-center text-xs">
            {showJD ? '−' : '+'}
          </span>
          Add job description to tailor questions
        </button>
        {showJD && (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description or role details here..."
            rows={6}
            className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
          {error}
        </p>
      )}

      <Button size="lg" onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Spinner size="sm" />
            Generating question…
          </>
        ) : (
          'Generate Question →'
        )}
      </Button>
    </div>
  );
}
