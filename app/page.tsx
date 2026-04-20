'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { BotOff } from 'lucide-react';

import { createLogger } from '@/lib/logger';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useDraftCache } from '@/lib/hooks/use-draft-cache';
import { useSettingsStore } from '@/lib/store/settings';
import { useUserProfileStore } from '@/lib/store/user-profile';
import { useMediaGenerationStore } from '@/lib/store/media-generation';
import { storePdfBlob } from '@/lib/utils/image-storage';
import {
  listStages,
  deleteStageData,
  getFirstSlideByStages,
  type StageListItem,
} from '@/lib/utils/stage-storage';
import type { UserRequirements } from '@/lib/types/generation';
import type { Slide } from '@/lib/types/slides';
import { SettingsDialog } from '@/components/settings';
import {
  TopToolbar,
  BackgroundVideo,
  HeroSection,
  RecentClassrooms,
  initialFormState,
  type FormState,
  WEB_SEARCH_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  RECENT_OPEN_STORAGE_KEY,
} from '@/components/landing';

const log = createLogger('Home');

function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);

  // Draft cache for requirement text
  const { cachedValue: cachedRequirement, updateCache: updateRequirementCache } =
    useDraftCache<string>({ key: 'requirementDraft' });

  // Model setup state
  const currentModelId = useSettingsStore((s) => s.modelId);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);

  // Hydrate client-only state after mount (avoids SSR mismatch)
  /* eslint-disable react-hooks/set-state-in-effect -- Hydration from localStorage must happen in effect */
  useEffect(() => {
    setStoreHydrated(true);
    try {
      const saved = localStorage.getItem(RECENT_OPEN_STORAGE_KEY);
      if (saved !== null) setRecentOpen(saved !== 'false');
    } catch {
      /* localStorage unavailable */
    }
    try {
      const savedWebSearch = localStorage.getItem(WEB_SEARCH_STORAGE_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const updates: Partial<FormState> = {};
      if (savedWebSearch === 'true') updates.webSearch = true;
      if (savedLanguage === 'en-US' || savedLanguage === 'hi-IN') {
        updates.language = savedLanguage;
      } else {
        const detected = navigator.language?.startsWith('hi') ? 'hi-IN' : 'en-US';
        updates.language = detected;
      }
      if (Object.keys(updates).length > 0) {
        setForm((prev) => ({ ...prev, ...updates }));
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Restore requirement draft from cache (derived state pattern — no effect needed)
  const [prevCachedRequirement, setPrevCachedRequirement] = useState(cachedRequirement);
  if (cachedRequirement !== prevCachedRequirement) {
    setPrevCachedRequirement(cachedRequirement);
    if (cachedRequirement) {
      setForm((prev) => ({ ...prev, requirement: cachedRequirement }));
    }
  }

  const needsSetup = storeHydrated && !currentModelId;
  const [error, setError] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<StageListItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, Slide>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    | 'general'
    | 'providers'
    | 'agents'
    | 'tts'
    | 'asr'
    | 'pdf'
    | 'image'
    | 'video'
    | 'web-search'
    | undefined
  >(undefined);

  const loadClassrooms = async () => {
    try {
      const list = await listStages();
      setClassrooms(list);
      // Load first slide thumbnails
      if (list.length > 0) {
        const slides = await getFirstSlideByStages(list.map((c) => c.id));
        setThumbnails(slides);
      }
    } catch (err) {
      log.error('Failed to load classrooms:', err);
    }
  };

  useEffect(() => {
    // Clear stale media store to prevent cross-course thumbnail contamination.
    // The store may hold tasks from a previously visited classroom whose elementIds
    // (gen_img_1, etc.) collide with other courses' placeholders.
    useMediaGenerationStore.getState().revokeObjectUrls();
    useMediaGenerationStore.setState({ tasks: {} });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Store hydration on mount
    loadClassrooms();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    setPendingDeleteId(null);
    try {
      await deleteStageData(id);
      await loadClassrooms();
    } catch (err) {
      log.error('Failed to delete classroom:', err);
      toast.error('Failed to delete classroom');
    }
  };

  const updateForm = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    try {
      if (field === 'webSearch') localStorage.setItem(WEB_SEARCH_STORAGE_KEY, String(value));
      if (field === 'language') localStorage.setItem(LANGUAGE_STORAGE_KEY, String(value));
      if (field === 'requirement') updateRequirementCache(value as string);
    } catch {
      /* ignore */
    }
  };

  const showSetupToast = (icon: React.ReactNode, title: string, desc: string) => {
    toast.custom(
      (id) => (
        <div
          className="w-[356px] rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-amber-950/60 dark:via-slate-900 dark:to-amber-950/60 shadow-lg shadow-amber-500/8 dark:shadow-amber-900/20 p-4 flex items-start gap-3 cursor-pointer"
          onClick={() => {
            toast.dismiss(id);
            setSettingsOpen(true);
          }}
        >
          <div className="shrink-0 mt-0.5 size-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center ring-1 ring-amber-200/50 dark:ring-amber-800/30">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-tight">
              {title}
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
              {desc}
            </p>
          </div>
          <div className="shrink-0 mt-1 text-[10px] font-medium text-amber-500 dark:text-amber-500/70 tracking-wide">
            <span className="animate-spin">⚙️</span>
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  };

  const handleGenerate = async () => {
    // Validate setup before proceeding
    if (!currentModelId) {
      showSetupToast(
        <BotOff className="size-4.5 text-amber-600 dark:text-amber-400" />,
        t('settings.modelNotConfigured'),
        t('settings.setupNeeded'),
      );
      setSettingsOpen(true);
      return;
    }

    if (!form.requirement.trim() && !form.urlInput.trim()) {
      setError(t('upload.requirementRequired'));
      return;
    }

    setError(null);

    try {
      let scrapedContent = '';

      // If URL is provided, scrape it via Firecrawl first
      if (form.urlInput.trim()) {
        setScraping(true);
        try {
          const settings = useSettingsStore.getState();
          const webSearchConfig = settings.webSearchProvidersConfig[settings.webSearchProviderId];
          const scrapeRes = await fetch('/api/scrape-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: form.urlInput.trim(),
              apiKey: webSearchConfig?.apiKey || undefined,
              baseUrl: webSearchConfig?.baseUrl || undefined,
            }),
          });
          const scrapeData = await scrapeRes.json();
          if (scrapeData.success && scrapeData.markdown) {
            scrapedContent = scrapeData.markdown;
            log.info('Scraped URL:', form.urlInput, `(${scrapeData.markdown.length} chars)`);
          } else {
            setError(
              scrapeData.error || 'Failed to scrape URL. Please check the URL and try again.',
            );
            setScraping(false);
            return;
          }
        } catch (scrapeErr) {
          log.error('URL scrape failed:', scrapeErr);
          setError('Failed to scrape URL. Please check the URL and try again.');
          setScraping(false);
          return;
        }
        setScraping(false);
      }

      // Build requirement with scraped content
      const fullRequirement = scrapedContent
        ? form.requirement.trim()
          ? `${form.requirement.trim()}\n\n--- Source Material (from ${form.urlInput.trim()}) ---\n\n${scrapedContent.slice(0, 30000)}`
          : `Create a comprehensive lesson based on this content:\n\n--- Source Material (from ${form.urlInput.trim()}) ---\n\n${scrapedContent.slice(0, 30000)}`
        : form.requirement;

      const userProfile = useUserProfileStore.getState();
      const requirements: UserRequirements = {
        requirement: fullRequirement,
        language: form.language,
        userNickname: userProfile.nickname || undefined,
        userBio: userProfile.bio || undefined,
        webSearch: form.webSearch || undefined,
      };

      let pdfStorageKey: string | undefined;
      let pdfFileName: string | undefined;
      let pdfProviderId: string | undefined;
      let pdfProviderConfig: { apiKey?: string; baseUrl?: string } | undefined;

      if (form.pdfFile) {
        pdfStorageKey = await storePdfBlob(form.pdfFile);
        pdfFileName = form.pdfFile.name;

        const settings = useSettingsStore.getState();
        pdfProviderId = settings.pdfProviderId;
        const providerCfg = settings.pdfProvidersConfig?.[settings.pdfProviderId];
        if (providerCfg) {
          pdfProviderConfig = {
            apiKey: providerCfg.apiKey,
            baseUrl: providerCfg.baseUrl,
          };
        }
      }

      const sessionState = {
        sessionId: nanoid(),
        requirements,
        pdfText: scrapedContent || '',
        pdfImages: [],
        imageStorageIds: [],
        pdfStorageKey,
        pdfFileName,
        pdfProviderId,
        pdfProviderConfig,
        sceneOutlines: null,
        currentStep: 'generating' as const,
      };
      sessionStorage.setItem('generationSession', JSON.stringify(sessionState));

      router.push('/generation-preview');
    } catch (err) {
      log.error('Error preparing generation:', err);
      setError(err instanceof Error ? err.message : t('upload.generateFailed'));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('classroom.today');
    if (diffDays === 1) return t('classroom.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('classroom.daysAgo')}`;
    return date.toLocaleDateString();
  };

  const canGenerate = !!form.requirement.trim() || !!form.urlInput.trim();

  return (
    <>
      <TopToolbar
        needsSetup={needsSetup}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
        settingsSection={settingsSection}
        onSettingsSectionChange={setSettingsSection}
      />

      <div className="relative h-[100dvh] w-full flex flex-col items-center p-4 pt-16 md:p-8 md:pt-16 overflow-hidden">
        <BackgroundVideo />

        <HeroSection
          form={form}
          updateForm={updateForm}
          updateRequirementCache={updateRequirementCache}
          error={error}
          canGenerate={canGenerate}
          scraping={scraping}
          classroomsCount={classrooms.length}
          onGenerate={handleGenerate}
          onSettingsOpen={(section) => {
            setSettingsSection(section);
            setSettingsOpen(true);
          }}
        />

        <RecentClassrooms
          classrooms={classrooms}
          thumbnails={thumbnails}
          recentOpen={recentOpen}
          setRecentOpen={setRecentOpen}
          pendingDeleteId={pendingDeleteId}
          setPendingDeleteId={setPendingDeleteId}
          formatDate={formatDate}
          onDelete={handleDelete}
          onConfirmDelete={confirmDelete}
          onClassroomClick={(id) => router.push(`/classroom/${id}`)}
        />

        {/* Footer */}
        <div className="mt-auto pt-12 pb-4 text-center text-xs text-muted-foreground/40">
          KakshAI — Voice-first AI Classroom powered by ElevenLabs + Firecrawl
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open);
          if (!open) setSettingsSection(undefined);
        }}
        initialSection={settingsSection}
      />
    </>
  );
}

export default function Page() {
  return <HomePage />;
}
