import type { STARScore } from '@/lib/types';

const components: { key: keyof Omit<STARScore, 'feedback'>; label: string; desc: string }[] = [
  { key: 'situation', label: 'Situation', desc: 'Set the context clearly' },
  { key: 'task', label: 'Task', desc: 'Defined the challenge or responsibility' },
  { key: 'action', label: 'Action', desc: 'Described specific steps taken' },
  { key: 'result', label: 'Result', desc: 'Articulated measurable outcomes' },
];

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((pip) => (
        <div
          key={pip}
          className={`h-2 flex-1 rounded-full ${pip <= score ? 'bg-indigo-500' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );
}

const scoreLabel = ['Absent', 'Weak', 'Adequate', 'Strong'];

export function STARBreakdown({ star }: { star: STARScore }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">STAR Framework Breakdown</h3>
      <div className="space-y-4">
        {components.map(({ key, label, desc }) => {
          const score = star[key] as number;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                  <span className="text-xs text-slate-400 ml-2">{desc}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    score === 3
                      ? 'bg-emerald-100 text-emerald-700'
                      : score === 2
                      ? 'bg-indigo-100 text-indigo-700'
                      : score === 1
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {scoreLabel[score]}
                </span>
              </div>
              <ScoreBar score={score} />
            </div>
          );
        })}
      </div>
      {star.feedback && (
        <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
          {star.feedback}
        </p>
      )}
    </div>
  );
}
