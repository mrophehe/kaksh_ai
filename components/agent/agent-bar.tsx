'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useSettingsStore } from '@/lib/store/settings';
import { useAgentRegistry } from '@/lib/orchestration/registry/store';
import { Sparkles, ChevronDown, Shuffle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function AgentBar() {
  const { t } = useI18n();
  const { listAgents } = useAgentRegistry();
  const selectedAgentIds = useSettingsStore((s) => s.selectedAgentIds);
  const setSelectedAgentIds = useSettingsStore((s) => s.setSelectedAgentIds);
  const maxTurns = useSettingsStore((s) => s.maxTurns);
  const setMaxTurns = useSettingsStore((s) => s.setMaxTurns);
  const agentMode = useSettingsStore((s) => s.agentMode);
  const setAgentMode = useSettingsStore((s) => s.setAgentMode);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allAgents = listAgents();
  // In preset mode, only show default (non-generated) agents
  const agents = allAgents.filter((a) => !a.isGenerated);
  const teacherAgent = agents.find((a) => a.role === 'teacher');
  const selectedAgents = agents.filter((a) => selectedAgentIds.includes(a.id));
  const nonTeacherSelected = selectedAgents.filter((a) => a.role !== 'teacher');

  // Click-outside to collapse
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleModeChange = (mode: 'preset' | 'auto') => {
    setAgentMode(mode);
    if (mode === 'preset') {
      // Ensure a teacher is always selected in preset mode
      const hasTeacherSelected = selectedAgentIds.some((id) => {
        const a = agents.find((agent) => agent.id === id);
        return a?.role === 'teacher';
      });
      if (!hasTeacherSelected && teacherAgent) {
        setSelectedAgentIds([teacherAgent.id, ...selectedAgentIds]);
      }
    }
  };

  const toggleAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent?.role === 'teacher') return; // teacher is always selected
    if (selectedAgentIds.includes(agentId)) {
      setSelectedAgentIds(selectedAgentIds.filter((id) => id !== agentId));
    } else {
      setSelectedAgentIds([...selectedAgentIds, agentId]);
    }
  };

  const getAgentName = (agent: { id: string; name: string }) => {
    const key = `settings.agentNames.${agent.id}`;
    const translated = t(key);
    return translated !== key ? translated : agent.name;
  };

  const getAgentRole = (agent: { role: string }) => {
    const key = `settings.agentRoles.${agent.role}`;
    const translated = t(key);
    return translated !== key ? translated : agent.role;
  };

  /* ── Shared avatar row — always visible on the right side ── */
  const avatarRow = (
    <div className="flex items-center gap-2 shrink-0">
      {/* Teacher avatar — always shown */}
      {teacherAgent && (
        <div className="size-8 rounded-full overflow-hidden ring-2 ring-amber-500/30 dark:ring-amber-400/20 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          <img
            src={teacherAgent.avatar}
            alt={getAgentName(teacherAgent)}
            className="size-full object-cover scale-105"
          />
        </div>
      )}

      {agentMode === 'auto' ? (
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full border border-border/10">
          <Sparkles className="size-3 text-amber-500 animate-pulse" />
          <Shuffle className="size-3 text-amber-500/60" />
        </div>
      ) : (
        <>
          {/* In preset mode: show selected non-teacher agents */}
          {nonTeacherSelected.length > 0 && (
            <div className="flex -space-x-2.5">
              {nonTeacherSelected.slice(0, 4).map((agent) => (
                <div
                  key={agent.id}
                  className="size-7 rounded-full overflow-hidden ring-2 ring-background shadow-sm transition-transform hover:scale-110 hover:z-10"
                >
                  <img
                    src={agent.avatar}
                    alt={getAgentName(agent)}
                    className="size-full object-cover"
                  />
                </div>
              ))}
              {nonTeacherSelected.length > 4 && (
                <div className="size-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-muted-foreground">
                    +{nonTeacherSelected.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-80">
      {/* ── Header row — always in document flow ── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'group flex items-center gap-2.5 cursor-pointer rounded-full p-1.5 pr-3.5 transition-all w-full active:scale-95 duration-500',
              open
                ? 'bg-amber-500/10 border-amber-500/30 dark:border-amber-500/20 text-foreground ring-4 ring-amber-500/5'
                : 'border-border/40 hover:border-border/60 text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5',
              'border',
            )}
            onClick={() => setOpen(!open)}
          >
            {/* Left side — avatars (swapped for balance) */}
            {avatarRow}

            {/* Middle side — label */}
            <span className="text-xs group-hover:text-foreground transition-colors hidden sm:block font-bold tracking-tight flex-1 text-left ml-1">
              {open ? t('agentBar.expandedTitle') : t('agentBar.readyToLearn')}
            </span>

            {/* Chevron */}
            <div className={cn('transition-transform duration-500', open && 'rotate-180')}>
              <ChevronDown className="size-4 text-muted-foreground/60 transition-colors" />
            </div>
          </button>
        </TooltipTrigger>
        {!open && (
          <TooltipContent side="bottom" sideOffset={4}>
            {t('agentBar.configTooltip')}
          </TooltipContent>
        )}
      </Tooltip>

      {/* ── Expanded panel (absolute, floating below the header) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2.5 z-50 w-[340px]"
          >
            <div className="rounded-3xl bg-background/80 backdrop-blur-xl border border-border/40 shadow-2xl px-1.5 py-1.5 overflow-hidden">
              {/* Premium Tab switcher */}
              <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1 mb-2 border border-border/10 flex gap-1">
                <button
                  onClick={() => handleModeChange('preset')}
                  className={cn(
                    'flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 relative overflow-hidden',
                    agentMode === 'preset'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm'
                      : 'text-muted-foreground/60 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent',
                  )}
                >
                  {t('settings.agentModePreset')}
                  {agentMode === 'preset' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  )}
                </button>
                <button
                  onClick={() => handleModeChange('auto')}
                  className={cn(
                    'flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden',
                    agentMode === 'auto'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm'
                      : 'text-muted-foreground/60 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent',
                  )}
                >
                  <Sparkles
                    className={cn(
                      'size-3.5',
                      agentMode === 'auto'
                        ? 'text-amber-500 animate-pulse'
                        : 'text-muted-foreground/40',
                    )}
                  />
                  {t('settings.agentModeAuto')}
                  {agentMode === 'auto' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  )}
                </button>
              </div>

              {agentMode === 'preset' ? (
                /* Agent list — higher contrast card-like design */
                <div className="max-h-[420px] overflow-y-auto px-1 group/list scrollbar-hide">
                  {agents
                    .filter((a) => a.role !== 'teacher')
                    .map((agent) => {
                      const isSelected = selectedAgentIds.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className={cn(
                            'w-full flex items-center gap-3.5 px-3 py-3 text-left transition-all duration-300 cursor-pointer rounded-2xl mb-1.5 group/item active:scale-[0.98]',
                            isSelected
                              ? 'bg-black/5 dark:bg-white/5 border border-border/10 ring-1 ring-white/5'
                              : 'hover:bg-muted/10 border border-transparent',
                          )}
                        >
                          <div className="relative">
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 shadow-sm"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-amber-500/20 blur-[8px] rounded animate-pulse" />
                            )}
                          </div>

                          <div
                            className={cn(
                              'size-10 rounded-2xl overflow-hidden shrink-0 transition-all duration-500 border border-border/20 shadow-sm',
                              isSelected
                                ? 'scale-105'
                                : 'grayscale-[40%] opacity-80 group-hover/item:grayscale-0 group-hover/item:opacity-100',
                            )}
                            style={{
                              boxShadow: isSelected
                                ? `0 8px 16px -4px ${agent.color}40, 0 0 0 2px ${agent.color}20`
                                : undefined,
                            }}
                          >
                            <img
                              src={agent.avatar}
                              alt={getAgentName(agent)}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={cn(
                                  'text-[13px] font-bold tracking-tight transition-colors',
                                  isSelected
                                    ? 'text-foreground'
                                    : 'text-muted-foreground group-hover/item:text-foreground',
                                )}
                              >
                                {getAgentName(agent)}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/30 px-1.5 py-0.5 rounded-full border border-border/10">
                                {getAgentRole(agent)}
                              </span>
                            </div>
                            {(() => {
                              const descKey = `settings.agentDescriptions.${agent.id}`;
                              const desc = t(descKey);
                              return desc !== descKey ? (
                                <p
                                  className={cn(
                                    'text-[11px] leading-relaxed mt-1 line-clamp-2 transition-colors',
                                    isSelected
                                      ? 'text-muted-foreground'
                                      : 'text-muted-foreground/50',
                                  )}
                                >
                                  {desc}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center pt-10 pb-6 gap-8 animate-in fade-in zoom-in-95 duration-500">
                  {/* Shuffle icon with high-end ambient animation */}
                  <div className="relative flex items-center justify-center">
                    {/* Multi-layered ripples */}
                    <div className="absolute size-16 rounded-full bg-amber-500/10 animate-ping animation-duration-[3s]" />
                    <div className="absolute size-20 rounded-full bg-amber-500/5 animate-pulse animation-duration-[2.5s] delay-300" />
                    <div className="absolute size-24 rounded-full border border-amber-500/10 animate-pulse animation-duration-[4s]" />

                    {/* Central Icon with glow */}
                    <div className="relative size-14 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                      <Shuffle className="size-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[13px] font-bold text-foreground mb-1">
                      Dynamic Orchestration
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[200px] mx-auto">
                      {t('settings.agentModeAutoDesc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Max turns — premium footer control */}
              <div className="mt-1 bg-muted/20 rounded-2xl p-3 flex items-center justify-between border-t border-border/10">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-amber-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t('settings.maxTurns')}
                  </span>
                </div>
                <div className="relative group/input">
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={maxTurns}
                    onChange={(e) => setMaxTurns(e.target.value)}
                    className="w-20 h-9 rounded-xl border-border/20 bg-background/50 text-center font-bold text-xs focus:ring-2 focus:ring-amber-500/20 transition-all group-hover/input:border-border/40"
                  />
                  <div className="absolute -right-1 -top-1 size-3 bg-amber-500/10 rounded-full blur-[4px] opacity-0 group-hover/input:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
