import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript?: string };

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ text: '' });
    }

    // Use Claude to clean up the raw speech-to-text transcript:
    // remove filler words, fix run-ons, preserve meaning
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a transcript cleaner. The following text is a raw speech-to-text transcript of someone answering a behavioral interview question. Clean it up by:
- Removing filler words (um, uh, like, you know, so, basically)
- Fixing run-on sentences with light punctuation
- Preserving all meaning, examples, and content exactly — do NOT summarize or rephrase
- Keeping it in first person
- Do NOT add any new content

Return ONLY the cleaned transcript text. No explanation, no quotes around it.

Raw transcript:
${transcript.trim()}`,
        },
      ],
    });

    const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : transcript.trim();
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
