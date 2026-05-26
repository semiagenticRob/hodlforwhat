import type { AppState, Target } from './types';
import { evaluateTarget } from './evaluate';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const btc = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

export function renderHeader(state: AppState, refreshDisabledRemainingMs: number): {
  priceText: string;
  updatedText: string;
  refreshLabel: string;
  refreshDisabled: boolean;
} {
  const priceText = state.lastPriceFetch
    ? `BTC: ${usd.format(state.lastPriceFetch.priceUsd)}`
    : 'BTC: —';
  const updatedText = state.lastPriceFetch ? `(last updated ${friendlyAge(state.lastPriceFetch.at)})` : '';
  const refreshDisabled = refreshDisabledRemainingMs > 0;
  const refreshLabel = refreshDisabled
    ? `Refresh available in ${Math.ceil(refreshDisabledRemainingMs / 1000)}s`
    : '↻ Refresh';
  return { priceText, updatedText, refreshLabel, refreshDisabled };
}

export function renderTargets(state: AppState): HTMLElement {
  const container = document.createElement('div');
  container.className = 'targets-list';

  if (state.targets.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No targets yet. Add one to get started.';
    container.appendChild(empty);
    return container;
  }

  const currentPrice = state.lastPriceFetch?.priceUsd ?? 0;

  for (const target of state.targets) {
    container.appendChild(renderTargetCard(target, currentPrice));
  }
  return container;
}

function renderTargetCard(target: Target, currentPriceUsd: number): HTMLElement {
  const status = evaluateTarget(target, currentPriceUsd);
  const card = document.createElement('article');
  card.className = `target-card target-card--${status}`;
  card.dataset.id = target.id;

  const header = document.createElement('div');
  header.className = 'target-card__header';
  const goal = document.createElement('h3');
  goal.textContent = target.goal;
  header.appendChild(goal);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'target-card__edit';
  editBtn.dataset.action = 'edit';
  editBtn.dataset.id = target.id;
  editBtn.textContent = 'edit';
  header.appendChild(editBtn);

  card.appendChild(header);

  const meta = document.createElement('p');
  meta.className = 'target-card__meta';
  meta.textContent = `When BTC ≥ ${usd.format(target.priceUsd)} • sell ${btc.format(target.amountBtc)} BTC`;
  card.appendChild(meta);

  const statusEl = document.createElement('p');
  statusEl.className = 'target-card__status';
  if (status === 'hit') {
    statusEl.textContent = 'Status: HIT — ready to act';
  } else if (currentPriceUsd > 0) {
    const gap = target.priceUsd - currentPriceUsd;
    statusEl.textContent = `Status: pending (${usd.format(gap)} more to go)`;
  } else {
    statusEl.textContent = 'Status: pending (refresh BTC price to see how close)';
  }
  card.appendChild(statusEl);

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'target-card__delete';
  delBtn.dataset.action = 'delete';
  delBtn.dataset.id = target.id;
  delBtn.textContent = 'delete';
  card.appendChild(delBtn);

  return card;
}

function friendlyAge(isoTimestamp: string): string {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
