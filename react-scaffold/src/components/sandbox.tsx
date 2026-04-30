import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef, useState } from 'react';
import { markSandbox } from '../lib/progress';
import { clearKey, ensureKey, getKey, setKey } from '../lib/sandbox/anthropic-client';
import { runAnthropicMode, runJsMode } from '../lib/sandbox/runner';
import type { RunLine, RunResult, SandboxConfig, Verdict } from '../lib/sandbox/types';

const levelClasses: Record<RunLine['level'], string> = {
  log: 'text-ink-900',
  warn: 'text-orange-500',
  error: 'text-red-500',
  info: 'text-ink-700'
};
const ghostButton =
  'rounded-full border border-ink-500/30 bg-clay-bg px-4 py-2 text-sm text-ink-700';
const editorTheme = EditorView.theme({
  '&': { minHeight: '240px', fontSize: '13px' },
  '.cm-scroller': { minHeight: '240px', fontFamily: 'ui-monospace, monospace' },
  '.cm-content': { padding: '16px 0' },
  '.cm-gutters': { minHeight: '240px' }
});

function formatValue(value: unknown): string {
  if (typeof value === 'undefined') return 'undefined';
  if (value instanceof Error) return value.message;
  try {
    const json = JSON.stringify(value, null, 2);
    return json ?? String(value);
  } catch {
    return String(value);
  }
}

function truncateKey(key: string): string {
  return key.length <= 14 ? key : `${key.slice(0, 7)}...${key.slice(-4)}`;
}

export default function Sandbox(config: SandboxConfig) {
  const [editorValue, setEditorValue] = useState(config.starter);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [keyPanelTick, setKeyPanelTick] = useState(0);
  const editorHostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const savedKey = keyPanelTick >= 0 && config.mode === 'anthropic' ? getKey() : null;

  useEffect(() => {
    if (!editorHostRef.current) return;
    const view = new EditorView({
      parent: editorHostRef.current,
      state: EditorState.create({
        doc: config.starter,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          bracketMatching(),
          closeBrackets(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap, indentWithTab]),
          javascript(),
          oneDark,
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) setEditorValue(update.state.doc.toString());
          })
        ]
      })
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [config.starter]);

  async function runCurrentCode(): Promise<RunResult> {
    const result =
      config.mode === 'anthropic'
        ? await runAnthropicMode(editorValue)
        : await runJsMode(editorValue);
    setOutput(result);
    return result;
  }

  async function handleRun() {
    setVerdict(null);
    await runCurrentCode();
  }

  async function handleVerify() {
    setVerdict(null);
    const runResult = await runCurrentCode();
    let nextVerdict: Verdict;
    try {
      const checked = await config.test(runResult.result, runResult.lines);
      nextVerdict =
        checked && typeof checked.passed === 'boolean'
          ? checked
          : { passed: false, message: 'Verifier returned no verdict.' };
    } catch (error) {
      nextVerdict = { passed: false, message: 'Verifier crashed.', details: formatValue(error) };
    }
    setVerdict(nextVerdict);
    markSandbox(config.id, nextVerdict.passed ? 'passed' : 'attempted');
  }

  function handleReset() {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: config.starter } });
    }
    setEditorValue(config.starter);
    setOutput(null);
    setVerdict(null);
    setHintOpen(false);
  }

  function handleSetKey() {
    try {
      setKey(ensureKey().trim());
    } catch {
      return;
    } finally {
      setKeyPanelTick((tick) => tick + 1);
    }
  }

  function handleClearKey() {
    clearKey();
    setKeyPanelTick((tick) => tick + 1);
  }

  const outputLines = output?.error
    ? [...output.lines, { level: 'error' as const, text: output.error.message }]
    : output?.lines;

  return (
    <section className="space-y-4 rounded-2xl bg-white/70 p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-700">▸ sandbox · {config.id}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-medium text-ink-700 ${config.mode === 'anthropic' ? 'bg-clay-peach' : 'bg-clay-mint'}`}>
          {config.mode === 'anthropic' ? 'BYOK · live API' : 'in-browser JS'}
        </span>
      </div>

      {config.prompt ? <div className="rounded-xl bg-clay-bg p-4 text-sm text-ink-900">{config.prompt}</div> : null}
      <div ref={editorHostRef} className="overflow-hidden rounded-xl bg-[#1A2530]" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {config.hint ? <button type="button" className={ghostButton} onClick={() => setHintOpen((open) => !open)}>Hint</button> : null}
          <button type="button" className={ghostButton} onClick={handleReset}>Reset</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full bg-accent-coral px-4 py-2 text-sm font-medium text-white" onClick={handleRun}>Run</button>
          <button type="button" className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white" onClick={handleVerify}>Verify</button>
        </div>
      </div>

      {output ? (
        <div className="rounded-2xl bg-clay-cream p-4 shadow-soft">
          <p className="mb-2 text-xs uppercase text-ink-700">output</p>
          <div className="space-y-1 font-mono text-sm">
            {outputLines && outputLines.length > 0 ? (
              outputLines.map((line, index) => (
                <p key={`${line.level}-${index}`} className={levelClasses[line.level]}>{line.text}</p>
              ))
            ) : (
              <p className="text-ink-500">(no console output)</p>
            )}
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs text-ink-700">returned →</p>
            <pre className="overflow-x-auto rounded-xl bg-white/70 p-3 font-mono text-xs text-ink-900">{formatValue(output.result)}</pre>
          </div>
        </div>
      ) : null}

      {verdict ? (
        <div className={`rounded-2xl p-4 ${verdict.passed ? 'bg-clay-mint text-green-700' : 'bg-clay-peach text-red-600'}`}>
          <div className="flex gap-3">
            <span className="font-heading text-xl">{verdict.passed ? '✓' : '✕'}</span>
            <div>
              <p className="font-heading text-lg">{verdict.message || (verdict.passed ? 'Passed' : 'Not yet')}</p>
              {verdict.details ? <p className="mt-2 text-sm">{verdict.details}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {hintOpen && config.hint ? <div className="rounded-2xl bg-clay-bg p-4 text-sm text-ink-700">{config.hint}</div> : null}

      {config.mode === 'anthropic' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-clay-bg p-3 text-sm text-ink-700">
          <span>
            {savedKey ? <>key: <code className="font-mono">{truncateKey(savedKey)}</code></> : 'No API key saved'}
          </span>
          {savedKey ? (
            <button type="button" className="text-accent-coral" onClick={handleClearKey}>Clear key</button>
          ) : (
            <button type="button" className="text-accent-coral" onClick={handleSetKey}>Set key</button>
          )}
        </div>
      ) : null}
    </section>
  );
}
