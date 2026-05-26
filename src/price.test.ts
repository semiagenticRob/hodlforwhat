import { describe, it, expect, vi } from 'vitest';
import { createPriceFetcher, DebouncedError } from './price';

function okResponse(priceUsd: number): Response {
  return new Response(JSON.stringify({ bitcoin: { usd: priceUsd } }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('price', () => {
  it('returns priceUsd and ISO timestamp on happy path', async () => {
    const fetchImpl = vi.fn(async () => okResponse(95_000));
    const { fetchBtcPrice } = createPriceFetcher({}, { fetchImpl, now: () => 1_700_000_000_000 });
    const result = await fetchBtcPrice();
    expect(result.priceUsd).toBe(95_000);
    expect(result.at).toBe(new Date(1_700_000_000_000).toISOString());
  });

  it('throws on HTTP error', async () => {
    const fetchImpl = vi.fn(async () => new Response('boom', { status: 500 }));
    const { fetchBtcPrice } = createPriceFetcher({}, { fetchImpl });
    await expect(fetchBtcPrice()).rejects.toThrow(/HTTP 500/);
  });

  it('throws on malformed response', async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ something: 'else' }), { status: 200 })
    );
    const { fetchBtcPrice } = createPriceFetcher({}, { fetchImpl });
    await expect(fetchBtcPrice()).rejects.toThrow(/malformed/);
  });

  it('throws DebouncedError on a second call within the debounce window', async () => {
    let t = 1_700_000_000_000;
    const fetchImpl = vi.fn(async () => okResponse(95_000));
    const { fetchBtcPrice } = createPriceFetcher({}, { fetchImpl, now: () => t });
    await fetchBtcPrice();
    t += 30_000; // 30s later, still inside the 60s window
    await expect(fetchBtcPrice()).rejects.toBeInstanceOf(DebouncedError);
  });

  it('allows a call after the debounce window has elapsed', async () => {
    let t = 1_700_000_000_000;
    const fetchImpl = vi.fn(async () => okResponse(95_000));
    const { fetchBtcPrice } = createPriceFetcher({}, { fetchImpl, now: () => t });
    await fetchBtcPrice();
    t += 61_000; // past the 60s window
    await expect(fetchBtcPrice()).resolves.toBeDefined();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
