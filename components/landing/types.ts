import type React from 'react';
import type { Slide } from '@/lib/types/slides';
import type { StageListItem } from '@/lib/utils/stage-storage';

export interface FormState {
  pdfFile: File | null;
  requirement: string;
  urlInput: string;
  language: 'en-US' | 'hi-IN';
  webSearch: boolean;
}

export const initialFormState: FormState = {
  pdfFile: null,
  requirement: '',
  urlInput: '',
  language: 'en-US',
  webSearch: false,
};

export interface ClassroomCardProps {
  classroom: StageListItem;
  slide?: Slide;
  formatDate: (ts: number) => string;
  onDelete: (id: string, e: React.MouseEvent) => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onClick: () => void;
}
