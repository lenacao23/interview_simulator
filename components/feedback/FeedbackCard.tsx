import type { FeedbackResult } from '@/lib/types';

export function FeedbackCard({ feedback }: { feedback: FeedbackResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
            <span>✓</span> Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-emerald-900 border-l-2 border-emerald-400 pl-3"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
            <span>△</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((imp, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-amber-900 border-l-2 border-amber-400 pl-3"
              >
                {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
        <p className="text-sm font-semibold text-indigo-800 mb-1">Coaching tip</p>
        <p className="text-sm text-indigo-900">{feedback.coaching}</p>
      </div>
    </div>
  );
}
