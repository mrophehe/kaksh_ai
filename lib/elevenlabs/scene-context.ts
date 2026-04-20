import type { SpeechAction } from '@/lib/types/action';
import type { Scene } from '@/lib/types/stage';
import type { PPTElement } from '@/lib/types/slides';

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlideReadableText(elements: PPTElement[]): string[] {
  return elements
    .flatMap((element) => {
      if (element.type === 'text') {
        return [stripMarkup(element.content)];
      }

      if (element.type === 'shape' && element.text?.content) {
        return [stripMarkup(element.text.content)];
      }

      return [];
    })
    .filter(Boolean);
}

export function getSceneReadableText(scene: Scene, limit: number = 3): string[] {
  switch (scene.content.type) {
    case 'slide':
      return getSlideReadableText(scene.content.canvas.elements).slice(0, limit);
    case 'quiz':
      return scene.content.questions
        .map((question) => stripMarkup(question.question))
        .filter(Boolean)
        .slice(0, limit);
    case 'interactive':
      return [scene.content.url].filter(Boolean).slice(0, limit);
    case 'pbl':
      return [
        stripMarkup(scene.content.projectConfig.projectInfo.title),
        stripMarkup(scene.content.projectConfig.projectInfo.description),
      ]
        .filter(Boolean)
        .slice(0, limit);
    default:
      return [];
  }
}

export function getSceneLectureNotes(
  scene: Scene,
  maxItems: number = 4,
  maxCharacters: number = 500,
): string {
  const notes = (scene.actions ?? [])
    .filter((action): action is SpeechAction => action.type === 'speech')
    .map((action) => stripMarkup(action.text))
    .filter(Boolean)
    .slice(0, maxItems)
    .join(' ');

  return notes.slice(0, maxCharacters);
}

export function buildSceneContextSummary(
  scene: Scene,
  position: {
    index: number;
    total: number;
  },
): string {
  const parts = [
    `The student is now viewing slide ${position.index} of ${position.total}: "${scene.title}".`,
  ];
  const readableText = getSceneReadableText(scene);
  const lectureNotes = getSceneLectureNotes(scene);

  if (readableText.length > 0) {
    parts.push(`Visible content: ${readableText.join(' | ').slice(0, 300)}`);
  }

  if (lectureNotes) {
    parts.push(`Lecture notes: ${lectureNotes}`);
  }

  return parts.join(' ');
}
