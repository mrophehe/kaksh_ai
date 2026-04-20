'use client';

import { useState, useRef, useMemo } from 'react';
import { Bot, Check, Globe, Paperclip, FileText, X, Globe2, Link2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useSettingsStore } from '@/lib/store/settings';
import { PDF_PROVIDERS } from '@/lib/pdf/constants';
import type { PDFProviderId } from '@/lib/pdf/types';
import { WEB_SEARCH_PROVIDERS } from '@/lib/web-search/constants';
import type { WebSearchProviderId } from '@/lib/web-search/types';
import type { ProviderId } from '@/lib/ai/providers';
import type { SettingsSection } from '@/lib/types/settings';
import { MediaPopover } from '@/components/generation/media-popover';

// ─── Constants ───────────────────────────────────────────────
const MAX_PDF_SIZE_MB = 50;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

// ─── Types ───────────────────────────────────────────────────
export interface GenerationToolbarProps {
  language: 'en-US' | 'hi-IN';
  onLanguageChange: (lang: 'en-US' | 'hi-IN') => void;
  webSearch: boolean;
  onWebSearchChange: (v: boolean) => void;
  onSettingsOpen: (section?: SettingsSection) => void;
  pdfFile: File | null;
  onPdfFileChange: (file: File | null) => void;
  onPdfError: (error: string | null) => void;
  // Firecrawl URL
  urlInput?: string;
  onUrlInputChange?: (url: string) => void;
}

// ─── Component ───────────────────────────────────────────────
export function GenerationToolbar({
  language,
  onLanguageChange,
  webSearch,
  onWebSearchChange,
  onSettingsOpen,
  pdfFile,
  onPdfFileChange,
  onPdfError,
  urlInput,
  onUrlInputChange,
}: GenerationToolbarProps) {
  const { t } = useI18n();
  const currentProviderId = useSettingsStore((s) => s.providerId);
  const currentModelId = useSettingsStore((s) => s.modelId);
  const providersConfig = useSettingsStore((s) => s.providersConfig);
  const setModel = useSettingsStore((s) => s.setModel);
  const pdfProviderId = useSettingsStore((s) => s.pdfProviderId);
  const pdfProvidersConfig = useSettingsStore((s) => s.pdfProvidersConfig);
  const setPDFProvider = useSettingsStore((s) => s.setPDFProvider);
  const webSearchProviderId = useSettingsStore((s) => s.webSearchProviderId);
  const webSearchProvidersConfig = useSettingsStore((s) => s.webSearchProvidersConfig);
  const setWebSearchProvider = useSettingsStore((s) => s.setWebSearchProvider);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Check if the selected web search provider has a valid config (API key or server-configured)
  const webSearchProvider = WEB_SEARCH_PROVIDERS[webSearchProviderId];
  const webSearchConfig = webSearchProvidersConfig[webSearchProviderId];
  const webSearchAvailable = webSearchProvider
    ? !webSearchProvider.requiresApiKey ||
      !!webSearchConfig?.apiKey ||
      !!webSearchConfig?.isServerConfigured
    : false;

  // Configured LLM providers (only those with valid credentials + models + endpoint)
  const configuredProviders = providersConfig
    ? Object.entries(providersConfig)
        .filter(
          ([, config]) =>
            (!config.requiresApiKey || config.apiKey || config.isServerConfigured) &&
            config.models.length >= 1 &&
            (config.baseUrl || config.defaultBaseUrl || config.serverBaseUrl),
        )
        .map(([id, config]) => ({
          id: id as ProviderId,
          name: config.name,
          icon: config.icon,
          isServerConfigured: config.isServerConfigured,
          models:
            config.isServerConfigured && !config.apiKey && config.serverModels?.length
              ? config.models.filter((m) => new Set(config.serverModels).has(m.id))
              : config.models,
        }))
    : [];

  const currentProviderConfig = providersConfig?.[currentProviderId];

  // PDF handler
  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') return;
    if (file.size > MAX_PDF_SIZE_BYTES) {
      onPdfError(t('upload.fileTooLarge'));
      return;
    }
    onPdfError(null);
    onPdfFileChange(file);
  };

  // ─── Pill button helper ─────────────────────────────
  const pillCls =
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer select-none whitespace-nowrap border active:scale-95';
  const pillMuted = `${pillCls} border-border/40 text-muted-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:border-border/60`;
  const pillActive = `${pillCls} border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]`;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* ── Model selector ── */}
      {configuredProviders.length > 0 ? (
        <ModelSelectorPopover
          configuredProviders={configuredProviders}
          currentProviderId={currentProviderId}
          currentModelId={currentModelId}
          currentProviderConfig={currentProviderConfig}
          setModel={setModel}
          t={t}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSettingsOpen('providers')}
              className={cn(
                pillCls,
                'text-amber-700 dark:text-amber-300 animate-pulse',
                'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
              )}
            >
              <Bot className="size-3.5" />
              <span>{t('toolbar.configureProvider')}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.configureProviderHint')}</TooltipContent>
        </Tooltip>
      )}

      {/* ── Separator ── */}
      <div className="w-px h-5 bg-border/20 mx-1.5" />

      {/* ── PDF (parser + upload) combined Popover ── */}
      <Popover>
        <PopoverTrigger asChild>
          {pdfFile ? (
            <button className={pillActive}>
              <Paperclip className="size-3.5" />
              <span className="max-w-25 truncate">{pdfFile.name}</span>
              <span
                role="button"
                className="size-4 rounded-full inline-flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onPdfFileChange(null);
                }}
              >
                <X className="size-2.5" />
              </span>
            </button>
          ) : (
            <button className={pillMuted}>
              <Paperclip className="size-3.5" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          {/* Parser selector */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {t('toolbar.pdfParser')}
            </span>
            <Select value={pdfProviderId} onValueChange={(v) => setPDFProvider(v as PDFProviderId)}>
              <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PDF_PROVIDERS).map((provider) => {
                  const cfg = pdfProvidersConfig[provider.id];
                  const available =
                    !provider.requiresApiKey || !!cfg?.apiKey || !!cfg?.isServerConfigured;
                  return (
                    <SelectItem key={provider.id} value={provider.id} disabled={!available}>
                      <div className={cn('flex items-center gap-1.5', !available && 'opacity-50')}>
                        {provider.icon && (
                          <img src={provider.icon} alt={provider.name} className="w-3.5 h-3.5" />
                        )}
                        {provider.name}
                        {cfg?.isServerConfigured && (
                          <span className="text-[9px] px-1 py-0 rounded border text-muted-foreground">
                            {t('settings.serverConfigured')}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Upload area / file info */}
          <div className="px-3 pb-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = '';
              }}
            />
            {pdfFile ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <FileText className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{pdfFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onPdfFileChange(null)}
                  className="w-full text-xs text-destructive hover:underline text-left"
                >
                  {t('toolbar.removePdf')}
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors cursor-pointer',
                  isDragging
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                    : 'border-muted-foreground/20 hover:border-amber-300',
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              >
                <Paperclip className="size-5 text-muted-foreground/50 mb-1.5" />
                <p className="text-xs font-medium">{t('toolbar.pdfUpload')}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {t('upload.pdfSizeLimit')}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Web Search ── */}
      {webSearchAvailable ? (
        <Popover>
          <PopoverTrigger asChild>
            <button className={webSearch ? pillActive : pillMuted}>
              <Globe2 className={cn('size-3.5', webSearch && 'animate-pulse')} />
              {webSearch && (
                <span>{WEB_SEARCH_PROVIDERS[webSearchProviderId]?.name || 'Search'}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 space-y-3">
            {/* Toggle */}
            <button
              onClick={() => onWebSearchChange(!webSearch)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                webSearch
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <Globe2
                className={cn(
                  'size-4 shrink-0',
                  webSearch ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">
                  {webSearch ? t('toolbar.webSearchOn') : t('toolbar.webSearchOff')}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {t('toolbar.webSearchDesc')}
                </p>
              </div>
            </button>

            {/* Provider selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {t('toolbar.webSearchProvider')}
              </span>
              <Select
                value={webSearchProviderId}
                onValueChange={(v) => setWebSearchProvider(v as WebSearchProviderId)}
              >
                <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(WEB_SEARCH_PROVIDERS).map((provider) => {
                    const cfg = webSearchProvidersConfig[provider.id];
                    const available =
                      !provider.requiresApiKey || !!cfg?.apiKey || !!cfg?.isServerConfigured;
                    return (
                      <SelectItem key={provider.id} value={provider.id} disabled={!available}>
                        <div
                          className={cn('flex items-center gap-1.5', !available && 'opacity-50')}
                        >
                          {provider.name}
                          {cfg?.isServerConfigured && (
                            <span className="text-[9px] px-1 py-0 rounded border text-muted-foreground">
                              {t('settings.serverConfigured')}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Firecrawl URL input */}
            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/[0.06] dark:bg-amber-500/[0.08] px-2.5 py-1.5 transition-colors focus-within:border-amber-400/50">
                <Link2 className="size-3 shrink-0 text-amber-400/70" />
                <input
                  type="url"
                  placeholder={t('upload.urlPlaceholder') || 'Paste Firecrawl URL'}
                  className="flex-1 bg-transparent text-xs font-medium placeholder:text-foreground/50 text-foreground focus:outline-none min-w-0"
                  value={urlInput || ''}
                  onChange={(e) => onUrlInputChange?.(e.target.value)}
                />
                {urlInput && (
                  <button
                    onClick={() => onUrlInputChange?.('')}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className={cn(pillCls, 'text-muted-foreground/40 cursor-not-allowed')} disabled>
              <Globe2 className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.webSearchNoProvider')}</TooltipContent>
        </Tooltip>
      )}

      {/* ── Language pill ── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onLanguageChange(language === 'hi-IN' ? 'en-US' : 'hi-IN')}
            className={pillMuted}
          >
            <Globe className="size-3.5" />
            <span>{language === 'hi-IN' ? 'HI' : 'EN'}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.languageHint')}</TooltipContent>
      </Tooltip>

      {/* ── Separator ── */}
      <div className="w-px h-4 bg-border/60 mx-1" />

      {/* ── Media popover ── */}
      <MediaPopover onSettingsOpen={onSettingsOpen} />
    </div>
  );
}

// ─── ModelSelectorPopover (two-level: provider → model) ─────
interface ConfiguredProvider {
  id: ProviderId;
  name: string;
  icon?: string;
  isServerConfigured?: boolean;
  models: { id: string; name: string }[];
}

function ModelSelectorPopover({
  configuredProviders,
  currentProviderId,
  currentModelId,
  currentProviderConfig,
  setModel,
  t,
}: {
  configuredProviders: ConfiguredProvider[];
  currentProviderId: ProviderId;
  currentModelId: string;
  currentProviderConfig: { name: string; icon?: string } | undefined;
  setModel: (providerId: ProviderId, modelId: string) => void;
  t: (key: string) => string;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredProviders = useMemo(() => {
    if (!search.trim()) return configuredProviders;
    const lowerSearch = search.toLowerCase();
    return configuredProviders
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            m.name.toLowerCase().includes(lowerSearch) ||
            m.id.toLowerCase().includes(lowerSearch) ||
            p.name.toLowerCase().includes(lowerSearch),
        ),
      }))
      .filter((p) => p.models.length > 0);
  }, [configuredProviders, search]);

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(open) => {
        setPopoverOpen(open);
        if (open) setSearch('');
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center justify-center size-8 rounded-full transition-all duration-300 cursor-pointer select-none border active:scale-90',
                currentModelId
                  ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_12px_-2px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'
                  : 'border-border/40 hover:border-border/60 hover:bg-muted/60',
              )}
            >
              {currentProviderConfig?.icon ? (
                <img
                  src={currentProviderConfig.icon}
                  alt={currentProviderConfig.name}
                  className="size-4 rounded-sm"
                />
              ) : (
                <Bot className="size-3.5 text-muted-foreground" />
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {currentModelId
            ? `${currentProviderConfig?.name || currentProviderId} / ${currentModelId}`
            : t('settings.selectModel')}
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={12}
        className="w-72 p-0 flex flex-col max-h-[400px] bg-background/80 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Search */}
        <div className="p-3 border-b border-border/10 sticky top-0 bg-transparent z-10">
          <div className="relative group">
            <Bot className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground transition-colors group-focus-within:text-amber-500" />
            <input
              autoFocus
              className="w-full bg-black/5 dark:bg-white/5 border-border/10 rounded-xl py-2 pl-8 pr-3 text-xs focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              placeholder={t('settings.searchModels') || 'Search models...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* All Models grouped by Provider */}
        <div className="flex-1 overflow-y-auto">
          {filteredProviders.length === 0 ? (
            <div className="p-8 text-center bg-muted/20">
              <Bot className="size-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {t('settings.noModelsFound') || 'No models found'}
              </p>
            </div>
          ) : (
            filteredProviders.map((provider) => (
              <div key={provider.id} className="mb-0.5">
                {/* Provider Header */}
                <div className="px-3 py-2 bg-muted/20 sticky top-0 flex items-center gap-2 border-y border-border/10 backdrop-blur-md">
                  {provider.icon ? (
                    <img src={provider.icon} alt="" className="size-4 rounded-sm shadow-sm" />
                  ) : (
                    <Bot className="size-4 text-muted-foreground/60" />
                  )}
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/80">
                    {provider.name}
                  </span>
                  {provider.isServerConfigured && (
                    <span className="text-[8px] px-1.5 py-0 rounded-full border border-amber-500/20 text-amber-600/70 dark:text-amber-400/70 ml-auto bg-amber-500/5">
                      {t('settings.serverConfigured')}
                    </span>
                  )}
                </div>

                {/* Models */}
                <div className="p-1 gap-px grid">
                  {provider.models.map((model) => {
                    const isSelected =
                      currentProviderId === provider.id && currentModelId === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          setModel(provider.id, model.id);
                          setPopoverOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-all rounded-md',
                          isSelected
                            ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/20'
                            : 'hover:bg-muted/60 text-foreground/80 hover:text-foreground',
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{model.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground/60 truncate">
                            {model.id}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
