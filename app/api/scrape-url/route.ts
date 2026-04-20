import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';
import { resolveWebSearchApiKey, resolveWebSearchBaseUrl } from '@/lib/server/provider-config';
import { scrapeWithFirecrawl } from '@/lib/web-search/firecrawl';

const log = createLogger('ScrapeURL');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      apiKey: clientApiKey,
      baseUrl: clientBaseUrl,
      onlyMainContent,
    } = body as {
      url?: string;
      apiKey?: string;
      baseUrl?: string;
      onlyMainContent?: boolean;
    };

    if (!url || !url.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'url is required');
    }

    let normalizedUrl: string;
    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return apiError('INVALID_URL', 400, 'Only HTTP(S) URLs are allowed');
      }
      normalizedUrl = parsedUrl.toString();
    } catch {
      return apiError('INVALID_URL', 400, 'Invalid URL');
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
    }

    if (process.env.NODE_ENV === 'production') {
      const urlSsrfError = validateUrlForSSRF(normalizedUrl);
      if (urlSsrfError) {
        return apiError('INVALID_URL', 403, urlSsrfError);
      }

      if (clientBaseUrl) {
        const baseUrlSsrfError = validateUrlForSSRF(clientBaseUrl);
        if (baseUrlSsrfError) {
          return apiError('INVALID_URL', 403, baseUrlSsrfError);
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

    const baseUrl = resolveWebSearchBaseUrl(clientBaseUrl);
    const result = await scrapeWithFirecrawl({
      url: normalizedUrl,
      apiKey,
      baseUrl,
      onlyMainContent: onlyMainContent !== false,
    });

    return apiSuccess({
      url: result.url,
      markdown: result.markdown,
      title: result.metadata.title || null,
      metadata: result.metadata,
    });
  } catch (err) {
    log.error('[ScrapeURL] Error:', err);
    const message = err instanceof Error ? err.message : 'URL scrape failed';
    return apiError('INTERNAL_ERROR', 500, message);
  }
}
