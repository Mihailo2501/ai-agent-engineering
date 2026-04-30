const KEY_STORAGE = 'aiae:anthropic-key';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export function getKey(): string | null {
  return localStorage.getItem(KEY_STORAGE);
}

export function setKey(k: string): void {
  localStorage.setItem(KEY_STORAGE, k);
}

export function clearKey(): void {
  localStorage.removeItem(KEY_STORAGE);
}

export function ensureKey(): string {
  let key = getKey();
  if (!key) {
    key = window.prompt(
      "Paste your Anthropic API key. It is stored only in this browser's localStorage."
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
