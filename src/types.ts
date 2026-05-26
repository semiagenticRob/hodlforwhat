export type TargetStatus = 'pending' | 'hit';

export interface Target {
  id: string;
  goal: string;
  priceUsd: number;
  amountBtc: number;
  createdAt: string;
}

export interface PriceFetch {
  priceUsd: number;
  at: string;
}

export interface AppState {
  targets: Target[];
  lastPriceFetch: PriceFetch | null;
}

export const STORAGE_KEY = 'hodlforwhat.targets';

export const DEBOUNCE_MS = 60_000;
