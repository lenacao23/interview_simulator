'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'preview' | 'transcribing';

export interface UseVoiceRecorderReturn {
  recordingState: RecordingState;
  elapsedSeconds: number;
  audioUrl: string | null;
  transcript: string | null;
  error: string | null;
  isSupported: boolean;
  permissionDenied: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  confirmRecording: () => Promise<string | null>;
}

const MIN_DURATION_MS = 1000;

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const liveTranscriptRef = useRef<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function';

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopEverything();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopEverything() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const startRecording = useCallback(async () => {
    if (!isSupported) return;
    setError(null);
    setPermissionDenied(false);
    setTranscript(null);
    liveTranscriptRef.current = '';

    // Revoke previous audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionDenied(true);
      } else {
        setError('Could not access microphone. Please check your device settings.');
      }
      return;
    }

    streamRef.current = stream;

    // MediaRecorder — prefer webm/opus, fall back to whatever the browser supports
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      audioBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      setAudioUrl(url);
    };

    recorder.start(250); // collect chunks every 250 ms
    startTimeRef.current = Date.now();

    // Timer
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);

    // SpeechRecognition for live transcript
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      let finalTranscript = '';
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
        liveTranscriptRef.current = (finalTranscript + interim).trim();
      };
      recognition.onerror = () => { /* silent — transcription is best-effort */ };
      try { recognition.start(); } catch {}
    }

    setRecordingState('recording');
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed < MIN_DURATION_MS) {
      stopEverything();
      setRecordingState('idle');
      setError('Recording too short — please speak for at least 1 second.');
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Save whatever live transcript we have so far
    setTranscript(liveTranscriptRef.current || null);
    setRecordingState('preview');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetRecording = useCallback(() => {
    stopEverything();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioBlobRef.current = null;
    chunksRef.current = [];
    liveTranscriptRef.current = '';
    setAudioUrl(null);
    setTranscript(null);
    setElapsedSeconds(0);
    setError(null);
    setRecordingState('idle');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send to /api/transcribe to clean up with Claude, fall back to raw SpeechRecognition text
  const confirmRecording = useCallback(async (): Promise<string | null> => {
    const rawTranscript = liveTranscriptRef.current || transcript || '';
    if (!rawTranscript && !audioBlobRef.current) return null;

    setRecordingState('transcribing');
    setError(null);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: rawTranscript }),
      });
      if (!res.ok) throw new Error('Transcription service error');
      const { text } = await res.json() as { text: string };
      setTranscript(text);
      setRecordingState('preview');
      return text;
    } catch {
      // Fall back gracefully to raw transcript
      const fallback = rawTranscript || null;
      setTranscript(fallback);
      setRecordingState('preview');
      return fallback;
    }
  }, [transcript]);

  return {
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
  };
}
