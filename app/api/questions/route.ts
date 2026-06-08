import { NextRequest } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { SYSTEM_PROMPT, buildQuestionPrompt } from '@/lib/prompts';
import type { SessionConfig } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { config }: { config: SessionConfig } = await req.json();

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildQuestionPrompt(config) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(JSON.stringify({ error: msg })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
