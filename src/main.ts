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

function formInput(form: HTMLFormElement, name: string): HTMLInputElement {
  return form.elements.namedItem(name) as HTMLInputElement;
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

function startCountdown(refreshBtn: HTMLButtonElement): void {
  if (countdownTimer !== null) return;
  countdownTimer = window.setInterval(() => {
    const remaining = priceFetcher.remainingDebounceMs();
    if (remaining <= 0) {
      clearInterval(countdownTimer!);
      countdownTimer = null;
      rerender();
    } else {
      refreshBtn.textContent = `Refresh available in ${Math.ceil(remaining / 1000)}s`;
    }
  }, 1000);
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

  if (header.refreshDisabled) {
    startCountdown(refreshBtn);
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
    toast('Price fetch failed — try again.', 4000);
    rerender();
  }
}

function handleAddNew() {
  const form = $('target-form') as HTMLFormElement;
  form.classList.remove('hidden');
  const goalEl = formInput(form, 'goal');
  formInput(form, 'id').value = '';
  goalEl.value = '';
  formInput(form, 'priceUsd').value = '';
  formInput(form, 'amountBtc').value = '';
  goalEl.focus();
}

function handleFormSubmit(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const id = formInput(form, 'id').value;
  const goal = formInput(form, 'goal').value.trim();
  const priceUsd = parseFloat(formInput(form, 'priceUsd').value);
  const amountBtc = parseFloat(formInput(form, 'amountBtc').value);
  if (
    !goal ||
    !Number.isFinite(priceUsd) ||
    !Number.isFinite(amountBtc) ||
    priceUsd <= 0 ||
    amountBtc <= 0
  ) {
    toast('Please fill in all fields with valid values.', 3000);
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
    formInput(form, 'id').value = target.id;
    formInput(form, 'goal').value = target.goal;
    formInput(form, 'priceUsd').value = String(target.priceUsd);
    formInput(form, 'amountBtc').value = String(target.amountBtc);
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
