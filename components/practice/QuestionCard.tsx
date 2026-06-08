import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { GeneratedQuestion, QuestionType, Difficulty } from '@/lib/types';

const typeBadge: Record<QuestionType, { color: 'purple' | 'teal' | 'blue'; label: string }> = {
  behavioral: { color: 'purple', label: 'Behavioral · STAR' },
  'open-ended': { color: 'teal', label: 'Open-Ended' },
  situational: { color: 'blue', label: 'Situational' },
};

const diffBadge: Record<Difficulty, { color: 'emerald' | 'amber' | 'slate'; label: string }> = {
  easy: { color: 'emerald', label: 'Easy' },
  medium: { color: 'amber', label: 'Medium' },
  hard: { color: 'slate', label: 'Hard' },
};

export function QuestionCard({
  question,
  questionType,
  difficulty,
}: {
  question: GeneratedQuestion;
  questionType: QuestionType;
  difficulty: Difficulty;
}) {
  const tb = typeBadge[questionType];
  const db = diffBadge[difficulty];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge color={tb.color}>{tb.label}</Badge>
        <Badge color={db.color}>{db.label}</Badge>
      </div>

      {question.context && (
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Scenario: </span>
          {question.context}
        </div>
      )}

      <p className="text-lg font-semibold text-slate-800 leading-relaxed">
        {question.text}
      </p>

      {question.tips && (
        <div className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <span className="text-base">💡</span>
          <span>{question.tips}</span>
        </div>
      )}
    </Card>
  );
}
