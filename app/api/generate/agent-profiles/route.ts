/**
 * Agent Profiles Generation API
 *
 * Generates agent profiles (teacher, assistant, student) for a course stage
 * based on stage info and scene outlines.
 */

import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { callLLM } from '@/lib/ai/llm';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';

const log = createLogger('Agent Profiles API');

export const maxDuration = 120;

const COLOR_PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#e11d48',
  '#6366f1',
  '#84cc16',
  '#a855f7',
];

interface RequestBody {
  stageInfo: { name: string; description?: string };
  sceneOutlines?: { title: string; description?: string }[];
  language: string;
  availableAvatars: string[];
}

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { stageInfo, sceneOutlines, language, availableAvatars } = body;

    // ── Validate required fields ──
    if (!stageInfo?.name) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'stageInfo.name is required');
    }
    if (!language) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'language is required');
    }
    if (!availableAvatars || availableAvatars.length === 0) {
      return apiError(
        'MISSING_REQUIRED_FIELD',
        400,
        'availableAvatars is required and must not be empty',
      );
    }

    // ── Model resolution from request headers ──
    const { model: languageModel, modelString } = resolveModelFromHeaders(req);

    // ── Build prompt ──
    const sceneSummary = sceneOutlines?.length
      ? sceneOutlines
          .map((s, i) => `${i + 1}. ${s.title}${s.description ? ` — ${s.description}` : ''}`)
          .join('\n')
      : null;

    const safeName = stageInfo.name.slice(0, 200);
    const safeDesc = stageInfo.description?.slice(0, 500) || '';

    const systemPrompt = `You are an expert instructional designer creating agent profiles for a multi-agent classroom simulation.

## Personality Diversity (CRITICAL)
Each agent MUST have a distinct, vivid personality. Avoid generic archetypes like "enthusiastic teacher" or "curious student". Use this diversity checklist:
- Vary communication styles: formal vs casual, verbose vs terse, enthusiastic vs deadpan
- Vary expertise angles: theoretical vs practical, big-picture vs detail-oriented
- Vary emotional tones: warm/nurturing, challenging/Socratic, humorous/witty, calm/methodical
- Give at least one agent a mildly unconventional trait (uses analogies from cooking, references pop culture, thinks in diagrams, talks in questions)
- NEVER produce generic personalities. Each agent should feel like a real, memorable person.

## Output Rules
Return ONLY a valid JSON object. No markdown code fences, no explanation, no text before or after the JSON. The JSON must parse cleanly with JSON.parse().`;

    const userPrompt = `Generate agent profiles for the following course:

<course_name>${safeName}</course_name>
${safeDesc ? `<course_description>${safeDesc}</course_description>` : ''}
${sceneSummary ? `\nScene outlines:\n${sceneSummary}\n` : ''}
Requirements:
- Decide the appropriate number of agents based on the course content (typically 3-5)
- Exactly 1 agent must have role "teacher", the rest can be "assistant" or "student"
- Priority values: teacher=10 (highest), assistant=7, student=4-6
- Each agent needs: name, role, persona (2-3 sentences describing personality and teaching/learning style)
- Names and personas must be in language: ${language}
- Each agent must be assigned one UNIQUE avatar from this list: ${JSON.stringify(availableAvatars)}
  - NO duplicate avatars — every agent must have a different avatar
- Each agent must be assigned one UNIQUE color from this list: ${JSON.stringify(COLOR_PALETTE)}
  - NO duplicate colors — every agent must have a different color

Example output for a "World History" course (DO NOT copy — generate completely different personalities):
{
  "agents": [
    {"name": "Prof. Rivera", "role": "teacher", "persona": "A theatrical storyteller who treats history like a detective novel. Loves asking 'But WHY did they do that?' and connecting ancient events to modern headlines.", "avatar": "${availableAvatars[0]}", "color": "#3b82f6", "priority": 10},
    {"name": "Kai", "role": "student", "persona": "A skeptical thinker who questions everything and plays devil's advocate. Often says 'Yeah but what about...' Short, punchy reactions.", "avatar": "${availableAvatars[1]}", "color": "#10b981", "priority": 5},
    {"name": "Mei Lin", "role": "assistant", "persona": "A meticulous note-taker who summarizes complex ideas into simple bullet points. Calm, precise, always has a relevant timeline to share.", "avatar": "${availableAvatars[2]}", "color": "#f59e0b", "priority": 7}
  ]
}

IMPORTANT: Generate completely different personalities suited to "${safeName}". Do NOT reuse names or traits from the example above.

Return a JSON object with this exact structure:
{
  "agents": [
    {
      "name": "string",
      "role": "teacher" | "assistant" | "student",
      "persona": "string (2-3 sentences)",
      "avatar": "string (from available list)",
      "color": "string (hex color from palette)",
      "priority": number (10 for teacher, 7 for assistant, 4-6 for student)
    }
  ]
}`;

    log.info(`Generating agent profiles for "${stageInfo.name}" [model=${modelString}]`);

    const result = await callLLM(
      {
        model: languageModel,
        system: systemPrompt,
        prompt: userPrompt,
      },
      'agent-profiles',
    );

    // ── Parse LLM response ──
    const rawText = stripCodeFences(result.text);
    let parsed: {
      agents: Array<{
        name: string;
        role: string;
        persona: string;
        avatar: string;
        color: string;
        priority: number;
      }>;
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      log.error('Failed to parse LLM response as JSON:', rawText.substring(0, 500));
      return apiError('PARSE_FAILED', 500, 'Failed to parse agent profiles from LLM response');
    }

    // ── Validate parsed structure ──
    if (!parsed.agents || !Array.isArray(parsed.agents) || parsed.agents.length < 2) {
      log.error(`Expected at least 2 agents, got ${parsed.agents?.length ?? 0}`);
      return apiError(
        'GENERATION_FAILED',
        500,
        `Expected at least 2 agents but LLM returned ${parsed.agents?.length ?? 0}`,
      );
    }

    const teacherCount = parsed.agents.filter((a) => a.role === 'teacher').length;
    if (teacherCount !== 1) {
      log.error(`Expected exactly 1 teacher, got ${teacherCount}`);
      return apiError(
        'GENERATION_FAILED',
        500,
        `Expected exactly 1 teacher but LLM returned ${teacherCount}`,
      );
    }

    // ── Build output with IDs ──
    const agents = parsed.agents.map((agent, index) => ({
      id: `gen-${nanoid(8)}`,
      name: agent.name,
      role: agent.role,
      persona: agent.persona,
      avatar: agent.avatar || availableAvatars[index % availableAvatars.length],
      color: agent.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
      priority:
        agent.priority ?? (agent.role === 'teacher' ? 10 : agent.role === 'assistant' ? 7 : 5),
    }));

    log.info(`Successfully generated ${agents.length} agent profiles for "${stageInfo.name}"`);

    return apiSuccess({ agents });
  } catch (error) {
    log.error('Agent profiles generation error:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
