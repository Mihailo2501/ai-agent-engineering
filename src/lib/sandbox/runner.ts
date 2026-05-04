import { callClaude } from './anthropic-client';
import type { RunLine, RunResult } from './types';

type ConsoleLevel = RunLine['level'];

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return 'undefined';
  if (value instanceof Error) return value.message;
  try {
    const json = JSON.stringify(value, null, 2);
    return json ?? String(value);
  } catch {
    return String(value);
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(toText(error));
}

async function captureConsole(
  fn: (lines: RunLine[]) => unknown | Promise<unknown>
): Promise<RunResult> {
  const lines: RunLine[] = [];
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  function wrap(level: ConsoleLevel) {
    return (...args: unknown[]) => {
      lines.push({ level, text: args.map(toText).join(' ') });
      original[level](...args);
    };
  }

  console.log = wrap('log');
  console.warn = wrap('warn');
  console.error = wrap('error');
  console.info = wrap('info');

  try {
    const result = await fn(lines);
    return { result, lines };
  } catch (error) {
    return { error: toError(error), lines };
  } finally {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
    console.info = original.info;
  }
}

export async function runJsMode(code: string): Promise<RunResult> {
  const wrapped = `"use strict";\nreturn (async () => {\n${code}\n})();`;
  return captureConsole(() => {
    const fn = new Function(wrapped) as () => Promise<unknown>;
    return fn();
  });
}

export async function runAnthropicMode(code: string): Promise<RunResult> {
  const wrapped = `"use strict";\nreturn (async ({ claude, log }) => {\n${code}\n})(arguments[0]);`;
  return captureConsole((lines) => {
    const fn = new Function(wrapped) as (helpers: {
      claude: typeof callClaude;
      log: (...args: unknown[]) => void;
    }) => Promise<unknown>;
    return fn({
      claude: callClaude,
      log: (...args: unknown[]) => {
        lines.push({ level: 'log', text: args.map(toText).join(' ') });
      }
    });
  });
}
