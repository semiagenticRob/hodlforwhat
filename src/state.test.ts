import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  addTarget,
  updateTarget,
  deleteTarget,
  recordPriceFetch,
} from './state';
import { STORAGE_KEY } from './types';
import type { Target } from './types';

function makeTarget(id: string, priceUsd = 100_000): Target {
  return {
    id,
    goal: `goal-${id}`,
    priceUsd,
    amountBtc: 0.1,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty state when LocalStorage is empty', () => {
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('returns empty state when LocalStorage contains garbage', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('returns empty state when LocalStorage JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{"targets": "not an array"}');
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('coerces a string-shaped lastPriceFetch to null', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ targets: [], lastPriceFetch: 'garbage' }));
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('coerces a lastPriceFetch missing required fields to null', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ targets: [], lastPriceFetch: { priceUsd: 95_000 } })
    );
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('coerces a lastPriceFetch with non-numeric priceUsd to null', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ targets: [], lastPriceFetch: { priceUsd: 'lots', at: '2026-01-01' } })
    );
    expect(loadState()).toEqual({ targets: [], lastPriceFetch: null });
  });

  it('round-trips state through save then load', () => {
    const target = makeTarget('a');
    const state = { targets: [target], lastPriceFetch: { priceUsd: 95_000, at: '2026-01-02T00:00:00Z' } };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it('addTarget prepends (newest first)', () => {
    const t1 = makeTarget('a');
    const t2 = makeTarget('b');
    let state = addTarget({ targets: [], lastPriceFetch: null }, t1);
    state = addTarget(state, t2);
    expect(state.targets.map((t) => t.id)).toEqual(['b', 'a']);
  });

  it('updateTarget replaces by id and leaves others untouched', () => {
    const t1 = makeTarget('a', 100_000);
    const t2 = makeTarget('b', 200_000);
    const state = { targets: [t1, t2], lastPriceFetch: null };
    const updated = { ...t1, priceUsd: 150_000 };
    const next = updateTarget(state, updated);
    expect(next.targets.find((t) => t.id === 'a')?.priceUsd).toBe(150_000);
    expect(next.targets.find((t) => t.id === 'b')?.priceUsd).toBe(200_000);
  });

  it('deleteTarget removes by id', () => {
    const t1 = makeTarget('a');
    const t2 = makeTarget('b');
    const state = { targets: [t1, t2], lastPriceFetch: null };
    const next = deleteTarget(state, 'a');
    expect(next.targets.map((t) => t.id)).toEqual(['b']);
  });

  it('recordPriceFetch updates lastPriceFetch only', () => {
    const t1 = makeTarget('a');
    const state = { targets: [t1], lastPriceFetch: null };
    const next = recordPriceFetch(state, { priceUsd: 95_000, at: '2026-01-02T00:00:00Z' });
    expect(next.targets).toEqual([t1]);
    expect(next.lastPriceFetch).toEqual({ priceUsd: 95_000, at: '2026-01-02T00:00:00Z' });
  });
});
