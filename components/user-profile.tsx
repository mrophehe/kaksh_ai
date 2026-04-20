'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { Pencil, Check, ImagePlus, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { toast } from 'sonner';
import { useUserProfileStore, AVATAR_OPTIONS } from '@/lib/store/user-profile';

/** Check whether avatar is a custom upload (data-URL) */
function isCustomAvatar(avatar: string) {
  return avatar.startsWith('data:');
}

/** Max uploaded image size before we reject */
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

const FILE_INPUT_ID = 'user-avatar-upload';

export function UserProfileCard() {
  const { t } = useI18n();
  const avatar = useUserProfileStore((s) => s.avatar);
  const nickname = useUserProfileStore((s) => s.nickname);
  const bio = useUserProfileStore((s) => s.bio);
  const setAvatar = useUserProfileStore((s) => s.setAvatar);
  const setNickname = useUserProfileStore((s) => s.setNickname);
  const setBio = useUserProfileStore((s) => s.setBio);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const displayName = nickname || t('profile.defaultNickname');

  const startEditName = () => {
    setNameDraft(nickname);
    setEditingName(true);
  };

  const commitName = () => {
    setNickname(nameDraft.trim());
    setEditingName(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t('profile.fileTooLarge'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidFileType'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(128 / img.width, 128 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (128 - w) / 2, (128 - h) / 2, w, h);
        setAvatar(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!hydrated) {
    return (
      <Card className="p-5 border-border/40 backdrop-blur-3xl bg-background/80 shadow-2xl overflow-hidden relative group/slate">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-muted/20 animate-pulse border border-border/10" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-20 rounded bg-muted/20 animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted/10 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-6 border-white/20 backdrop-blur-3xl bg-white/5 dark:bg-black/40 shadow-2xl overflow-hidden relative transition-all duration-700 select-none group/slate',
        'hover:shadow-amber-500/20 hover:border-amber-500/40 hover:-translate-y-1',
      )}
    >
      {/* ── Hyper-Glass Sheen Effect ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/slate:opacity-100 transition-opacity duration-1000">
        <motion.div
          className="absolute inset-[-100%] bg-linear-to-tr from-transparent via-white/5 dark:via-white/10 to-transparent rotate-45"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* ── Noise Texture Layer ── */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.03] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Floating Atmospheric Glows ── */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[80px] -mr-16 -mt-16 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-600/10 blur-[60px] -ml-12 -mb-12 pointer-events-none" />

      <input
        id={FILE_INPUT_ID}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleAvatarUpload}
      />

      {/* Row 1: Avatar + Role Management */}
      <div className="flex items-start gap-4.5 relative z-10">
        {/* Avatar Plate with Metal Frame */}
        <div className="relative shrink-0">
          <button
            onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}
            className="group/avatar relative block"
          >
            {/* Outer Glow Ring */}
            <div className="absolute inset-[-4px] rounded-full bg-linear-to-br from-amber-500/30 via-orange-500/10 to-transparent blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />

            <div
              className={cn(
                'size-14 rounded-full p-[2px] transition-all duration-700 relative',
                'bg-linear-to-br from-amber-200 via-amber-600 to-orange-800 shadow-2xl group-hover/avatar:scale-110 group-hover/avatar:rotate-3 active:scale-95',
              )}
            >
              {/* Inner Etched Ring */}
              <div className="size-full rounded-full bg-background overflow-hidden relative ring-[1px] ring-white/20">
                <img
                  src={avatar}
                  alt=""
                  className="size-full object-cover transition-transform duration-1000 group-hover/avatar:scale-125"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-white/10 opacity-60" />
              </div>
            </div>

            {/* Command Picker Trigger */}
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-linear-to-br from-amber-400 to-orange-600 border border-white/40 flex items-center justify-center shadow-xl group-hover/avatar:scale-125 transition-all">
              <ChevronDown
                className={cn(
                  'size-3 text-white transition-transform duration-500',
                  avatarPickerOpen && 'rotate-180',
                )}
              />
            </div>
          </button>
        </div>

        {/* Identity Details */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]">
              <span className="size-1.5 rounded-full bg-amber-500 animate-[pulse_1.5s_infinite]" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                Active Student
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-linear-to-r from-amber-500/30 via-transparent to-transparent" />
          </div>

          {editingName ? (
            <div className="flex items-center gap-2 group/input">
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                onBlur={commitName}
                maxLength={20}
                placeholder={t('profile.defaultNickname')}
                className="flex-1 min-w-0 h-10 bg-amber-500/5 dark:bg-amber-500/10 border-b-2 border-amber-500 text-xl font-bold text-foreground outline-none px-3 rounded-t-lg font-display"
              />
              <button
                onClick={commitName}
                className="shrink-0 size-9 rounded-xl flex items-center justify-center bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all"
              >
                <Check className="size-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditName}
              className="group/name flex items-center gap-3 cursor-pointer max-w-full hover:px-1 transition-all"
            >
              <h2 className="text-2xl font-black text-foreground truncate drop-shadow-md font-display tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/80">
                {displayName}
              </h2>
              <div className="p-2 rounded-xl bg-amber-500/0 group-hover/name:bg-amber-500/10 text-muted-foreground/40 group-hover/name:text-amber-500/80 transition-all border border-transparent group-hover/name:border-amber-500/20">
                <Pencil className="size-4" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Avatar Picker — Liquid Expand */}
      <AnimatePresence>
        {avatarPickerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="overflow-hidden relative z-20"
          >
            <div className="mt-4 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/10 backdrop-blur-lg">
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_OPTIONS.map((url) => (
                  <button
                    key={url}
                    onClick={() => setAvatar(url)}
                    className={cn(
                      'aspect-square rounded-full overflow-hidden bg-background cursor-pointer transition-all duration-300 relative',
                      'hover:scale-110 active:scale-95 shadow-sm',
                      avatar === url
                        ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background scale-105'
                        : 'hover:ring-2 hover:ring-amber-500/40 hover:scale-105',
                    )}
                  >
                    <img src={url} alt="" className="size-full object-cover" />
                  </button>
                ))}

                <label
                  htmlFor={FILE_INPUT_ID}
                  className={cn(
                    'aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-2 border-dashed relative',
                    'hover:scale-110 active:scale-95',
                    isCustomAvatar(avatar)
                      ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background border-amber-500 bg-amber-500 shadow-md text-white'
                      : 'border-muted-foreground/20 text-muted-foreground/40 hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5',
                  )}
                  title={t('profile.uploadAvatar')}
                >
                  <ImagePlus className="size-5" />
                </label>
              </div>
              <p className="text-[10px] text-center text-muted-foreground/60 mt-3 italic">
                {t('profile.avatarHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bio Slated Area */}
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              Biometric Profile
            </span>
            <span className="h-[1px] w-8 bg-muted-foreground/20" />
          </div>
          <div className="flex items-center gap-1.5 bg-background/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded-full border border-border/40">
            <div className="size-1 rounded-full bg-amber-500/40" />
            <span className="text-[8px] font-mono text-muted-foreground/60 tabular-nums">
              {bio.length}c
            </span>
          </div>
        </div>

        <div className="relative group/bio">
          {/* Detailed Display Panel Decoration */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/40 rounded-tl-lg z-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/40 rounded-br-lg z-20 pointer-events-none" />

          <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-black/20 via-transparent to-black/5 pointer-events-none z-0" />

          {/* Micro-grid overlay inside the textarea area */}
          <div
            className="absolute inset-2 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
              backgroundSize: '6px 6px',
            }}
          />

          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('profile.bioPlaceholder')}
            maxLength={200}
            rows={4}
            className={cn(
              'w-full resize-none transition-all duration-700 relative z-10',
              'bg-black/10 dark:bg-black/40 border-white/5 rounded-2xl p-4.5 text-sm leading-relaxed',
              'focus:bg-amber-500/[0.04] dark:focus:bg-amber-500/[0.08] focus:border-amber-500/30 focus:ring-0 shadow-2xl',
              'placeholder:text-muted-foreground/20 placeholder:italic font-medium text-foreground/90',
            )}
          />

          {/* Interactive Aura */}
          <div className="absolute inset-[-2px] rounded-[18px] bg-linear-to-br from-amber-500/20 via-orange-500/10 to-transparent opacity-0 group-focus-within/bio:opacity-100 blur-[2px] transition-all duration-700 pointer-events-none" />
        </div>
      </div>
    </Card>
  );
}
