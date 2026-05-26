import { describe, it, expect } from 'vitest';
import { renderTargets, renderHeader } from './render';
import type { AppState, Target } from './types';

function makeTarget(id: string, priceUsd: number, goal = `goal-${id}`): Target {
  return {
    id,
    goal,
    priceUsd,
    amountBtc: 0.1,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('renderTargets', () => {
  it('renders an empty state message when there are no targets', () => {
    const el = renderTargets({ targets: [], lastPriceFetch: null });
    expect(el.querySelector('.empty-state')?.textContent).toMatch(/no targets yet/i);
  });

  it('renders a single pending target with pending status copy', () => {
    const state: AppState = {
      targets: [makeTarget('a', 200_000)],
      lastPriceFetch: { priceUsd: 100_000, at: '2026-01-01T00:00:00Z' },
    };
    const el = renderTargets(state);
    const card = el.querySelector('.target-card');
    expect(card?.classList.contains('target-card--pending')).toBe(true);
    expect(card?.querySelector('.target-card__status')?.textContent).toMatch(/pending/i);
  });

  it('renders a hit target with the hit class and copy', () => {
    const state: AppState = {
      targets: [makeTarget('a', 80_000)],
      lastPriceFetch: { priceUsd: 100_000, at: '2026-01-01T00:00:00Z' },
    };
    const el = renderTargets(state);
    const card = el.querySelector('.target-card');
    expect(card?.classList.contains('target-card--hit')).toBe(true);
    expect(card?.querySelector('.target-card__status')?.textContent).toMatch(/HIT/);
  });

  it('renders multiple targets in the order provided (newest first)', () => {
    const state: AppState = {
      targets: [makeTarget('newest', 100_000, 'newest'), makeTarget('oldest', 200_000, 'oldest')],
      lastPriceFetch: null,
    };
    const el = renderTargets(state);
    const goals = Array.from(el.querySelectorAll('.target-card h3')).map((n) => n.textContent);
    expect(goals).toEqual(['newest', 'oldest']);
  });
});

describe('renderHeader', () => {
  it('returns dash when no price has been fetched', () => {
    const header = renderHeader({ targets: [], lastPriceFetch: null }, 0);
    expect(header.priceText).toBe('BTC: —');
    expect(header.refreshDisabled).toBe(false);
    expect(header.refreshLabel).toContain('Refresh');
  });

  it('formats the BTC price as USD when present', () => {
    const header = renderHeader(
      { targets: [], lastPriceFetch: { priceUsd: 95_000, at: new Date().toISOString() } },
      0
    );
    expect(header.priceText).toContain('$95,000');
  });

  it('shows countdown text and disabled flag when within the debounce window', () => {
    const header = renderHeader({ targets: [], lastPriceFetch: null }, 42_000);
    expect(header.refreshDisabled).toBe(true);
    expect(header.refreshLabel).toContain('42s');
  });
});
