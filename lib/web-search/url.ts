export const FIRECRAWL_DEFAULT_BASE_URL = 'https://api.firecrawl.dev';

const FIRECRAWL_TRAILING_ENDPOINT_RE = /\/(?:v\d+\/)?(?:search|scrape|crawl|map|extract|mcp)$/i;
const FIRECRAWL_TRAILING_VERSION_RE = /\/v\d+$/i;
const FIRECRAWL_CANONICAL_API_HOST = 'api.firecrawl.dev';
const FIRECRAWL_NON_API_HOSTS = new Set([
  'firecrawl.dev',
  'www.firecrawl.dev',
  'docs.firecrawl.dev',
  'mcp.firecrawl.dev',
]);

function normalizeFirecrawlPathname(pathname: string): string {
  let normalizedPathname = pathname.replace(/\/+$/, '');
  normalizedPathname = normalizedPathname.replace(FIRECRAWL_TRAILING_ENDPOINT_RE, '');
  normalizedPathname = normalizedPathname.replace(FIRECRAWL_TRAILING_VERSION_RE, '');
  return normalizedPathname || '';
}

export function normalizeFirecrawlBaseUrl(baseUrl?: string): string {
  const rawBaseUrl = (baseUrl || FIRECRAWL_DEFAULT_BASE_URL).trim();

  try {
    const url = new URL(rawBaseUrl);
    if (FIRECRAWL_NON_API_HOSTS.has(url.hostname)) {
      url.protocol = 'https:';
      url.username = '';
      url.password = '';
      url.host = FIRECRAWL_CANONICAL_API_HOST;
      url.port = '';
      url.pathname = '';
      url.search = '';
      url.hash = '';
      return url.toString().replace(/\/+$/, '');
    }
    url.pathname = normalizeFirecrawlPathname(url.pathname);
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return normalizeFirecrawlPathname(rawBaseUrl).replace(/\/+$/, '');
  }
}

export function buildFirecrawlUrl(baseUrl: string | undefined, path: string): string {
  return `${normalizeFirecrawlBaseUrl(baseUrl)}${path}`;
}
