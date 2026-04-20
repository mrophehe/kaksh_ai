/**
 * ElevenAgents Client Tools
 *
 * These are client-side tools that the ElevenLabs voice agent can invoke
 * during a conversation. They enable the AI teacher to:
 * - Search the web via Firecrawl
 * - Navigate between slides
 * - Draw on the whiteboard
 * - Get current slide content for context
 */

import { createStageAPI } from '@/lib/api/stage-api';
import { useStageStore } from '@/lib/store/stage';
import { useCanvasStore } from '@/lib/store/canvas';
import { useSettingsStore } from '@/lib/store/settings';
import { getSceneLectureNotes, getSceneReadableText } from '@/lib/elevenlabs/scene-context';
import type { PPTTextElement } from '@/lib/types/slides';

const WHITEBOARD_WIDTH = 1000;
const WHITEBOARD_HEIGHT = 562;
const DEFAULT_WHITEBOARD_X = 80;
const DEFAULT_WHITEBOARD_Y = 72;
const DEFAULT_WHITEBOARD_TEXT_WIDTH = 400;
const DEFAULT_WHITEBOARD_TEXT_HEIGHT = 100;
const DEFAULT_WHITEBOARD_FONT_SIZE = 18;
const DEFAULT_WHITEBOARD_TEXT_COLOR = '#333333';

const stageAPI = createStageAPI(useStageStore);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getStringParameter(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumberParameter(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function escapeWhiteboardText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br />');
}

function ensureWhiteboard() {
  const whiteboardResult = stageAPI.whiteboard.get();
  if (!whiteboardResult.success || !whiteboardResult.data) {
    throw new Error(whiteboardResult.error || 'Unable to access whiteboard');
  }

  useCanvasStore.getState().setWhiteboardOpen(true);
  return whiteboardResult.data;
}

/**
 * Client tools configuration for useConversation.
 * Each tool receives parameters from the agent and returns a string result.
 */
export const clientTools: Record<string, (parameters: Record<string, unknown>) => Promise<string>> =
  {
    /**
     * Search the web using Firecrawl.
     * The agent can call this to look up information mid-conversation.
     */
    searchWeb: async (parameters: Record<string, unknown>): Promise<string> => {
      const query = parameters.query as string;
      if (!query) return 'No search query provided.';

      try {
        const settings = useSettingsStore.getState();
        const webSearchConfig = settings.webSearchProvidersConfig[settings.webSearchProviderId];
        const res = await fetch('/api/web-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            maxResults: 3,
            apiKey: webSearchConfig?.apiKey || undefined,
            baseUrl: webSearchConfig?.baseUrl || undefined,
          }),
        });

        if (!res.ok) return `Search failed with status ${res.status}`;

        const data = await res.json();
        if (!data.success) return 'Search returned no results.';

        // Push source citations to voice panel
        const addSource = (window as unknown as Record<string, unknown>).__kakshaiAddSource as
          | ((s: { title: string; url: string }) => void)
          | undefined;
        if (addSource && data.sources) {
          for (const src of data.sources as { title?: string; url?: string }[]) {
            if (src.url) {
              addSource({ title: src.title || src.url, url: src.url });
            }
          }
        }

        const context =
          data.context ||
          data.sources
            ?.map(
              (r: { title: string; content: string }) => `${r.title}: ${r.content?.slice(0, 300)}`,
            )
            .join('\n\n');

        return context || 'No results found.';
      } catch (error) {
        return `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },

    /**
     * Navigate to a specific slide or direction.
     * direction: "next", "prev", or a slide number (1-indexed).
     */
    navigateSlide: async (parameters: Record<string, unknown>): Promise<string> => {
      const direction = parameters.direction as string;
      const store = useStageStore.getState();
      const { scenes, currentSceneId } = store;

      if (!scenes.length) return 'No slides available.';

      const currentIndex = currentSceneId ? scenes.findIndex((s) => s.id === currentSceneId) : -1;

      let targetIndex: number;

      if (direction === 'next') {
        targetIndex = Math.min(currentIndex + 1, scenes.length - 1);
      } else if (direction === 'prev' || direction === 'previous') {
        targetIndex = Math.max(currentIndex - 1, 0);
      } else {
        const num = parseInt(direction, 10);
        if (isNaN(num)) return `Invalid direction: ${direction}`;
        targetIndex = Math.max(0, Math.min(num - 1, scenes.length - 1));
      }

      const targetScene = scenes[targetIndex];
      store.setCurrentSceneId(targetScene.id);

      return `Navigated to slide ${targetIndex + 1}: "${targetScene.title}"`;
    },

    /**
     * Draw a text explanation on the classroom whiteboard.
     * The board is automatically opened if it is currently hidden.
     */
    drawOnWhiteboard: async (parameters: Record<string, unknown>): Promise<string> => {
      const text = getStringParameter(parameters.text);
      if (!text) return 'No whiteboard text provided.';

      const x = clamp(
        getNumberParameter(parameters.x, DEFAULT_WHITEBOARD_X),
        0,
        WHITEBOARD_WIDTH - 80,
      );
      const y = clamp(
        getNumberParameter(parameters.y, DEFAULT_WHITEBOARD_Y),
        0,
        WHITEBOARD_HEIGHT - 48,
      );
      const width = clamp(
        getNumberParameter(parameters.width, DEFAULT_WHITEBOARD_TEXT_WIDTH),
        120,
        WHITEBOARD_WIDTH - x,
      );
      const height = clamp(
        getNumberParameter(parameters.height, DEFAULT_WHITEBOARD_TEXT_HEIGHT),
        48,
        WHITEBOARD_HEIGHT - y,
      );
      const fontSize = clamp(
        getNumberParameter(parameters.fontSize, DEFAULT_WHITEBOARD_FONT_SIZE),
        12,
        42,
      );
      const color = getStringParameter(parameters.color) || DEFAULT_WHITEBOARD_TEXT_COLOR;

      try {
        const whiteboard = ensureWhiteboard();
        const element: PPTTextElement = {
          id: '',
          type: 'text',
          content: `<p style="font-size: ${fontSize}px;">${escapeWhiteboardText(text)}</p>`,
          left: x,
          top: y,
          width,
          height,
          rotate: 0,
          defaultFontName: 'Arial',
          defaultColor: color,
          textType: 'content',
        };

        const result = stageAPI.whiteboard.addElement(element, whiteboard.id);
        if (!result.success) {
          return `Failed to draw on the whiteboard: ${result.error || 'Unknown error'}`;
        }

        const preview = text.length > 60 ? `${text.slice(0, 57)}...` : text;
        return `Added "${preview}" to the whiteboard at (${Math.round(x)}, ${Math.round(y)}).`;
      } catch (error) {
        return `Whiteboard error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },

    /**
     * Clear the current whiteboard contents.
     */
    clearWhiteboard: async (): Promise<string> => {
      try {
        const whiteboard = ensureWhiteboard();
        if (whiteboard.elements.length === 0) {
          return 'The whiteboard is already empty.';
        }

        const result = stageAPI.whiteboard.update({ elements: [] }, whiteboard.id);
        if (!result.success) {
          return `Failed to clear the whiteboard: ${result.error || 'Unknown error'}`;
        }

        return 'Cleared the whiteboard.';
      } catch (error) {
        return `Whiteboard error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },

    /**
     * Get the content of the current slide for context.
     * The agent can call this to understand what's being shown.
     */
    getCurrentSlideContent: async (): Promise<string> => {
      const store = useStageStore.getState();
      const scene = store.getCurrentScene();

      if (!scene) return 'No slide is currently displayed.';

      const parts: string[] = [`Slide: "${scene.title}"`];

      const textElements = getSceneReadableText(scene);

      if (textElements.length > 0) {
        parts.push('Content: ' + textElements.join(' | '));
      }

      const lectureNotes = getSceneLectureNotes(scene);
      if (lectureNotes) {
        parts.push('Lecture notes: ' + lectureNotes);
      }

      const { scenes } = store;
      const idx = scenes.findIndex((s) => s.id === scene.id);
      parts.push(`(Slide ${idx + 1} of ${scenes.length})`);

      return parts.join('\n');
    },

    /**
     * Show a comprehension checkpoint question to the student.
     * The agent should call this every 2-3 slides to verify understanding.
     */
    showCheckpoint: async (parameters: Record<string, unknown>): Promise<string> => {
      const question = getStringParameter(parameters.question);
      if (!question) return 'No question provided for checkpoint.';

      const rawOptions = parameters.options;
      const options: string[] | undefined = Array.isArray(rawOptions)
        ? rawOptions.filter((o): o is string => typeof o === 'string')
        : undefined;

      const showCheckpoint = (window as unknown as Record<string, unknown>)
        .__kakshaiShowCheckpoint as
        | ((q: { question: string; options?: string[] }) => void)
        | undefined;

      if (showCheckpoint) {
        showCheckpoint({
          question,
          options: options && options.length > 0 ? options : undefined,
        });
      }

      return `Checkpoint question displayed: "${question}"${options ? ` with ${options.length} options` : ''}. Wait for the student to answer before continuing.`;
    },
  };

clientTools.drawWhiteboard = clientTools.drawOnWhiteboard;
