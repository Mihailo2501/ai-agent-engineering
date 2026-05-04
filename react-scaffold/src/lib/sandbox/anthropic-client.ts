const KEY_STORAGE = 'aiae:anthropic-key';
const REMEMBER_FLAG = 'aiae:anthropic-key:remember';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

// Default storage is sessionStorage: the key clears when the tab closes.
// localStorage is opt-in via the "remember on this device" toggle.

function readKey(): { value: string | null; persistent: boolean } {
  const session = sessionStorage.getItem(KEY_STORAGE);
  if (session) return { value: session, persistent: false };
  const local = localStorage.getItem(KEY_STORAGE);
  if (local) return { value: local, persistent: true };
  return { value: null, persistent: false };
}

export function getKey(): string | null {
  return readKey().value;
}

export function isPersistent(): boolean {
  return localStorage.getItem(REMEMBER_FLAG) === '1';
}

export function setKey(k: string, persist?: boolean): void {
  const key = k.trim();
  if (!key) throw new Error('No API key provided');
  const remember = persist ?? isPersistent();
  // Clear both stores first so we never leak the key across modes.
  sessionStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(KEY_STORAGE);
  if (remember) {
    localStorage.setItem(KEY_STORAGE, key);
    localStorage.setItem(REMEMBER_FLAG, '1');
  } else {
    sessionStorage.setItem(KEY_STORAGE, key);
    localStorage.removeItem(REMEMBER_FLAG);
  }
}

export function setPersistent(persist: boolean): void {
  const current = getKey();
  localStorage.setItem(REMEMBER_FLAG, persist ? '1' : '0');
  if (current) setKey(current, persist);
}

export function clearKey(): void {
  sessionStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(REMEMBER_FLAG);
}

export function ensureKey(): string {
  let key = getKey();
  if (!key) {
    key = window.prompt(
      "Paste your Anthropic API key. By default it stays in this browser tab's sessionStorage and clears when you close the tab. Enable 'remember on this device' below to persist it instead."
    );
    if (!key || !key.trim()) throw new Error('No API key provided');
    key = key.trim();
    setKey(key);
  }
  return key;
}

export async function callClaude(opts: {
  messages: unknown[];
  tools?: unknown[];
  tool_choice?: unknown;
  system?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}): Promise<unknown> {
  const key = ensureKey();
  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.max_tokens ?? 1024,
    messages: opts.messages
  };

  if (opts.tools) body.tools = opts.tools;
  if (opts.tool_choice) body.tool_choice = opts.tool_choice;
  if (opts.system) body.system = opts.system;
  if (opts.temperature !== undefined) body.temperature = opts.temperature;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}
