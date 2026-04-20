/**
 * Unified AI Provider Configuration
 *
 * Supports multiple AI providers through Vercel AI SDK:
 * - OpenAI (native)
 * - Anthropic Claude (native)
 * - Google Gemini (native)
 *
 * Sources:
 * - https://platform.openai.com/docs/models
 * - https://platform.claude.com/docs/en/about-claude/models/overview
 * - https://ai.google.dev/gemini-api/docs/models
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type {
  ProviderId,
  ProviderConfig,
  ModelInfo,
  ModelConfig,
  ThinkingConfig,
} from '@/lib/types/provider';
import { createLogger } from '@/lib/logger';
// NOTE: Do NOT import thinking-context.ts here — it uses node:async_hooks
// which is server-only, and this file is also used on the client via
// settings.ts. The thinking context is read from globalThis instead
// (set by thinking-context.ts at module load time on the server).

const log = createLogger('AIProviders');

// Re-export types for backward compatibility
export type { ProviderId, ProviderConfig, ModelInfo, ModelConfig };

/**
 * Provider registry
 */
export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    icon: '/logos/openai.svg',
    models: [
      {
        id: 'gpt-5.4-mini',
        name: 'GPT-5.4 mini',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5.4',
        name: 'GPT-5.4',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5.4-nano',
        name: 'GPT-5.4 nano',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5',
        name: 'GPT-5',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5-mini',
        name: 'GPT-5 mini',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5-nano',
        name: 'GPT-5 nano',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-5.1',
        name: 'GPT-5.1',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: false, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 mini',
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 nano',
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o mini',
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  anthropic: {
    id: 'anthropic',
    name: 'Claude',
    type: 'anthropic',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    icon: '/logos/claude.svg',
    models: [
      {
        id: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6',
        contextWindow: 200000,
        outputWindow: 64000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5',
        contextWindow: 200000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        contextWindow: 200000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        contextWindow: 200000,
        outputWindow: 64000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-opus-4-6',
        name: 'Claude Opus 4.6',
        contextWindow: 200000,
        outputWindow: 32000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-opus-4-5-20251101',
        name: 'Claude Opus 4.5',
        contextWindow: 200000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-opus-4-1-20250805',
        name: 'Claude Opus 4.1',
        contextWindow: 200000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        contextWindow: 200000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  google: {
    id: 'google',
    name: 'Gemini',
    type: 'google',
    requiresApiKey: true,
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    icon: '/logos/gemini.svg',
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: true, defaultEnabled: true },
        },
      },
      {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash Preview',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: false, defaultEnabled: true },
        },
      },
      {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro Preview',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: false, defaultEnabled: true },
        },
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro Preview',
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
          thinking: { toggleable: true, budgetAdjustable: false, defaultEnabled: true },
        },
      },
    ],
  },

  groq: {
    id: 'groq',
    name: 'Groq',
    type: 'openai',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    icon: '/logos/Groq_Logo_No_Trademark.svg',
    models: [
      {
        id: 'openai/gpt-oss-20b',
        name: 'GPT-OSS 20B',
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'openai/gpt-oss-120b',
        name: 'GPT-OSS 120B',
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        contextWindow: 131072,
        outputWindow: 32768,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'meta-llama/llama-4-scout-17b-16e-instruct',
        name: 'Llama 4 Scout 17B',
        contextWindow: 131072,
        outputWindow: 32768,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    icon: '/logos/deepseek.svg',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3',
        contextWindow: 64000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek R1',
        contextWindow: 64000,
        outputWindow: 4096,
        capabilities: {
          streaming: true,
          tools: true,
          vision: false,
          thinking: { toggleable: false, budgetAdjustable: false, defaultEnabled: true },
        },
      },
    ],
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama Cloud',
    type: 'openai',
    requiresApiKey: true,
    defaultBaseUrl: 'https://ollama.com/v1',
    icon: '/logos/OIP.svg',
    models: [
      {
        id: 'gpt-oss:20b',
        name: 'GPT-OSS 20B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'gpt-oss:120b',
        name: 'GPT-OSS 120B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'devstral-small-2:24b',
        name: 'Devstral Small 2 24B',
        contextWindow: 131072,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'devstral-2:123b',
        name: 'Devstral 2 123B',
        contextWindow: 131072,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'ministral-3:8b',
        name: 'Ministral 3 8B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'ministral-3:14b',
        name: 'Ministral 3 14B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gemma3:4b',
        name: 'Gemma 3 4B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gemma3:12b',
        name: 'Gemma 3 12B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gemma3:27b',
        name: 'Gemma 3 27B',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },
};

/**
 * Get provider config (from built-in or unified config in localStorage)
 */
function getProviderConfig(providerId: ProviderId): ProviderConfig | null {
  // Check built-in providers first
  if (PROVIDERS[providerId]) {
    return PROVIDERS[providerId];
  }

  // Check unified providersConfig in localStorage (browser only)
  if (typeof window !== 'undefined') {
    try {
      const storedConfig = localStorage.getItem('providersConfig');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        const providerSettings = config[providerId];
        if (providerSettings) {
          return {
            id: providerId,
            name: providerSettings.name,
            type: providerSettings.type,
            defaultBaseUrl: providerSettings.defaultBaseUrl,
            icon: providerSettings.icon,
            requiresApiKey: providerSettings.requiresApiKey,
            models: providerSettings.models,
          };
        }
      }
    } catch (e) {
      log.error('Failed to load provider config:', e);
    }
  }

  return null;
}

/**
 * Model instance with its configuration info
 */
export interface ModelWithInfo {
  model: LanguageModel;
  modelInfo: ModelInfo | null;
}

/**
 * Return vendor-specific body params to inject for OpenAI-compatible providers.
 * Called from the custom fetch wrapper inside getModel().
 */
function getCompatThinkingBodyParams(
  _providerId: ProviderId,
  _config: ThinkingConfig,
): Record<string, unknown> | undefined {
  // No OpenAI-compatible providers with custom thinking params remain.
  // Custom providers added by users may need this extended in the future.
  return undefined;
}

/**
 * Get a configured language model instance with its info
 * Accepts individual parameters for flexibility and security
 */
export function getModel(config: ModelConfig): ModelWithInfo {
  // Get provider type and requiresApiKey, with fallback to registry
  let providerType = config.providerType;
  let requiresApiKey = config.requiresApiKey ?? true;

  if (!providerType) {
    const provider = getProviderConfig(config.providerId);
    if (provider) {
      providerType = provider.type;
      requiresApiKey = provider.requiresApiKey;
    } else {
      throw new Error(`Unknown provider: ${config.providerId}. Please provide providerType.`);
    }
  }

  // Validate API key if required
  if (requiresApiKey && !config.apiKey) {
    throw new Error(`API key required for provider: ${config.providerId}`);
  }

  // Use provided API key, or empty string for providers that don't require one
  const effectiveApiKey = config.apiKey || '';

  // Resolve base URL: explicit > provider default > SDK default
  const provider = getProviderConfig(config.providerId);
  const effectiveBaseUrl = config.baseUrl || provider?.defaultBaseUrl || undefined;

  let model: LanguageModel;

  switch (providerType) {
    case 'openai': {
      const openaiOptions: Parameters<typeof createOpenAI>[0] = {
        apiKey: effectiveApiKey,
        baseURL: effectiveBaseUrl,
      };

      // For OpenAI-compatible providers (not native OpenAI), add a fetch
      // wrapper that injects vendor-specific thinking params into the HTTP
      // body. The thinking config is read from AsyncLocalStorage, set by
      // callLLM / streamLLM at call time.
      if (config.providerId !== 'openai') {
        const providerId = config.providerId;
        openaiOptions.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
          // Read thinking config from globalThis (set by thinking-context.ts)
          const thinkingCtx = (globalThis as Record<string, unknown>).__thinkingContext as
            | { getStore?: () => unknown }
            | undefined;
          const thinking = thinkingCtx?.getStore?.() as ThinkingConfig | undefined;
          if (thinking && init?.body && typeof init.body === 'string') {
            const extra = getCompatThinkingBodyParams(providerId, thinking);
            if (extra) {
              try {
                const body = JSON.parse(init.body);
                Object.assign(body, extra);
                init = { ...init, body: JSON.stringify(body) };
              } catch {
                /* leave body as-is */
              }
            }
          }
          return globalThis.fetch(url, init);
        };
      }

      const openai = createOpenAI(openaiOptions);
      model = openai.chat(config.modelId);
      break;
    }

    case 'anthropic': {
      const anthropic = createAnthropic({
        apiKey: effectiveApiKey,
        baseURL: effectiveBaseUrl,
      });
      model = anthropic.chat(config.modelId);
      break;
    }

    case 'google': {
      const googleOptions: Parameters<typeof createGoogleGenerativeAI>[0] = {
        apiKey: effectiveApiKey,
        baseURL: effectiveBaseUrl,
      };
      if (config.proxy) {
        // Dynamic require to avoid bundling undici on the client side
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ProxyAgent, fetch: undiciFetch } = require('undici');
        const agent = new ProxyAgent(config.proxy);
        googleOptions.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
          undiciFetch(input as string, {
            ...(init as Record<string, unknown>),
            dispatcher: agent,
          }).then((r: unknown) => r as Response)) as typeof fetch;
      }
      const google = createGoogleGenerativeAI(googleOptions);
      model = google.chat(config.modelId);
      break;
    }

    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }

  // Look up model info from the provider registry
  const modelInfo = provider?.models.find((m) => m.id === config.modelId) || null;

  return { model, modelInfo };
}

/**
 * Parse model string in format "providerId:modelId" or just "modelId" (defaults to OpenAI)
 */
export function parseModelString(modelString: string): {
  providerId: ProviderId;
  modelId: string;
} {
  // Split only on the first colon to handle model IDs that contain colons
  const colonIndex = modelString.indexOf(':');

  if (colonIndex > 0) {
    return {
      providerId: modelString.slice(0, colonIndex) as ProviderId,
      modelId: modelString.slice(colonIndex + 1),
    };
  }

  // Default to OpenAI for backward compatibility
  return {
    providerId: 'openai',
    modelId: modelString,
  };
}

/**
 * Get all available models grouped by provider
 */
export function getAllModels(): {
  provider: ProviderConfig;
  models: ModelInfo[];
}[] {
  return Object.values(PROVIDERS).map((provider) => ({
    provider,
    models: provider.models,
  }));
}

/**
 * Get provider by ID
 */
export function getProvider(providerId: ProviderId): ProviderConfig | undefined {
  return PROVIDERS[providerId];
}

/**
 * Get model info
 */
export function getModelInfo(providerId: ProviderId, modelId: string): ModelInfo | undefined {
  const provider = PROVIDERS[providerId];
  return provider?.models.find((m) => m.id === modelId);
}
