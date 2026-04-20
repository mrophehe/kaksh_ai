import { proxyFetch } from '@/lib/server/proxy-fetch';
import type { WebSearchResult, WebSearchSource } from '@/lib/web-search/types';
import { buildFirecrawlUrl } from '@/lib/web-search/url';

const FIRECRAWL_SEARCH_PATH = '/v2/search';
const FIRECRAWL_SCRAPE_PATH = '/v2/scrape';

interface FirecrawlDocumentMetadata {
  title?: string;
  description?: string;
  sourceURL?: string;
  url?: string;
  statusCode?: number;
  error?: string;
}

interface FirecrawlSearchItem {
  url?: string;
  title?: string;
  markdown?: string;
  description?: string;
  metadata?: FirecrawlDocumentMetadata;
}

interface FirecrawlSearchResponse {
  success: boolean;
  data?:
    | FirecrawlSearchItem[]
    | {
        web?: FirecrawlSearchItem[];
        news?: FirecrawlSearchItem[];
      };
}

interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: FirecrawlDocumentMetadata;
  };
}

function mapSearchItemToSource(item: FirecrawlSearchItem): WebSearchSource | null {
  const url = item.url || item.metadata?.sourceURL || item.metadata?.url;
  if (!url) {
    return null;
  }

  return {
    title: item.title || item.metadata?.title || url,
    url,
    content: item.markdown || item.description || item.metadata?.description || '',
  };
}

/**
 * Search the web using Firecrawl Search API and return structured results.
 */
export async function searchWithFirecrawl(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;

  const startTime = Date.now();

  const res = await proxyFetch(buildFirecrawlUrl(baseUrl, FIRECRAWL_SEARCH_PATH), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      limit: maxResults,
      scrapeOptions: {
        formats: ['markdown'],
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Firecrawl API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = (await res.json()) as FirecrawlSearchResponse;
  const rawResults = Array.isArray(data.data)
    ? data.data
    : [...(data.data?.web ?? []), ...(data.data?.news ?? [])];

  const responseTime = (Date.now() - startTime) / 1000;

  const sources: WebSearchSource[] = rawResults
    .map(mapSearchItemToSource)
    .filter((source): source is WebSearchSource => source !== null);

  // Build a summary answer from the top results
  const answer = sources
    .slice(0, 3)
    .map((s) => s.content.slice(0, 300))
    .filter(Boolean)
    .join('\n\n');

  return {
    answer,
    sources,
    query,
    responseTime,
  };
}

export async function scrapeWithFirecrawl(params: {
  url: string;
  apiKey: string;
  baseUrl?: string;
  onlyMainContent?: boolean;
}): Promise<{
  url: string;
  markdown: string;
  metadata: FirecrawlDocumentMetadata;
}> {
  const { url, apiKey, baseUrl, onlyMainContent = true } = params;

  const res = await proxyFetch(buildFirecrawlUrl(baseUrl, FIRECRAWL_SCRAPE_PATH), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Firecrawl API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = (await res.json()) as FirecrawlScrapeResponse;
  const metadata = data.data?.metadata || {};

  return {
    url: metadata.sourceURL || metadata.url || url,
    markdown: data.data?.markdown || '',
    metadata,
  };
}

/**
 * Format search results into a markdown context block for LLM prompts.
 */
export function formatSearchResultsAsContext(result: WebSearchResult): string {
  if (!result.answer && result.sources.length === 0) {
    return '';
  }

  const lines: string[] = [];

  if (result.answer) {
    lines.push(result.answer);
    lines.push('');
  }

  if (result.sources.length > 0) {
    lines.push('Sources:');
    for (const src of result.sources) {
      lines.push(`- [${src.title}](${src.url}): ${src.content.slice(0, 200)}`);
    }
  }

  return lines.join('\n');
}
