import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORAGE_KEY } from './types';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: Node[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) node.appendChild(c);
  return node;
}

function setUpDom() {
  while (document.body.firstChild) document.body.removeChild(document.body.firstChild);

  const price = el('span', { id: 'price', class: 'price' });
  price.textContent = 'BTC: —';
  const updated = el('span', { id: 'updated', class: 'updated' });
  const refresh = el('button', { id: 'refresh', class: 'refresh', type: 'button' });
  refresh.textContent = '↻ Refresh';
  const priceBar = el('div', { class: 'price-bar' }, [price, updated, refresh]);
  const toastEl = el('div', { id: 'toast', class: 'toast', role: 'status' });
  const header = el('header', { class: 'app-header' }, [
    el('h1', {}, [document.createTextNode('HodlForWhat')]),
    priceBar,
    toastEl,
  ]);

  const addNew = el('button', { id: 'add-new', type: 'button' });
  addNew.textContent = '+ Add new';
  const targetsHeader = el('div', { class: 'targets-header' }, [el('h2', {}, [document.createTextNode('Your targets')]), addNew]);
  const targetsList = el('div', { id: 'targets', class: 'targets' });

  const form = el('form', { id: 'target-form', class: 'target-form hidden' }, [
    el('input', { name: 'goal', type: 'text' }),
    el('input', { name: 'priceUsd', type: 'number' }),
    el('input', { name: 'amountBtc', type: 'number' }),
    el('input', { type: 'hidden', name: 'id' }),
    el('button', { type: 'submit' }),
    el('button', { type: 'button', id: 'form-cancel' }),
  ]);

  const section = el('section', { class: 'targets-section' }, [targetsHeader, targetsList, form]);
  const main = el('main', { id: 'app' }, [header, section]);
  document.body.appendChild(main);
}

describe('main', () => {
  beforeEach(() => {
    localStorage.clear();
    setUpDom();
    vi.resetModules();
    if (!('randomUUID' in crypto)) {
      Object.defineProperty(crypto, 'randomUUID', { value: () => 'test-uuid', configurable: true });
    }
  });

  it('renders empty state on load', async () => {
    const { init } = await import('./main');
    init();
    expect(document.querySelector('.empty-state')?.textContent).toMatch(/no targets/i);
  });

  it('add-new form creates a target and rerenders', async () => {
    const { init } = await import('./main');
    init();
    (document.getElementById('add-new') as HTMLButtonElement).click();
    const form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'Down payment';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '180000';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0.5';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const card = document.querySelector('.target-card');
    expect(card?.querySelector('h3')?.textContent).toBe('Down payment');
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.targets.length).toBe(1);
  });

  it('rejects a zero-priceUsd submission', async () => {
    const { init } = await import('./main');
    init();
    (document.getElementById('add-new') as HTMLButtonElement).click();
    const form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'Bad target';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '0';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0.5';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('.target-card')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('rejects a zero-amountBtc submission', async () => {
    const { init } = await import('./main');
    init();
    (document.getElementById('add-new') as HTMLButtonElement).click();
    const form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'Bad target';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '180000';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('.target-card')).toBeNull();
  });

  it('edit flow updates a target and persists', async () => {
    const { init } = await import('./main');
    init();
    // Create a target first.
    (document.getElementById('add-new') as HTMLButtonElement).click();
    let form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'Original';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '100000';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0.25';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Click edit on the card.
    const editBtn = document.querySelector(
      '.target-card__edit'
    ) as HTMLButtonElement;
    editBtn.click();

    // Form should be populated. Change priceUsd and resubmit.
    form = document.getElementById('target-form') as HTMLFormElement;
    expect((form.elements.namedItem('goal') as HTMLInputElement).value).toBe('Original');
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '150000';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.targets.length).toBe(1);
    expect(persisted.targets[0].priceUsd).toBe(150_000);
    expect(persisted.targets[0].goal).toBe('Original');
  });

  it('delete flow removes a target from DOM and LocalStorage when confirmed', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    const { init } = await import('./main');
    init();
    (document.getElementById('add-new') as HTMLButtonElement).click();
    const form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'To remove';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '120000';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0.1';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('.target-card')).not.toBeNull();

    const delBtn = document.querySelector(
      '.target-card__delete'
    ) as HTMLButtonElement;
    delBtn.click();

    expect(document.querySelector('.target-card')).toBeNull();
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.targets.length).toBe(0);
    vi.unstubAllGlobals();
  });

  it('delete flow leaves the target intact when cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const { init } = await import('./main');
    init();
    (document.getElementById('add-new') as HTMLButtonElement).click();
    const form = document.getElementById('target-form') as HTMLFormElement;
    (form.elements.namedItem('goal') as HTMLInputElement).value = 'Keep me';
    (form.elements.namedItem('priceUsd') as HTMLInputElement).value = '120000';
    (form.elements.namedItem('amountBtc') as HTMLInputElement).value = '0.1';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const delBtn = document.querySelector(
      '.target-card__delete'
    ) as HTMLButtonElement;
    delBtn.click();

    expect(document.querySelector('.target-card')).not.toBeNull();
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.targets.length).toBe(1);
    vi.unstubAllGlobals();
  });

  it('refresh click fetches price, displays it, and disables the button', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ bitcoin: { usd: 95_000 } }), { status: 200 })
      )
    );
    const { init } = await import('./main');
    init();
    const refreshBtn = document.getElementById('refresh') as HTMLButtonElement;
    refreshBtn.click();
    // Yield to allow the awaited fetch + state save + rerender to complete.
    await new Promise((r) => setTimeout(r, 0));

    const price = document.getElementById('price') as HTMLElement;
    expect(price.textContent).toContain('$95,000');
    expect(refreshBtn.disabled).toBe(true);
    expect(refreshBtn.textContent).toMatch(/Refresh available in \d+s/);

    vi.unstubAllGlobals();
  });
});
