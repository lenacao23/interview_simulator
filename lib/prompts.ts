import type { SessionConfig, GeneratedQuestion, QuestionType } from './types';
import { USER_PROFILE } from './user-profile';

export const SYSTEM_PROMPT = `You are an expert behavioral interview coach with 15+ years of experience helping candidates prepare for interviews at top finance, consulting, and strategy firms.

You are coaching a specific candidate. Here is their background — use it to personalize every question and every piece of feedback:

${USER_PROFILE}

When generating questions:
- Draw on the candidate's industry targets (finance, consulting, strategy) and actual past experiences
- For behavioral questions, frame scenarios relevant to roles they have held (internships, leadership positions, nonprofit work)
- For situational questions, create hypotheticals in finance or consulting contexts
- For open-ended questions, probe for strategic thinking applicable to their career goals

When providing feedback:
- Be encouraging but honest
- Reference their specific experiences (e.g., VITA, diiVe, Edgewood, Spider Business Hub) when relevant
- Cite specific phrases from the answer when praising or critiquing
- For STAR evaluation, score each component 0–3 (0=absent, 1=weak, 2=adequate, 3=strong)
- Always end with one concrete, actionable next step tailored to their background

Respond ONLY with valid JSON matching the requested schema. Do not wrap in markdown code fences.`;

const difficultyDesc: Record<string, string> = {
  easy: 'entry-level or straightforward',
  medium: 'mid-level requiring some nuance',
  hard: 'senior-level requiring deep reflection and complexity',
};

const typeInstructions: Record<string, string> = {
  behavioral: `Generate a STAR-format behavioral question starting with "Tell me about a time when..." or "Describe a situation where...". Include a brief tip for how to structure a strong STAR answer.`,
  'open-ended': `Generate an open-ended strategic question that explores the candidate's thinking, values, or vision (e.g., "How do you approach...", "What is your philosophy on...").`,
  situational: `Generate a hypothetical situational question ("Imagine you are...", "What would you do if..."). Include a brief context field to set the scenario.`,
};

export function buildQuestionPrompt(config: SessionConfig): string {
  const jdSection = config.jobDescription
    ? `\nJob description context (tailor the question specifically to this role AND the candidate's background):\n${config.jobDescription.slice(0, 2000)}`
    : '';

  return `Generate one ${difficultyDesc[config.difficulty]} ${config.questionType} interview question tailored to the candidate's background described in the system prompt.${jdSection}

${typeInstructions[config.questionType]}

Also generate exactly 4 multiple-choice answer options representing different quality levels:
- One excellent, high-scoring response
- Two acceptable but imperfect responses
- One weak or incomplete response

Shuffle them so the excellent option is not always first.

Respond with this exact JSON structure:
{
  "text": "The interview question text",
  "context": "Optional: additional scenario context (use for situational questions, omit otherwise)",
  "tips": "One sentence hint for structuring a strong answer",
  "mcqOptions": [
    "Option A: ...",
    "Option B: ...",
    "Option C: ...",
    "Option D: ..."
  ]
}`;
}

export function buildFeedbackPrompt(
  question: GeneratedQuestion,
  answer: string,
  questionType: QuestionType,
  answerMode: 'freeform' | 'mcq',
): string {
  const answerContext =
    answerMode === 'mcq'
      ? `The candidate selected this pre-written option: "${answer}"`
      : `The candidate wrote this free-form answer:\n"${answer}"`;

  const starSection =
    questionType === 'behavioral'
      ? `
Also evaluate using the STAR framework. Score each component 0–3:
- 0: Absent or completely unclear
- 1: Mentioned but weak or vague
- 2: Present and adequate
- 3: Strong, specific, and compelling

Include "starBreakdown" with numeric scores and a one-sentence explanation.`
      : '';

  const starField =
    questionType === 'behavioral'
      ? `
  "starBreakdown": {
    "situation": <0-3>,
    "task": <0-3>,
    "action": <0-3>,
    "result": <0-3>,
    "feedback": "One sentence on STAR structure quality"
  },`
      : '';

  return `Analyze this interview answer and provide structured feedback.

Question: "${question.text}"
${answerContext}
${starSection}

Respond with this exact JSON structure:
{
  "strengths": ["Specific strength citing the answer", "Another strength"],
  "improvements": ["Specific improvement with guidance", "Another improvement"],${starField}
  "overallScore": <1-10>,
  "coaching": "One or two sentence actionable next step the candidate should practice"
}

Be specific. Reference actual phrases from the answer. Be encouraging but honest. Always have at least 1 strength and 1 improvement.`;
}
