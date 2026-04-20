'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { ClassroomCard } from './ClassroomCard';
import type { StageListItem } from '@/lib/utils/stage-storage';
import type { Slide } from '@/lib/types/slides';

interface RecentClassroomsProps {
  classrooms: StageListItem[];
  thumbnails: Record<string, Slide>;
  recentOpen: boolean;
  setRecentOpen: (open: boolean) => void;
  pendingDeleteId: string | null;
  setPendingDeleteId: (id: string | null) => void;
  formatDate: (ts: number) => string;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onConfirmDelete: (id: string) => void;
  onClassroomClick: (id: string) => void;
}

export function RecentClassrooms({
  classrooms,
  thumbnails,
  recentOpen,
  setRecentOpen,
  pendingDeleteId,
  setPendingDeleteId,
  formatDate,
  onDelete,
  onConfirmDelete,
  onClassroomClick,
}: RecentClassroomsProps) {
  const { t } = useI18n();

  if (classrooms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative z-10 mt-10 w-full max-w-6xl flex flex-col items-center"
    >
      {/* Trigger — divider-line with centered text */}
      <button
        onClick={() => {
          const next = !recentOpen;
          setRecentOpen(next);
          try {
            localStorage.setItem('recentClassroomsOpen', String(next));
          } catch {
            /* ignore */
          }
        }}
        className="group w-full flex items-center gap-4 py-2 cursor-pointer"
      >
        <div className="flex-1 h-px bg-border/40 group-hover:bg-border/70 transition-colors" />
        <span className="shrink-0 flex items-center gap-2 text-[13px] text-muted-foreground/60 group-hover:text-foreground/70 transition-colors select-none">
          <Clock className="size-3.5" />
          {t('classroom.recentClassrooms')}
          <span className="text-[11px] tabular-nums opacity-60">{classrooms.length}</span>
          <motion.div
            animate={{ rotate: recentOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronDown className="size-3.5" />
          </motion.div>
        </span>
        <div className="flex-1 h-px bg-border/40 group-hover:bg-border/70 transition-colors" />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {recentOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full overflow-hidden"
          >
            <div className="pt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {classrooms.map((classroom, i) => (
                <motion.div
                  key={classroom.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.35,
                    ease: 'easeOut',
                  }}
                >
                  <ClassroomCard
                    classroom={classroom}
                    slide={thumbnails[classroom.id]}
                    formatDate={formatDate}
                    onDelete={onDelete}
                    confirmingDelete={pendingDeleteId === classroom.id}
                    onConfirmDelete={() => onConfirmDelete(classroom.id)}
                    onCancelDelete={() => setPendingDeleteId(null)}
                    onClick={() => onClassroomClick(classroom.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
