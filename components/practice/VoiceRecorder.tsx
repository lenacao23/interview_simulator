'use client';

import { useEffect, useRef } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { Spinner } from '@/components/ui/Spinner';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const {
    recordingState,
    elapsedSeconds,
    audioUrl,
    transcript,
    error,
    isSupported,
    permissionDenied,
    startRecording,
    stopRecording,
    resetRecording,
    confirmRecording,
  } = useVoiceRecorder();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update audio element src when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // --- Unsupported browser ---
  if (!isSupported) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 flex items-start gap-3">
        <span className="text-lg">🎙️</span>
        <span>
          Voice input isn&apos;t supported in this browser. Try Chrome or Safari, or type your answer below.
        </span>
      </div>
    );
  }

  // --- Permission denied ---
  if (permissionDenied) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="font-medium">Microphone access was blocked.</p>
          <p className="mt-1 text-amber-700">
            To use voice input, allow microphone access in your browser settings and reload the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ---- IDLE ---- */}
      {recordingState === 'idle' && (
        <div className="flex items-center gap-3">
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm transition-colors border border-indigo-200"
          >
            <span className="text-base">🎙️</span>
            Record your answer
          </button>
          <span className="text-xs text-slate-400">Speak naturally — we&apos;ll transcribe it for you</span>
        </div>
      )}

      {/* ---- RECORDING ---- */}
      {recordingState === 'recording' && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          {/* Pulsing red dot */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>

          <span className="text-sm font-semibold text-red-700 tabular-nums w-12">
            {formatTime(elapsedSeconds)}
          </span>

          <span className="text-xs text-red-600 flex-1">Recording…</span>

          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <span className="inline-block w-2.5 h-2.5 bg-white rounded-sm" />
            Stop
          </button>
        </div>
      )}

      {/* ---- TRANSCRIBING ---- */}
      {recordingState === 'transcribing' && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <Spinner size="sm" />
          <span>Cleaning up transcript…</span>
        </div>
      )}

      {/* ---- PREVIEW ---- */}
      {recordingState === 'preview' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 space-y-3 p-4">
          {/* Audio playback */}
          {audioUrl && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5">
                Playback preview
              </p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio
                ref={audioRef}
                controls
                className="w-full h-9"
                style={{ colorScheme: 'light' }}
              />
            </div>
          )}

          {/* Transcript preview */}
          {transcript && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">
                Transcript
              </p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          )}

          {!transcript && (
            <p className="text-xs text-slate-500 italic">
              No transcript detected. You can still use the recording, or re-record with speech.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={async () => {
                const text = await confirmRecording();
                if (text) onTranscript(text);
              }}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              ✓ Use this recording
            </button>
            <button
              onClick={resetRecording}
              className="flex-1 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200 transition-colors"
            >
              ↺ Re-record
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
          {error}
        </p>
      )}
    </div>
  );
}
