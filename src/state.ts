import type { AppState, Target, PriceFetch } from './types';
import { STORAGE_KEY } from './types';

function emptyState(): AppState {
  return { targets: [], lastPriceFetch: null };
}

function isPriceFetch(value: unknown): value is PriceFetch {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['priceUsd'] === 'number' &&
    Number.isFinite(v['priceUsd']) &&
    typeof v['at'] === 'string'
  );
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || !Array.isArray(parsed.targets)) return emptyState();
    const lastPriceFetch = isPriceFetch(parsed.lastPriceFetch) ? parsed.lastPriceFetch : null;
    return {
      targets: parsed.targets,
      lastPriceFetch,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addTarget(state: AppState, target: Target): AppState {
  return { ...state, targets: [target, ...state.targets] };
}

export function updateTarget(state: AppState, updated: Target): AppState {
  return {
    ...state,
    targets: state.targets.map((t) => (t.id === updated.id ? updated : t)),
  };
}

export function deleteTarget(state: AppState, id: string): AppState {
  return { ...state, targets: state.targets.filter((t) => t.id !== id) };
}

export function recordPriceFetch(state: AppState, fetch: PriceFetch): AppState {
  return { ...state, lastPriceFetch: fetch };
}
