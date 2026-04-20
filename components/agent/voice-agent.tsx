'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useStageStore } from '@/lib/store/stage';
import { useSettingsStore } from '@/lib/store/settings';
import { clientTools } from '@/lib/elevenlabs/client-tools';
import { buildSceneContextSummary } from '@/lib/elevenlabs/scene-context';
import { cn } from '@/lib/utils';
import { Mic, MicOff, PhoneOff, Volume2, Loader2, GraduationCap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranscriptEntry {
  role: 'agent' | 'user';
  text: string;
  timestamp: number;
}

export interface SourceCitation {
  title: string;
  url: string;
}

export interface CheckpointQuestion {
  question: string;
  options?: string[];
}

interface VoiceAgentProps {
  autoStart?: boolean;
}

export function VoiceAgent({ autoStart = false }: VoiceAgentProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [checkpoint, setCheckpoint] = useState<CheckpointQuestion | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const elevenlabsApiKey = useSettingsStore((s) => s.elevenlabsApiKey);
  const elevenlabsAgentId = useSettingsStore((s) => s.elevenlabsAgentId);
  const currentSceneId = useStageStore((s) => s.currentSceneId);

  // Expose source/checkpoint setters on window for client tools to call
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__kakshaiAddSource = (
      source: SourceCitation,
    ) => {
      setSources((prev) => {
        // Deduplicate by URL
        if (prev.some((s) => s.url === source.url)) return prev;
        return [...prev.slice(-9), source]; // Keep last 10
      });
    };
    (window as unknown as Record<string, unknown>).__kakshaiShowCheckpoint = (
      q: CheckpointQuestion,
    ) => {
      setCheckpoint(q);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__kakshaiAddSource;
      delete (window as unknown as Record<string, unknown>).__kakshaiShowCheckpoint;
    };
  }, []);

  const conversation = useConversation({
    clientTools,
    micMuted,
    onMessage: (message) => {
      if (!message.message?.trim()) {
        return;
      }

      if (message.role === 'agent') {
        setTranscript((prev) => [
          ...prev,
          {
            role: 'agent',
            text: message.message,
            timestamp: Date.now(),
          },
        ]);
      } else if (message.role === 'user') {
        setTranscript((prev) => [
          ...prev,
          {
            role: 'user',
            text: message.message,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    onError: (err) => {
      setError(typeof err === 'string' ? err : 'Connection error');
    },
    onConnect: () => {
      setError(null);
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Send contextual update when scene changes
  useEffect(() => {
    if (conversation.status !== 'connected' || !currentSceneId) return;

    const scene = useStageStore.getState().getCurrentScene();
    if (!scene) return;

    const scenes = useStageStore.getState().scenes;
    const idx = scenes.findIndex((s) => s.id === scene.id);
    const contextText = buildSceneContextSummary(scene, {
      index: idx + 1,
      total: scenes.length,
    });

    conversation.sendContextualUpdate(contextText);
  }, [currentSceneId, conversation.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = useCallback(async () => {
    setError(null);
    setTranscript([]);
    setSources([]);
    setCheckpoint(null);

    try {
      const headers: Record<string, string> = {};
      if (elevenlabsApiKey) headers['x-api-key'] = elevenlabsApiKey;
      if (elevenlabsAgentId) headers['x-elevenlabs-agent-id'] = elevenlabsAgentId;

      const res = await fetch('/api/elevenlabs/signed-url', { headers });
      const data = await res.json();

      if (!data.success || !data.signedUrl) {
        setError(data.error || 'Failed to get signed URL');
        return;
      }

      const scene = useStageStore.getState().getCurrentScene();
      const scenes = useStageStore.getState().scenes;
      const sceneIndex = scene ? scenes.findIndex((current) => current.id === scene.id) : -1;
      const slideContext =
        scene && sceneIndex >= 0
          ? buildSceneContextSummary(scene, {
              index: sceneIndex + 1,
              total: scenes.length,
            })
          : 'The student is in the classroom.';

      const teacherPrompt =
        'You are an AI teacher in KakshAI, an interactive classroom platform. ' +
        'You are having a voice conversation with a student who is going through a course. ' +
        'Be engaging, encouraging, and educational. ' +
        'Keep responses concise (2-3 sentences) since this is a voice conversation. ' +
        'Use the available tools when helpful: searchWeb to look up live information, ' +
        'navigateSlide to move between slides, drawOnWhiteboard to explain visually, ' +
        'and showCheckpoint to ask comprehension questions. ' +
        'After every 2-3 slides, use showCheckpoint to ask a brief comprehension question. ' +
        `Current context: ${slideContext}`;

      await conversation.startSession({
        signedUrl: data.signedUrl,
        overrides: {
          agent: {
            prompt: {
              prompt: teacherPrompt,
            },
            firstMessage:
              "Welcome to your lesson! I'm your AI teacher. I can see your slides, search the web for live information, and check your understanding as we go. Let's begin — take a look at the first slide, and I'll walk you through it.",
            language: 'en',
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  }, [conversation, elevenlabsApiKey, elevenlabsAgentId]);

  // Auto-start: trigger on mount if configured
  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    if (!elevenlabsApiKey && !elevenlabsAgentId && !process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID)
      return;
    if (conversation.status !== 'disconnected') return;

    autoStarted.current = true;
    // Small delay to let the classroom fully render
    const timer = setTimeout(() => {
      startSession();
    }, 800);
    return () => clearTimeout(timer);
  }, [autoStart, elevenlabsApiKey, elevenlabsAgentId, conversation.status, startSession]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
    setMicMuted(false);
  }, [conversation]);

  const toggleMic = useCallback(() => {
    setMicMuted((prev) => !prev);
  }, []);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';
  const isMicMuted = conversation.micMuted ?? micMuted;

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected
                ? 'bg-green-500'
                : isConnecting
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-400',
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected
              ? conversation.isSpeaking
                ? 'Teacher is speaking...'
                : 'Listening...'
              : isConnecting
                ? 'Connecting to teacher...'
                : 'AI Teacher'}
          </span>
        </div>

        {isConnected && conversation.isSpeaking && (
          <Volume2 className="h-4 w-4 animate-pulse text-blue-500" />
        )}
      </div>

      {/* Transcript + content area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Idle state — prominent start button */}
        {transcript.length === 0 && !isConnected && !isConnecting && !error && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium">Ready to begin your lesson</p>
                <p className="text-sm text-muted-foreground">
                  Your AI teacher will walk you through the material
                </p>
              </div>
              <Button onClick={startSession} size="lg" className="gap-2 px-8">
                <Mic className="h-4 w-4" />
                Begin Lesson
              </Button>
            </div>
          </div>
        )}

        {/* Checkpoint question overlay */}
        {checkpoint && (
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Comprehension Check
            </p>
            <p className="text-sm font-medium">{checkpoint.question}</p>
            {checkpoint.options && checkpoint.options.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {checkpoint.options.map((opt, i) => (
                  <button
                    key={i}
                    className="block w-full text-left rounded-md border px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors"
                    onClick={() => setCheckpoint(null)}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Answer by voice or tap an option</p>
          </div>
        )}

        {/* Transcript messages */}
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg px-3 py-2 text-sm max-w-[85%]',
              entry.role === 'agent'
                ? 'bg-muted mr-auto'
                : 'bg-primary text-primary-foreground ml-auto',
            )}
          >
            {entry.text}
          </div>
        ))}

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Source citations */}
      {sources.length > 0 && (
        <div className="border-t px-3 py-2 space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80 transition-colors"
                title={source.url}
              >
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate max-w-[160px]">{source.title || source.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-t px-3 py-3">
        {!isConnected && !isConnecting ? (
          transcript.length > 0 ? (
            <Button onClick={startSession} size="sm" className="gap-2" variant="outline">
              <Mic className="h-4 w-4" />
              Reconnect
            </Button>
          ) : null /* idle state shown above */
        ) : (
          <>
            <Button
              variant={isMicMuted ? 'destructive' : 'outline'}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleMic}
              disabled={!isConnected}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={endSession}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneOff className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
