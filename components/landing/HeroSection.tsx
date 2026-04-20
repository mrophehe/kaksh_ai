'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { LiquidMetalButton } from '@/components/liquid-metal-button';
import { useI18n } from '@/lib/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { GenerationToolbar } from '@/components/generation/generation-toolbar';
import { AgentBar } from '@/components/agent/agent-bar';
import { SpeechButton } from '@/components/audio/speech-button';
import { GreetingBar } from './GreetingBar';
import type { FormState } from './types';
import type { SettingsSection } from '@/lib/types/settings';

interface HeroSectionProps {
  form: FormState;
  updateForm: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  updateRequirementCache: (value: string) => void;
  error: string | null;
  canGenerate: boolean;
  scraping: boolean;
  classroomsCount: number;
  onGenerate: () => void;
  onSettingsOpen: (section?: SettingsSection) => void;
}

export function HeroSection({
  form,
  updateForm,
  updateRequirementCache,
  error,
  canGenerate,
  scraping,
  classroomsCount,
  onGenerate,
  onSettingsOpen,
}: HeroSectionProps) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canGenerate) onGenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'relative z-20 w-full max-w-[800px] flex flex-col items-center pb-24',
        classroomsCount === 0 ? 'justify-center min-h-[calc(100dvh-8rem)]' : 'mt-[6vh]',
      )}
    >
      {/* ── Logo ── */}
      <motion.img
        src="/kakshailogo.png"
        alt="Kaksh AI"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.1,
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        className="h-12 md:h-16 mb-2 -ml-2 md:-ml-3"
      />

      {/* ── Slogan ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-sm text-white font-medium mb-8 drop-shadow-sm"
      >
        {t('home.slogan')}
      </motion.p>

      {/* ── Liquid Glass Chat Box ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full"
      >
        <div
          className={cn('relative w-full rounded-2xl', 'transition-shadow duration-500')}
          style={{
            background:
              'linear-gradient(135deg, rgba(254,240,138,0.35) 0%, rgba(253,224,71,0.22) 40%, rgba(251,191,36,0.28) 100%)',
            backdropFilter: 'blur(32px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
            border: '1px solid rgba(234,179,8,0.45)',
            boxShadow:
              '0 8px 32px rgba(234,179,8,0.18), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(234,179,8,0.1)',
          }}
        >
          {/* ── Hyper-Glass Layering ── */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse at 50% -20%, rgba(254,240,138,0.15) 0%, transparent 80%)',
            }}
          >
            {/* Moving Light Highlight */}
            <motion.div
              className="absolute inset-[-100%] bg-linear-to-tr from-transparent via-white/[0.03] to-transparent rotate-45"
              animate={{ x: ['-50%', '150%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* ── Greeting + Profile + Agents ── */}
          <div className="relative z-20 flex items-start justify-between">
            <GreetingBar />
            <div className="pr-3 pt-3.5 shrink-0">
              <AgentBar />
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder={t('upload.requirementPlaceholder')}
            className="relative z-10 w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden resize-none border-0 bg-transparent px-4 pt-1 pb-2 text-[14px] font-medium leading-relaxed placeholder:text-foreground/50 text-foreground focus:outline-none min-h-[140px] max-h-[300px]"
            value={form.requirement}
            onChange={(e) => updateForm('requirement', e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
          />

          {/* Toolbar row */}
          <div className="relative z-10 px-3 pb-3 flex items-end gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
              <GenerationToolbar
                language={form.language}
                onLanguageChange={(lang) => updateForm('language', lang)}
                webSearch={form.webSearch}
                onWebSearchChange={(v) => updateForm('webSearch', v)}
                onSettingsOpen={(section) => onSettingsOpen(section)}
                pdfFile={form.pdfFile}
                onPdfFileChange={(f) => updateForm('pdfFile', f)}
                onPdfError={(err) => console.error(err)}
                urlInput={form.urlInput}
                onUrlInputChange={(v: string) => updateForm('urlInput', v)}
              />
            </div>

            {/* Voice input */}
            <SpeechButton
              size="md"
              onTranscription={(text) => {
                const current = form.requirement;
                const next = current + (current ? ' ' : '') + text;
                updateRequirementCache(next);
                updateForm('requirement', next);
              }}
            />

            {/* Send button */}
            {scraping ? (
              <button
                disabled
                className="shrink-0 h-8 rounded-lg flex items-center justify-center gap-1.5 px-3 bg-black/10 dark:bg-black/30 text-foreground/50 cursor-not-allowed"
              >
                <Loader2 className="size-3.5 animate-spin" />
                <span className="text-xs font-medium">{t('upload.scraping')}</span>
              </button>
            ) : (
              <div className={cn('mt-2', !canGenerate && 'opacity-50 pointer-events-none')}>
                <LiquidMetalButton
                  label={t('toolbar.enterClassroom')}
                  onClick={onGenerate}
                  width={120}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 w-full p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
