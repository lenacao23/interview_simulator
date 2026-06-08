'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { STARBreakdown } from '@/components/feedback/STARBreakdown';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'emerald' : score >= 6 ? 'indigo' : score >= 4 ? 'amber' : 'slate';
  return (
    <div
      className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-bold ${
        color === 'emerald'
          ? 'bg-emerald-100 text-emerald-700'
          : color === 'indigo'
          ? 'bg-indigo-100 text-indigo-700'
          : color === 'amber'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className="text-2xl leading-none">{score}</span>
      <span className="text-[10px] font-semibold opacity-60">/ 10</span>
    </div>
  );
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useSession(sessionId);

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

  const { feedback, question, config } = session;

  if (!feedback) {
    return (
      <div className="text-center py-20 text-slate-500">
        No feedback yet.{' '}
        <a href={`/practice/${sessionId}`} className="text-indigo-600 underline">
          Return to question
        </a>
        .
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s how your answer scored.</p>
        </div>
        <ScoreBadge score={feedback.overallScore} />
      </div>

      <Card className="p-5 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge color={config.questionType === 'behavioral' ? 'purple' : config.questionType === 'situational' ? 'blue' : 'teal'}>
            {config.questionType}
          </Badge>
          <Badge color="slate">{config.difficulty}</Badge>
        </div>
        <p className="text-sm font-medium text-slate-800">{question.text}</p>
        {session.userAnswer && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-semibold">Your answer</p>
            <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{session.userAnswer}&rdquo;</p>
          </div>
        )}
      </Card>

      <FeedbackCard feedback={feedback} />

      {feedback.starBreakdown && config.questionType === 'behavioral' && (
        <STARBreakdown star={feedback.starBreakdown} />
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/practice">
          <Button size="lg">Practice Again →</Button>
        </Link>
        <Link href={`/practice/${sessionId}`}>
          <Button variant="secondary" size="lg">Retry This Question</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="lg">Home</Button>
        </Link>
      </div>
    </div>
  );
}
