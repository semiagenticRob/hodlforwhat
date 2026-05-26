import { describe, it, expect } from 'vitest';
import { evaluateTarget } from './evaluate';
import type { Target } from './types';

function makeTarget(priceUsd: number): Target {
  return {
    id: 'test-id',
    goal: 'test',
    priceUsd,
    amountBtc: 0.1,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('evaluateTarget', () => {
  it('returns hit when current price equals target price', () => {
    expect(evaluateTarget(makeTarget(100_000), 100_000)).toBe('hit');
  });

  it('returns hit when current price exceeds target by 1 cent', () => {
    expect(evaluateTarget(makeTarget(100_000), 100_000.01)).toBe('hit');
  });

  it('returns pending when current price is 1 cent below target', () => {
    expect(evaluateTarget(makeTarget(100_000), 99_999.99)).toBe('pending');
  });

  it('returns pending for current price far below target', () => {
    expect(evaluateTarget(makeTarget(1_000_000), 50_000)).toBe('pending');
  });

  it('handles very large prices without overflow', () => {
    expect(evaluateTarget(makeTarget(1_000_000_000), 1_000_000_000)).toBe('hit');
    expect(evaluateTarget(makeTarget(1_000_000_000), 999_999_999)).toBe('pending');
  });
});
