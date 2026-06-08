import { QuestionSetup } from '@/components/practice/QuestionSetup';
import { Card } from '@/components/ui/Card';

export default function PracticePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configure your practice session</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose a question type and difficulty, then let AI generate your question.
        </p>
      </div>
      <Card className="p-6">
        <QuestionSetup />
      </Card>
    </div>
  );
}
