'use client';

import { useState, type ReactNode } from 'react';
import { VoiceAgent } from './voice-agent';
import { useSettingsStore } from '@/lib/store/settings';
import { cn } from '@/lib/utils';
import { MessageSquare, Mic, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'voice' | 'text';

interface VoiceAgentPanelProps {
  /** Render prop for the text-mode chat content */
  textModeContent?: ReactNode;
  className?: string;
  onOpenChat?: () => void;
}

export function VoiceAgentPanel({ textModeContent, className, onOpenChat }: VoiceAgentPanelProps) {
  const elevenlabsApiKey = useSettingsStore((s) => s.elevenlabsApiKey);
  const elevenlabsAgentId = useSettingsStore((s) => s.elevenlabsAgentId);
  const setElevenLabsApiKey = useSettingsStore((s) => s.setElevenLabsApiKey);
  const setElevenLabsAgentId = useSettingsStore((s) => s.setElevenLabsAgentId);
  const setVoiceAgentEnabled = useSettingsStore((s) => s.setVoiceAgentEnabled);

  const [mode, setMode] = useState<Mode>('voice');
  const [showConfig, setShowConfig] = useState(false);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setVoiceAgentEnabled(newMode === 'voice');

    if (newMode === 'voice') {
      if (!elevenlabsAgentId && !elevenlabsApiKey) {
        setShowConfig(true);
      }
      return;
    }

    onOpenChat?.();
  };

  const textFallback = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Use the chat panel for text conversations</p>
        <p className="text-xs text-muted-foreground">
          Lecture notes and LangGraph chat stay in the classroom sidebar.
        </p>
      </div>
      {onOpenChat && (
        <Button size="sm" variant="outline" onClick={onOpenChat}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          Open Chat Panel
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Mode toggle tabs */}
      <div className="flex items-center border-b">
        <button
          onClick={() => handleModeSwitch('text')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
            mode === 'text'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Text
        </button>
        <button
          onClick={() => handleModeSwitch('voice')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
            mode === 'voice'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Mic className="h-3.5 w-3.5" />
          Voice
        </button>
        {mode === 'voice' && (
          <button
            onClick={() => setShowConfig((v) => !v)}
            className="px-2 py-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Config panel (inline, shown when voice mode needs setup) */}
      {showConfig && mode === 'voice' && (
        <div className="border-b bg-muted/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">ElevenLabs Config</span>
            <button onClick={() => setShowConfig(false)}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Agent ID (optional if server-configured)</Label>
            <Input
              type="text"
              placeholder="agent_..."
              value={elevenlabsAgentId}
              onChange={(e) => setElevenLabsAgentId(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">API Key (optional if server-configured)</Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={elevenlabsApiKey}
              onChange={(e) => setElevenLabsApiKey(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Create an agent at elevenlabs.io/conversational-ai, then paste the Agent ID and API key
            here, or set `ELEVENLABS_AGENT_ID` and `ELEVENLABS_API_KEY` on the server.
          </p>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'text' ? (textModeContent ?? textFallback) : <VoiceAgent autoStart />}
      </div>
    </div>
  );
}
