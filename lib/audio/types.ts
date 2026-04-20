/**
 * Audio Provider Type Definitions
 *
 * Unified types for TTS (Text-to-Speech) and ASR (Automatic Speech Recognition)
 * with extensible architecture to support multiple providers.
 *
 * Currently Supported TTS Providers:
 * - OpenAI TTS (https://platform.openai.com/docs/guides/text-to-speech)
 * - Azure TTS (https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech)
 * - ElevenLabs TTS (https://elevenlabs.io/docs/api-reference/text-to-speech)
 * - Browser Native TTS (Web Speech API, client-side only)
 *
 * Currently Supported ASR Providers:
 * - OpenAI Whisper (https://platform.openai.com/docs/guides/speech-to-text)
 * - Browser Native (Web Speech API, client-side only)
 */

// ============================================================================
// TTS (Text-to-Speech) Types
// ============================================================================

/**
 * TTS Provider IDs
 *
 * Add new TTS providers here as union members.
 * Keep in sync with TTS_PROVIDERS registry in constants.ts
 */
export type TTSProviderId = 'openai-tts' | 'azure-tts' | 'elevenlabs-tts' | 'browser-native-tts';

/**
 * Voice information for TTS
 */
export interface TTSVoiceInfo {
  id: string;
  name: string;
  language: string;
  localeName?: string; // Language name in its native script (e.g., "Hindi", "English")
  gender?: 'male' | 'female' | 'neutral';
  description?: string;
}

/**
 * TTS Provider Configuration
 */
export interface TTSProviderConfig {
  id: TTSProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  voices: TTSVoiceInfo[];
  supportedFormats: string[]; // ['mp3', 'wav', 'opus', etc.]
  speedRange?: {
    min: number;
    max: number;
    default: number;
  };
}

/**
 * TTS Model Configuration for API calls
 */
export interface TTSModelConfig {
  providerId: TTSProviderId;
  apiKey?: string;
  baseUrl?: string;
  voice: string;
  speed?: number;
  format?: string;
}

// ============================================================================
// ASR (Automatic Speech Recognition) Types
// ============================================================================

/**
 * ASR Provider IDs
 *
 * Add new ASR providers here as union members.
 * Keep in sync with ASR_PROVIDERS registry in constants.ts
 */
export type ASRProviderId = 'openai-whisper' | 'browser-native';

/**
 * ASR Provider Configuration
 */
export interface ASRProviderConfig {
  id: ASRProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  supportedLanguages: string[];
  supportedFormats: string[];
}

/**
 * ASR Model Configuration for API calls
 */
export interface ASRModelConfig {
  providerId: ASRProviderId;
  apiKey?: string;
  baseUrl?: string;
  language?: string;
}
