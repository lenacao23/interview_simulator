'use client';

import { useState, useCallback } from 'react';

interface StreamingState<T> {
  raw: string;
  parsed: T | null;
  streaming: boolean;
  error: string | null;
}

export function useStreamingResponse<T>() {
  const [state, setState] = useState<StreamingState<T>>({
    raw: '',
    parsed: null,
    streaming: false,
    error: null,
  });

  const start = useCallback(async (url: string, body: object) => {
    setState({ raw: '', parsed: null, streaming: true, error: null });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setState((s) => ({ ...s, raw: accumulated }));
      }

      // Strip possible markdown code fences
      const cleaned = accumulated
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleaned) as T;
      setState({ raw: accumulated, parsed, streaming: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setState((s) => ({ ...s, streaming: false, error: msg }));
    }
  }, []);

  return { ...state, start };
}
