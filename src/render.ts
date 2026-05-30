import type { AppState, Target, TargetStatus } from './types';
import { evaluateTarget } from './evaluate';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const btc = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

interface ElAttrs {
  className?: string;
  textContent?: string;
  type?: string;
  dataset?: Record<string, string>;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: ElAttrs = {},
  ...children: HTMLElement[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (attrs.className != null) node.className = attrs.className;
  if (attrs.textContent != null) node.textContent = attrs.textContent;
  if (attrs.type != null) (node as HTMLButtonElement).type = attrs.type as 'button' | 'submit' | 'reset';
  if (attrs.dataset) Object.assign(node.dataset, attrs.dataset);
  for (const child of children) node.appendChild(child);
  return node;
}

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
    container.appendChild(el('p', { className: 'empty-state', textContent: 'No targets yet. Add one to get started.' }));
    return container;
  }

  const currentPrice = state.lastPriceFetch?.priceUsd ?? 0;
  for (const target of state.targets) {
    container.appendChild(renderTargetCard(target, currentPrice));
  }
  return container;
}

function statusText(status: TargetStatus, target: Target, currentPriceUsd: number): string {
  if (status === 'hit') return 'Status: HIT — ready to act';
  if (currentPriceUsd > 0) {
    const gap = target.priceUsd - currentPriceUsd;
    return `Status: pending (${usd.format(gap)} more to go)`;
  }
  return 'Status: pending (refresh BTC price to see how close)';
}

function renderTargetCard(target: Target, currentPriceUsd: number): HTMLElement {
  const status = evaluateTarget(target, currentPriceUsd);

  const header = el(
    'div',
    { className: 'target-card__header' },
    el('h3', { textContent: target.goal }),
    el('button', { type: 'button', className: 'target-card__edit', textContent: 'edit', dataset: { action: 'edit', id: target.id } }),
  );

  const meta = el('p', {
    className: 'target-card__meta',
    textContent: `When BTC ≥ ${usd.format(target.priceUsd)} • sell ${btc.format(target.amountBtc)} BTC`,
  });

  const statusEl = el('p', {
    className: 'target-card__status',
    textContent: statusText(status, target, currentPriceUsd),
  });

  const delBtn = el('button', {
    type: 'button',
    className: 'target-card__delete',
    textContent: 'delete',
    dataset: { action: 'delete', id: target.id },
  });

  return el(
    'article',
    { className: `target-card target-card--${status}`, dataset: { id: target.id } },
    header,
    meta,
    statusEl,
    delBtn,
  );
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
