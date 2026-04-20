/**
 * Web Search API
 *
 * POST /api/web-search
 * Simple JSON request/response using Firecrawl search.
 */

import { searchWithFirecrawl, formatSearchResultsAsContext } from '@/lib/web-search/firecrawl';
import { resolveWebSearchApiKey, resolveWebSearchBaseUrl } from '@/lib/server/provider-config';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';

const log = createLogger('WebSearch');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      query,
      apiKey: clientApiKey,
      baseUrl: clientBaseUrl,
      maxResults: requestedMaxResults,
    } = body as {
      query?: string;
      apiKey?: string;
      baseUrl?: string;
      maxResults?: number;
    };

    if (!query || !query.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'query is required');
    }

    if (clientBaseUrl) {
      try {
        const parsedBaseUrl = new URL(clientBaseUrl);
        if (parsedBaseUrl.protocol !== 'http:' && parsedBaseUrl.protocol !== 'https:') {
          return apiError('INVALID_URL', 400, 'Only HTTP(S) base URLs are allowed');
        }
      } catch {
        return apiError('INVALID_URL', 400, 'Invalid Firecrawl base URL');
      }

      if (process.env.NODE_ENV === 'production') {
        const ssrfError = validateUrlForSSRF(clientBaseUrl);
        if (ssrfError) {
          return apiError('INVALID_URL', 403, ssrfError);
        }
      }
    }

    const apiKey = resolveWebSearchApiKey(clientApiKey);
    if (!apiKey) {
      return apiError(
        'MISSING_API_KEY',
        400,
        'Firecrawl API key is not configured. Set it in Settings → Web Search or set FIRECRAWL_API_KEY env var.',
      );
    }

    const maxResults =
      typeof requestedMaxResults === 'number' && Number.isFinite(requestedMaxResults)
        ? Math.max(1, Math.min(Math.floor(requestedMaxResults), 10))
        : undefined;
    const baseUrl = resolveWebSearchBaseUrl(clientBaseUrl);
    const result = await searchWithFirecrawl({
      query: query.trim(),
      apiKey,
      maxResults,
      baseUrl,
    });
    const context = formatSearchResultsAsContext(result);

    return apiSuccess({
      answer: result.answer,
      sources: result.sources,
      context,
      query: result.query,
      responseTime: result.responseTime,
    });
  } catch (err) {
    log.error('[WebSearch] Error:', err);
    const message = err instanceof Error ? err.message : 'Web search failed';
    return apiError('INTERNAL_ERROR', 500, message);
  }
}
