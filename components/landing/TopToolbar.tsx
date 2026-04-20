'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings';
import type { SettingsSection } from '@/lib/types/settings';

interface TopToolbarProps {
  needsSetup: boolean;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  settingsSection?: SettingsSection;
  onSettingsSectionChange: (section?: SettingsSection) => void;
}

export function TopToolbar({
  needsSetup,
  settingsOpen,
  onSettingsOpenChange,
  settingsSection,
  onSettingsSectionChange,
}: TopToolbarProps) {
  const { t, locale, setLocale } = useI18n();
  const [languageOpen, setLanguageOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!languageOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageOpen]);

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed top-6 right-6 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        }}
      >
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setLanguageOpen(!languageOpen);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-foreground/70 hover:bg-white/25 dark:hover:bg-white/15 hover:text-foreground transition-all active:scale-95"
          >
            {locale === 'hi-IN' ? 'HI' : 'EN'}
          </button>
          <AnimatePresence>
            {languageOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-3 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden z-50 min-w-[120px]"
              >
                <button
                  onClick={() => {
                    setLocale('en-US');
                    setLanguageOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors',
                    locale === 'en-US' &&
                      'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold',
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLocale('hi-IN');
                    setLanguageOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors',
                    locale === 'hi-IN' &&
                      'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold',
                  )}
                >
                  हिन्दी
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[1px] h-4 bg-white/20" />

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => {
              onSettingsSectionChange(undefined);
              onSettingsOpenChange(true);
            }}
            className={cn(
              'p-2 rounded-full text-foreground/60 hover:bg-white/25 dark:hover:bg-white/15 hover:text-foreground transition-all group active:scale-90',
              needsSetup && 'animate-setup-glow',
            )}
          >
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          </button>
          {needsSetup && (
            <>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-setup-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="animate-setup-float absolute top-full mt-2 right-0 whitespace-nowrap text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full shadow-sm pointer-events-none"
              >
                {t('settings.setupNeeded')}
              </motion.span>
            </>
          )}
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          onSettingsOpenChange(open);
          if (!open) onSettingsSectionChange(undefined);
        }}
        initialSection={settingsSection}
      />
    </>
  );
}
