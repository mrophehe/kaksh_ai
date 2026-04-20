/**
 * ElevenLabs Signed URL API
 *
 * Generates a signed URL for secure ElevenAgents WebSocket connection.
 * The signed URL avoids exposing the API key to the client.
 *
 * GET /api/elevenlabs/signed-url
 *
 * Headers:
 *   x-elevenlabs-agent-id: string (optional, overrides env default)
 *
 * Response: { signedUrl: string }
 */

import { NextRequest } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('ElevenLabs SignedURL');

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || process.env.ELEVENLABS_API_KEY;
    const agentId = req.headers.get('x-elevenlabs-agent-id') || process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey) {
      return apiError(
        'MISSING_API_KEY',
        401,
        'ElevenLabs API key is required. Set ELEVENLABS_API_KEY or pass x-api-key header.',
      );
    }
    if (!agentId) {
      return apiError(
        'MISSING_REQUIRED_FIELD',
        400,
        'ElevenLabs Agent ID is required. Set ELEVENLABS_AGENT_ID or pass x-elevenlabs-agent-id header.',
      );
    }

    const client = new ElevenLabsClient({ apiKey });
    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });

    return apiSuccess({ signedUrl: response.signed_url });
  } catch (error) {
    log.error('Failed to generate signed URL:', error);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate ElevenLabs signed URL');
  }
}
