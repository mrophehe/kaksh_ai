import type { WebSearchProviderId, WebSearchProviderConfig } from './types';

export const WEB_SEARCH_PROVIDERS: Record<WebSearchProviderId, WebSearchProviderConfig> = {
  firecrawl: {
    id: 'firecrawl',
    name: 'Firecrawl',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.firecrawl.dev',
    icon: '/logos/firecrawl-logo.png',
  },
};

export function getAllWebSearchProviders(): WebSearchProviderConfig[] {
  return Object.values(WEB_SEARCH_PROVIDERS);
}
