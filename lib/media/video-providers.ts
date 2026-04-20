/**
 * Video Generation Service -- routes to provider adapters
 */

import type {
  VideoProviderId,
  VideoGenerationConfig,
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProviderConfig,
} from './types';
import { generateWithVeo, testVeoConnectivity } from './adapters/veo-adapter';

export const VIDEO_PROVIDERS: Record<VideoProviderId, VideoProviderConfig> = {
  veo: {
    id: 'veo',
    name: 'Veo',
    requiresApiKey: true,
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    models: [
      { id: 'veo-3.1-fast-generate-001', name: 'Veo 3.1 Fast' },
      { id: 'veo-3.1-generate-001', name: 'Veo 3.1' },
      { id: 'veo-3.0-fast-generate-001', name: 'Veo 3.0 Fast' },
      { id: 'veo-3.0-generate-001', name: 'Veo 3.0' },
      { id: 'veo-2.0-generate-001', name: 'Veo 2.0' },
    ],
    supportedAspectRatios: ['16:9', '1:1', '9:16'],
    supportedDurations: [8],
    supportedResolutions: ['720p'],
    maxDuration: 8,
  },
  sora: {
    id: 'sora',
    name: 'Sora',
    requiresApiKey: true,
    models: [],
    supportedAspectRatios: ['16:9', '1:1', '9:16'],
    maxDuration: 20,
  },
};

export async function testVideoConnectivity(
  config: VideoGenerationConfig,
): Promise<{ success: boolean; message: string }> {
  switch (config.providerId) {
    case 'veo':
      return testVeoConnectivity(config);
    default:
      return {
        success: false,
        message: `Unsupported video provider: ${config.providerId}`,
      };
  }
}

/**
 * Normalize video generation options against provider capabilities.
 * Ensures duration, aspectRatio, and resolution are valid for the given provider.
 * Falls back to the first supported value when the requested value is unsupported.
 */
export function normalizeVideoOptions(
  providerId: VideoProviderId,
  options: VideoGenerationOptions,
): VideoGenerationOptions {
  const provider = VIDEO_PROVIDERS[providerId];
  if (!provider) return options;

  const normalized = { ...options };

  // Duration: use first supported value if unset or unsupported
  if (provider.supportedDurations && provider.supportedDurations.length > 0) {
    if (!normalized.duration || !provider.supportedDurations.includes(normalized.duration)) {
      normalized.duration = provider.supportedDurations[0];
    }
  }

  // Aspect ratio: use first supported value if unset or unsupported
  if (provider.supportedAspectRatios && provider.supportedAspectRatios.length > 0) {
    if (
      !normalized.aspectRatio ||
      !provider.supportedAspectRatios.includes(normalized.aspectRatio)
    ) {
      normalized.aspectRatio =
        normalized.aspectRatio && provider.supportedAspectRatios.includes(normalized.aspectRatio)
          ? normalized.aspectRatio
          : (provider.supportedAspectRatios[0] as VideoGenerationOptions['aspectRatio']);
    }
  }

  // Resolution: use first supported value if unset or unsupported
  if (provider.supportedResolutions && provider.supportedResolutions.length > 0) {
    if (!normalized.resolution || !provider.supportedResolutions.includes(normalized.resolution)) {
      normalized.resolution = provider.supportedResolutions[0];
    }
  }

  return normalized;
}

export async function generateVideo(
  config: VideoGenerationConfig,
  options: VideoGenerationOptions,
): Promise<VideoGenerationResult> {
  switch (config.providerId) {
    case 'veo':
      return generateWithVeo(config, options);
    default:
      throw new Error(`Unsupported video provider: ${config.providerId}`);
  }
}
