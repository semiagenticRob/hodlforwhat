import type { Target, TargetStatus } from './types';

export function evaluateTarget(target: Target, currentPriceUsd: number): TargetStatus {
  return currentPriceUsd >= target.priceUsd ? 'hit' : 'pending';
}
