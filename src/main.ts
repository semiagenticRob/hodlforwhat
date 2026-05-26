import {
  loadState,
  saveState,
  addTarget,
  updateTarget,
  deleteTarget,
  recordPriceFetch,
} from './state';
import { createPriceFetcher, DebouncedError } from './price';
import { renderHeader, renderTargets } from './render';
import type { AppState, Target } from './types';

let state: AppState = loadState();

const priceFetcher = createPriceFetcher({
  lastFetchAt: state.lastPriceFetch ? new Date(state.lastPriceFetch.at).getTime() : 0,
});

let countdownTimer: number | null = null;

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el;
}

let toastTimer: number | null = null;
function toast(message: string, durationMs = 2000) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('toast--visible');
  if (toastTimer !== null) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.classList.remove('toast--visible');
    toastTimer = null;
  }, durationMs);
}

function persist(): boolean {
  const ok = saveState(state);
  if (!ok) toast('Could not save — check browser storage settings.', 4000);
  return ok;
}

function rerender() {
  const targetsEl = $('targets');
  targetsEl.replaceChildren(...renderTargets(state).children);

  const header = renderHeader(state, priceFetcher.remainingDebounceMs());
  $('price').textContent = header.priceText;
  $('updated').textContent = header.updatedText;
  const refreshBtn = $('refresh') as HTMLButtonElement;
  refreshBtn.textContent = header.refreshLabel;
  refreshBtn.disabled = header.refreshDisabled;

  if (header.refreshDisabled && countdownTimer === null) {
    countdownTimer = window.setInterval(() => {
      const remaining = priceFetcher.remainingDebounceMs();
      if (remaining <= 0) {
        if (countdownTimer !== null) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
        rerender();
      } else {
        refreshBtn.textContent = `Refresh available in ${Math.ceil(remaining / 1000)}s`;
      }
    }, 1000);
  }
}

async function handleRefresh() {
  try {
    const fetched = await priceFetcher.fetchBtcPrice();
    state = recordPriceFetch(state, fetched);
    persist();
    rerender();
  } catch (err) {
    if (err instanceof DebouncedError) {
      rerender();
      return;
    }
    const refreshBtn = $('refresh') as HTMLButtonElement;
    refreshBtn.textContent = '↻ Refresh (price fetch failed — try again)';
  }
}

function handleAddNew() {
  const form = $('target-form') as HTMLFormElement;
  form.classList.remove('hidden');
  (form.elements.namedItem('id') as HTMLInputElement).value = '';
  (form.elements.namedItem('goal') as HTMLInputElement).value = '';
  (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '';
  (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '';
  (form.elements.namedItem('goal') as HTMLInputElement).focus();
}

function handleFormSubmit(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const id = (form.elements.namedItem('id') as HTMLInputElement).value;
  const goal = (form.elements.namedItem('goal') as HTMLInputElement).value.trim();
  const priceUsd = parseFloat((form.elements.namedItem('priceUsd') as HTMLInputElement).value);
  const amountBtc = parseFloat((form.elements.namedItem('amountBtc') as HTMLInputElement).value);
  if (
    !goal ||
    !Number.isFinite(priceUsd) ||
    !Number.isFinite(amountBtc) ||
    priceUsd <= 0 ||
    amountBtc <= 0
  ) {
    return;
  }

  if (id) {
    const existing = state.targets.find((t) => t.id === id);
    if (existing) {
      const updated: Target = { ...existing, goal, priceUsd, amountBtc };
      state = updateTarget(state, updated);
    }
  } else {
    const target: Target = {
      id: crypto.randomUUID(),
      goal,
      priceUsd,
      amountBtc,
      createdAt: new Date().toISOString(),
    };
    state = addTarget(state, target);
  }
  persist();
  form.classList.add('hidden');
  toast(id ? 'Target updated' : 'Target saved');
  rerender();
}

function handleFormCancel() {
  $('target-form').classList.add('hidden');
}

function handleTargetClick(event: Event) {
  const targetEl = event.target as HTMLElement;
  const action = targetEl.dataset.action;
  const id = targetEl.dataset.id;
  if (!action || !id) return;

  if (action === 'delete') {
    const target = state.targets.find((t) => t.id === id);
    const label = target?.goal ? `"${target.goal}"` : 'this target';
    if (!confirm(`Delete ${label}?`)) return;
    state = deleteTarget(state, id);
    persist();
    toast('Target deleted');
    rerender();
  } else if (action === 'edit') {
    const target = state.targets.find((t) => t.id === id);
    if (!target) return;
    const form = $('target-form') as HTMLFormElement;
    form.classList.remove('hidden');
    (form.elements.namedItem('id') as HTMLInputElement).value = target.id;
    (form.elements.namedItem('goal') as HTMLInputElement).value = target.goal;
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = String(target.priceUsd);
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = String(target.amountBtc);
  }
}

function init() {
  $('refresh').addEventListener('click', handleRefresh);
  $('add-new').addEventListener('click', handleAddNew);
  ($('target-form') as HTMLFormElement).addEventListener('submit', handleFormSubmit);
  $('form-cancel').addEventListener('click', handleFormCancel);
  $('targets').addEventListener('click', handleTargetClick);
  rerender();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { init };
