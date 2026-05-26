import type { PriceFetch } from './types';
import { DEBOUNCE_MS } from './types';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export class DebouncedError extends Error {
  readonly remainingMs: number;
  constructor(remainingMs: number) {
    super(`Refresh debounced — ${Math.ceil(remainingMs / 1000)}s remaining`);
    this.name = 'DebouncedError';
    this.remainingMs = remainingMs;
  }
}

export interface PriceFetcherDeps {
  fetchImpl?: typeof fetch;
  now?: () => number;
}

export function createPriceFetcher(initial: { lastFetchAt?: number } = {}, deps: PriceFetcherDeps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => Date.now());
  let lastFetchAt = initial.lastFetchAt ?? 0;

  async function fetchBtcPrice(): Promise<PriceFetch> {
    const t = now();
    const elapsed = t - lastFetchAt;
    if (lastFetchAt !== 0 && elapsed < DEBOUNCE_MS) {
      throw new DebouncedError(DEBOUNCE_MS - elapsed);
    }
    const response = await fetchImpl(COINGECKO_URL);
    if (!response.ok) {
      throw new Error(`Price fetch failed: HTTP ${response.status}`);
    }
    const body = (await response.json()) as { bitcoin?: { usd?: number } };
    const priceUsd = body?.bitcoin?.usd;
    if (typeof priceUsd !== 'number' || !Number.isFinite(priceUsd)) {
      throw new Error('Price fetch returned malformed response');
    }
    lastFetchAt = t;
    return { priceUsd, at: new Date(t).toISOString() };
  }

  function remainingDebounceMs(): number {
    if (lastFetchAt === 0) return 0;
    const elapsed = now() - lastFetchAt;
    return Math.max(0, DEBOUNCE_MS - elapsed);
  }

  return { fetchBtcPrice, remainingDebounceMs };
}
