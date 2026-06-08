import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: '🎯',
    title: 'Three Question Types',
    desc: 'Practice behavioral (STAR), open-ended strategic, and situational judgment questions.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Feedback',
    desc: 'Get detailed analysis of your answer — what you nailed and what to sharpen.',
  },
  {
    icon: '⭐',
    title: 'STAR Scoring',
    desc: 'Behavioral answers are evaluated against the Situation, Task, Action, Result framework.',
  },
  {
    icon: '📄',
    title: 'Job Description Mode',
    desc: 'Paste a job description and get questions tailored specifically to that role.',
  },
  {
    icon: '✍️',
    title: 'Two Answer Modes',
    desc: 'Write a free-form answer or pick from four AI-generated options per question.',
  },
  {
    icon: '📈',
    title: 'Difficulty Levels',
    desc: 'Choose Easy, Medium, or Hard to match your preparation stage.',
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
          Powered by Claude AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Ace your next
          <br />
          <span className="text-indigo-600">interview</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
          Practice behavioral, situational, and open-ended interview questions with
          instant AI feedback and STAR framework coaching.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/practice">
            <Button size="lg">Start Practicing →</Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Everything you need to prepare
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center py-8">
        <Card className="p-8 bg-indigo-600 ring-0">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to practice?</h2>
          <p className="text-indigo-200 text-sm mb-6">
            Generate your first question in seconds. No sign-up required.
          </p>
          <Link href="/practice">
            <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-sm">
              Generate a Question →
            </button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
