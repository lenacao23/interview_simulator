'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { saveSession } from '@/lib/storage';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { MultipleChoiceOptions } from '@/components/practice/MultipleChoiceOptions';
import { VoiceRecorder } from '@/components/practice/VoiceRecorder';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { FeedbackResult } from '@/lib/types';

export default function PracticeSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const session = useSession(sessionId);

  const [answerMode, setAnswerMode] = useState<'freeform' | 'mcq'>('freeform');
  const [freeformAnswer, setFreeformAnswer] = useState('');
  const [selectedMcq, setSelectedMcq] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="text-center py-20 text-slate-500">
        Session not found.{' '}
        <a href="/practice" className="text-indigo-600 underline">
          Start a new one
        </a>
        .
      </div>
    );
  }

  const answer = answerMode === 'freeform' ? freeformAnswer : selectedMcq;
  const canSubmit = answer.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || !session) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: session.question,
          answer,
          questionType: session.config.questionType,
          answerMode,
        }),
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
      const feedback = JSON.parse(cleaned) as FeedbackResult;

      saveSession({ ...session, userAnswer: answer, answerMode, feedback });
      router.push(`/results/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Your Question</h1>
        <a href="/practice" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          ← New question
        </a>
      </div>

      <QuestionCard
        question={session.question}
        questionType={session.config.questionType}
        difficulty={session.config.difficulty}
      />

      <div className="bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {(['freeform', 'mcq'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnswerMode(mode)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                answerMode === mode
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode === 'freeform' ? '✍️ Write your answer' : '☑️ Choose an option'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {answerMode === 'freeform' ? (
            <>
              <VoiceRecorder
                onTranscript={(text) => {
                  setFreeformAnswer((prev) =>
                    prev.trim() ? prev.trimEnd() + ' ' + text : text
                  );
                }}
              />
              <textarea
                value={freeformAnswer}
                onChange={(e) => setFreeformAnswer(e.target.value)}
                placeholder="Take your time. For behavioral questions, use the STAR method: Situation, Task, Action, Result."
                rows={8}
                className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />
            </>
          ) : (
            <MultipleChoiceOptions
              options={session.question.mcqOptions}
              selected={selectedMcq}
              onChange={setSelectedMcq}
            />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {answerMode === 'freeform' && freeformAnswer.trim().length > 0
            ? `${freeformAnswer.trim().split(/\s+/).length} words`
            : ''}
        </p>
        <Button size="lg" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" />
              Analyzing your answer…
            </>
          ) : (
            'Submit for Feedback →'
          )}
        </Button>
      </div>
    </div>
  );
}
