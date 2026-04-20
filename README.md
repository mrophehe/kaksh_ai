<p align="center">
  <img src="public/kakshailogo.png" alt="KakshAI logo" width="180" />
</p>

<p align="center">
  <strong>Voice-first AI classroom for turning topics, PDFs, and URLs into live lessons.</strong>
</p>

<p align="center">
  KakshAI transforms raw learning input into a generated classroom session with slides, voice teaching,
  live chat, web search, whiteboard support, quizzes, and export tools.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>


## Overview

KakshAI is a local-first learning runtime built with Next.js, React, TypeScript, ElevenLabs, Firecrawl,
the Vercel AI SDK, and LangGraph.

It supports the full lesson flow:

`topic / PDF / URL -> outline generation -> scene generation -> interactive classroom -> export`

The product is strongest when used as a live teaching surface:

- start with a topic, uploaded PDF, or webpage
- generate a lesson plan and scene sequence
- launch a classroom with slides, an AI teacher, and voice/chat interaction
- use search, whiteboard, and scene tools during the lesson
- export the classroom as PPTX or a resource pack

## Table of Contents

- [Why KakshAI](#why-kakshai)
- [Feature Overview](#feature-overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Submission Checklist](#submission-checklist)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Surface](#api-surface)
- [Project Status](#project-status)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Why KakshAI

Most AI learning apps either generate static content or give you a generic chatbot.
KakshAI takes a different path: it turns source material into a classroom session that can be taught,
navigated, interrupted, questioned, and extended in real time.

Key product characteristics:

- `Voice-first`: designed to feel like being taught live, not just reading generated text
- `Classroom-native`: slides, narration, chat, roundtable agents, and whiteboard live in one runtime
- `Source-driven`: supports topics, PDFs, and URLs as starting points
- `Provider-flexible`: works with multiple LLM, TTS, ASR, PDF, image, video, and search providers
- `Local-first`: core classroom data is stored in the browser for fast iteration and offline resilience

## Feature Overview

### 1. Source Ingestion

KakshAI can start from multiple entry points:

- free-form topic or learning goal
- uploaded PDF documents
- webpage URLs scraped through Firecrawl
- optional language and duration constraints

Relevant capabilities:

- PDF parsing with `unpdf` and `pdf-parse`
- URL scrape endpoint backed by Firecrawl
- live web search during generation and runtime

### 2. Lesson Generation Pipeline

The generation flow turns raw input into a classroom session:

- requirement parsing and outline generation
- scene planning with duration control
- slide content generation
- action generation for spoken teaching and runtime behavior
- optional quizzes, interactive scenes, and PBL scenes

Supported scene types:

- `slide`
- `quiz`
- `interactive`
- `pbl`

### 3. Interactive Classroom Runtime

The classroom runtime is more than a slide viewer. It includes:

- scene-by-scene playback
- AI teacher narration
- in-session chat
- roundtable discussion mode
- whiteboard controls
- scene sidebar and navigation
- playback and audio controls

This runtime is centered in the classroom page and the `Stage` system.

### 4. Voice Teaching with ElevenLabs

KakshAI includes both text-to-speech and live voice interaction:

- high-quality TTS for lecture playback
- ElevenLabs Conversational AI integration
- signed URL route for voice sessions
- runtime voice agent panel
- classroom-aware client tools for live assistance

The voice agent can use:

- web search
- slide navigation
- whiteboard writing
- whiteboard clearing

### 5. Multi-Agent Classroom

KakshAI ships with a built-in teaching team:

- `Lead Tutor`
- `Learning Guide`
- `Challenger`
- `Curious Explorer`
- `Notekeeper`
- `Critical Thinker`

These agents power classroom discussion, teaching variation, and roundtable-style interactions.

### 6. Whiteboard and Visual Teaching Tools

The classroom includes a structured whiteboard system, not just a freehand overlay.

It supports:

- opening and closing a dedicated whiteboard surface
- adding text, shapes, charts, tables, arrows, and LaTeX
- whiteboard history and restore
- AI-driven whiteboard actions through the action engine

### 7. Assessment and Project-Based Learning

KakshAI supports more than lecture scenes.

- generated quizzes with AI grading
- short-answer grading via API
- interactive learning scenes
- project-based learning scenes with roles, issues, and chat workflows

### 8. Export and Asset Packaging

Generated classrooms can be turned into shareable outputs:

- PPTX export
- resource pack export
- media proxying and packaging for generated assets

### 9. Provider and Model Flexibility

The app supports configurable providers across major categories:

- LLM: OpenAI, Anthropic, Google Gemini, Groq, Ollama Cloud
- TTS: ElevenLabs, OpenAI, Azure
- ASR: OpenAI
- PDF: unpdf, pdf-parse
- Image: Nano Banana
- Video: Veo, Sora
- Web Search: Firecrawl

Providers can be configured:

- in the frontend settings UI
- through `.env.local`
- through root-level `server-providers.yml`

## How It Works

```text
1. Input
   Topic / PDF / URL / requirements

2. Processing
   PDF parse / URL scrape / optional web search

3. Planning
   AI-generated outline + scene structure

4. Generation
   Slide / quiz / interactive / PBL content + actions

5. Runtime
   Classroom stage + voice teacher + chat + whiteboard + roundtable

6. Output
   Local persistence + PPTX / resource pack export
```

## Tech Stack

| Category | Stack |
| --- | --- |
| Framework | Next.js 16, React 19, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Radix UI, shadcn/ui |
| State | Zustand |
| Local Persistence | Dexie + IndexedDB |
| AI Runtime | Vercel AI SDK, LangChain Core, LangGraph |
| Voice | ElevenLabs, Azure TTS, OpenAI TTS/ASR |
| PDF | unpdf, pdf-parse |
| Search / Crawl | Firecrawl |
| Export | pptxgenjs workspace package |
| Media | Nano Banana, Veo, Sora adapters |
| Package Manager | pnpm workspaces |

## Submission Checklist

| Requirement | Status |
| --- | --- |
| Public GitHub repo | https://github.com/MitudruDutta/KakshAI |
| TestSprite generated tests | [`testsprite_tests/`](./testsprite_tests/) |
| TestSprite report | [`testsprite_tests/testsprite-mcp-test-report.md`](./testsprite_tests/testsprite-mcp-test-report.md) |
| TestSprite HTML report | [`testsprite_tests/testsprite-mcp-test-report.html`](./testsprite_tests/testsprite-mcp-test-report.html) |
| README | This file explains the project, setup, architecture, features, and testing artifacts |
| Demo video | Not included yet |
| TestSprite email | `mitudrudutta72@gmail.com` |

### TestSprite MCP Testing

This repository includes TestSprite-generated frontend test artifacts:

- `testsprite_tests/TC001_*.py` through `testsprite_tests/TC015_*.py` contain the generated Playwright test cases.
- `testsprite_tests/testsprite_frontend_test_plan.json` contains the generated frontend test plan.
- `testsprite_tests/testsprite-mcp-test-report.md` and `testsprite_tests/testsprite-mcp-test-report.html` contain the TestSprite MCP execution report.

The TestSprite run generated 15 browser tests. Two tests passed, four failed, and nine were blocked, mostly because full lesson generation requires a configured LLM provider API key during automated execution. The report keeps those findings visible so the remaining risks are easy to review.

Security note: TestSprite temporary files, including `testsprite_tests/tmp/config.json`, are ignored through `.gitignore` and should not be committed.

## Getting Started

### Prerequisites

- Node.js `>= 20.9.0`
- pnpm `10.28.0+`

### Installation

```bash
git clone https://github.com/MitudruDutta/KakshAI.git
cd KakshAI
pnpm install
cp .env.example .env.local
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Recommended First Run

1. Open the app and go to Settings.
2. Configure at least one LLM provider.
3. Configure ElevenLabs if you want live voice teaching.
4. Configure Firecrawl if you want URL ingestion or live web search.
5. Start with a topic, PDF, or webpage from the landing page.

## Configuration

### Option A: Frontend Settings

You can configure providers directly in the app settings UI.

This is the fastest way to get running for single-user development.

### Option B: `.env.local`

Copy `.env.example` to `.env.local` and configure only the providers you want to use.

Example:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=
OLLAMA_API_KEY=

ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=

FIRECRAWL_API_KEY=

DEFAULT_MODEL=openai:gpt-5.4-mini
```

### Option C: `server-providers.yml`

For controlled server-side defaults, create a root-level `server-providers.yml`.

Example:

```yaml
providers:
  openai:
    apiKey: ${OPENAI_API_KEY}
    baseUrl: https://api.openai.com/v1
    models:
      - gpt-5.4-mini
      - gpt-5.4

  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}
    models:
      - claude-sonnet-4-6

  firecrawl:
    apiKey: ${FIRECRAWL_API_KEY}
```

### Security Note

KakshAI is currently a local-first, single-user project.

Important implications:

- provider credentials entered through the frontend settings UI are stored locally in the browser
- there is no auth system or server-side secret vault in this repo
- use `server-providers.yml` or environment variables if you want server-owned defaults on a trusted deployment

## Project Structure

```text
app/
  page.tsx                     Landing page and input flow
  generation-preview/          Review and generation pipeline UI
  classroom/[id]/              Classroom runtime
  api/                         App Router API routes

components/
  agent/                       Voice agent UI and panels
  chat/                        Chat runtime
  generation/                  Generation UI
  roundtable/                  Multi-agent discussion UI
  scene-renderers/             Slide, quiz, interactive, and PBL renderers
  settings/                    Provider and runtime configuration
  slide-renderer/              Slide editing and presentation runtime
  whiteboard/                  Whiteboard UI and history

lib/
  ai/                          Provider registry and model resolution
  audio/                       TTS and ASR integrations
  elevenlabs/                  Conversational AI integration and tools
  export/                      PPTX and resource pack export
  generation/                  Outline, scene, and prompt pipeline
  media/                       Image and video adapters
  orchestration/               LangGraph director and tool orchestration
  pbl/                         Project-based learning generation/runtime
  playback/                    Playback engine
  store/                       Zustand stores
  utils/                       Dexie database and storage helpers

packages/
  mathml2omml/                 Math conversion package
  pptxgenjs/                   PPTX generation workspace package
```

## API Surface

Key API routes in this repo:

| Route | Purpose |
| --- | --- |
| `/api/chat` | Streaming classroom chat |
| `/api/classroom` | Server-side classroom persistence fallback |
| `/api/classroom-media/[classroomId]/[...path]` | Classroom media asset serving |
| `/api/parse-pdf` | PDF extraction |
| `/api/scrape-url` | URL ingestion via Firecrawl |
| `/api/web-search` | Firecrawl search |
| `/api/elevenlabs/signed-url` | Signed voice session URL |
| `/api/transcription` | Speech-to-text |
| `/api/quiz-grade` | Quiz grading |
| `/api/pbl/chat` | PBL runtime chat |
| `/api/generate/agent-profiles` | Teaching agent profile generation |
| `/api/generate/scene-outlines-stream` | Outline generation |
| `/api/generate/scene-content` | Scene content generation |
| `/api/generate/scene-actions` | Runtime action generation |
| `/api/generate/tts` | Generated TTS audio |
| `/api/generate/image` | Image generation |
| `/api/generate/video` | Video generation |
| `/api/generate-classroom` | Background classroom generation jobs |
| `/api/server-providers` | Expose server-configured providers |
| `/api/verify-model` | Provider/model connectivity checks |
| `/api/health` | Health check |

## Project Status

KakshAI is currently best understood as an advanced single-user prototype / hackathon build.

What is strong today:

- end-to-end lesson generation flow
- classroom runtime
- voice integration
- search and URL ingestion
- export functionality
- provider flexibility

What is not in scope yet:

- authentication
- shared backend persistence
- team collaboration
- multi-device sync
- server-owned user accounts or course ownership

This honesty matters: the repo is impressive and feature-rich, but it is not yet a production SaaS platform.

## Documentation

Additional project docs:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - codebase architecture review
- [AI_CODEBASE_KNOWLEDGE.md](./AI_CODEBASE_KNOWLEDGE.md) - repo-specific implementation notes
- [SUBMISSION_VIDEO_PLAYBOOK.md](./SUBMISSION_VIDEO_PLAYBOOK.md) - demo and submission guidance
- [.env.example](./.env.example) - full configuration template

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm check` | Run Prettier in check mode |
| `pnpm format` | Format the codebase with Prettier |

## Contributing

Contributions are welcome.

Suggested workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes with clear commit messages.
4. Run `pnpm lint` and `pnpm check`.
5. Open a pull request with a concise description of the change.

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgments

KakshAI builds on top of several excellent tools and ecosystems:

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [ElevenLabs](https://elevenlabs.io/)
- [Firecrawl](https://firecrawl.dev/)
- [LangChain](https://www.langchain.com/)
- [LangGraph](https://www.langchain.com/langgraph)
- [Dexie](https://dexie.org/)
- [shadcn/ui](https://ui.shadcn.com/)
