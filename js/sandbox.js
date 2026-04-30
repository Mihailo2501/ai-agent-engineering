// Vanilla sandbox runtime with two execution modes:
//   - "js":        plain JavaScript runs in the page, return value is the result
//   - "anthropic": user code calls a `claude()` helper that hits /v1/messages with the user's BYOK key
//
// Each sandbox is an empty <div class="sandbox-mount" data-sandbox-id="..."></div>.
// The teaching page registers config via Sandbox.register(id, config) while the page parses.

(function () {
  'use strict';

  const KEY_STORAGE = 'aiae:anthropic-key';
  const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

  const registry = new Map();
  let hasMounted = false;

  function register(id, config) {
    registry.set(id, config);
    if (hasMounted) mountRegistered(id);
  }

  function getKey() {
    return localStorage.getItem(KEY_STORAGE);
  }

  function setKey(k) {
    localStorage.setItem(KEY_STORAGE, k);
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE);
  }

  function ensureKey() {
    let k = getKey();
    if (!k) {
      k = prompt(
        "Paste your Anthropic API key.\n\nIt is stored ONLY in your browser's localStorage. Calls go directly from your browser to Anthropic. Nothing is uploaded to any server controlled by this course."
      );
      if (!k || !k.trim()) throw new Error('No API key provided');
      setKey(k.trim());
    }
    return k;
  }

  async function callClaude({ messages, tools, system, model = DEFAULT_MODEL, max_tokens = 1024, temperature }) {
    const key = ensureKey();
    const body = { model, max_tokens, messages };
    if (system) body.system = system;
    if (tools) body.tools = tools;
    if (temperature !== undefined) body.temperature = temperature;

    let resp;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      throw new Error('Network error calling Anthropic: ' + err.message);
    }
    const txt = await resp.text();
    if (!resp.ok) {
      throw new Error('Anthropic API error ' + resp.status + ': ' + txt);
    }
    if (window.Badges) window.Badges.unlock('first-byok-call');
    return JSON.parse(txt);
  }

  async function runJsMode(code) {
    const wrapped = '"use strict";\nreturn (async () => {\n' + code + '\n})();';
    const fn = new Function(wrapped);
    return await captureConsoleAsync(fn);
  }

  async function captureConsoleAsync(fn) {
    const lines = [];
    const original = { log: console.log, warn: console.warn, error: console.error, info: console.info };
    const stringify = v => {
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v, null, 2); } catch { return String(v); }
    };
    const wrap = level => (...args) => {
      lines.push({ level, text: args.map(stringify).join(' ') });
      original[level].apply(console, args);
    };
    console.log = wrap('log');
    console.warn = wrap('warn');
    console.error = wrap('error');
    console.info = wrap('info');
    let result;
    let error;
    try {
      result = await fn();
    } catch (e) {
      error = e;
    } finally {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
      console.info = original.info;
    }
    return { result, error, lines };
  }

  async function runAnthropicMode(code) {
    const wrapped = `
"use strict";
return (async ({ claude, log }) => {
${code}
})(arguments[0]);
`;
    const fn = new Function(wrapped);
    return await captureConsoleAsync(() =>
      fn({ claude: callClaude, log: (...a) => console.log(...a) })
    );
  }

  function fmtOutputLine(line) {
    const cls = 'out-' + line.level;
    return '<div class="sandbox-out-line ' + cls + '">' + escapeHtml(line.text) + '</div>';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function makeEditor(id, initialCode) {
    const textarea = document.createElement('textarea');
    const lines = String(initialCode || '').split('\n').length;
    textarea.className = 'sandbox-textarea';
    textarea.value = initialCode || '';
    textarea.rows = Math.max(10, Math.min(22, lines + 2));
    textarea.spellcheck = false;
    textarea.setAttribute('aria-label', id + ' code editor');
    textarea.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'min-height:240px',
      'padding:16px 18px',
      'border:0',
      'outline:none',
      'resize:vertical',
      'background:#0d0d0d',
      'color:var(--text)',
      'caret-color:var(--accent)',
      'font-family:var(--mono)',
      'font-size:13px',
      'line-height:1.55',
      'tab-size:2'
    ].join(';');
    textarea.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    });
    return textarea;
  }

  function mountOne(host, config) {
    const id = host.dataset.sandboxId;
    host.innerHTML = `
      <div class="sandbox">
        <div class="sandbox-head">
          <div class="sandbox-id">▸ sandbox · ${id}</div>
          <div class="sandbox-mode-tag">${config.mode === 'anthropic' ? 'BYOK · live API' : 'in-browser JS'}</div>
        </div>
        <div class="sandbox-prompt"></div>
        <div class="sandbox-editor"></div>
        <div class="sandbox-controls">
          <div class="sandbox-controls-left">
            ${config.hint ? '<button class="btn ghost sandbox-hint-btn">hint</button>' : ''}
            <button class="btn ghost sandbox-reset-btn">reset</button>
          </div>
          <div class="sandbox-controls-right">
            <button class="btn sandbox-run-btn">▸ run</button>
            <button class="btn primary sandbox-verify-btn">verify ✓</button>
          </div>
        </div>
        <div class="sandbox-output" hidden>
          <div class="sandbox-output-head">output</div>
          <div class="sandbox-output-body"></div>
        </div>
        <div class="sandbox-verdict" hidden></div>
        <div class="sandbox-hint-panel" hidden></div>
        ${config.mode === 'anthropic' ? '<div class="sandbox-key-panel"></div>' : ''}
      </div>
    `;

    const sandboxEl = host.querySelector('.sandbox');
    const promptEl = host.querySelector('.sandbox-prompt');
    promptEl.innerHTML = config.prompt || '';

    const editorHost = host.querySelector('.sandbox-editor');
    const editor = makeEditor(id, config.starter || '');
    editorHost.appendChild(editor);

    const outputEl = host.querySelector('.sandbox-output');
    const outputBody = host.querySelector('.sandbox-output-body');
    const verdictEl = host.querySelector('.sandbox-verdict');
    const hintPanel = host.querySelector('.sandbox-hint-panel');

    function setOutput(lines, error, result) {
      outputEl.hidden = false;
      let html = lines.map(fmtOutputLine).join('');
      if (error) {
        html += '<div class="sandbox-out-line out-error">⚠ ' + escapeHtml(error.message) + '</div>';
      }
      if (result !== undefined && error === undefined) {
        let stringified;
        try { stringified = JSON.stringify(result, null, 2); }
        catch { stringified = String(result); }
        html += '<div class="sandbox-out-return"><span class="lbl">returned →</span><pre>' + escapeHtml(stringified || 'undefined') + '</pre></div>';
      }
      outputBody.innerHTML = html || '<em class="sandbox-out-empty">(no output)</em>';
    }

    function setVerdict(passed, message, details) {
      verdictEl.hidden = false;
      verdictEl.classList.remove('pass', 'fail');
      verdictEl.classList.add(passed ? 'pass' : 'fail');
      verdictEl.innerHTML = `
        <div class="verdict-icon">${passed ? '✓' : '✗'}</div>
        <div class="verdict-body">
          <div class="verdict-title">${passed ? 'Passed' : 'Not yet'}</div>
          <div class="verdict-message">${escapeHtml(message || '')}</div>
          ${details ? '<div class="verdict-details">' + escapeHtml(details) + '</div>' : ''}
        </div>
      `;
    }

    async function doRun() {
      verdictEl.hidden = true;
      const code = editor.value;
      const result = config.mode === 'anthropic' ? await runAnthropicMode(code) : await runJsMode(code);
      setOutput(result.lines, result.error, result.result);
      return result;
    }

    async function doVerify() {
      const { result, error, lines } = await doRun();
      if (error) {
        setVerdict(false, 'Your code threw before producing a result, see the output above.');
        return;
      }
      let verdict;
      try {
        verdict = await config.test(result, lines);
      } catch (e) {
        setVerdict(false, 'Verifier crashed: ' + e.message);
        return;
      }
      if (!verdict || typeof verdict !== 'object') {
        setVerdict(false, 'Verifier returned nothing usable.');
        return;
      }
      setVerdict(verdict.passed, verdict.message || (verdict.passed ? 'Looks right.' : 'Not quite.'), verdict.details);
      if (verdict.passed) {
        if (window.Progress) window.Progress.markSandbox(id, 'passed');
        sandboxEl.classList.add('passed');
        if (window.Badges) window.Badges.checkUnlocks();
      } else {
        if (window.Progress) window.Progress.markSandbox(id, 'attempted');
      }
    }

    host.querySelector('.sandbox-run-btn').addEventListener('click', doRun);
    host.querySelector('.sandbox-verify-btn').addEventListener('click', doVerify);
    host.querySelector('.sandbox-reset-btn').addEventListener('click', () => {
      editor.value = config.starter || '';
      outputEl.hidden = true;
      outputBody.innerHTML = '';
      verdictEl.hidden = true;
      verdictEl.classList.remove('pass', 'fail');
      verdictEl.innerHTML = '';
      hintPanel.hidden = true;
      hintPanel.innerHTML = '';
      sandboxEl.classList.remove('passed');
      editor.focus();
    });
    if (config.hint) {
      host.querySelector('.sandbox-hint-btn').addEventListener('click', () => {
        hintPanel.hidden = !hintPanel.hidden;
        if (!hintPanel.hidden) hintPanel.innerHTML = '<span class="lbl">hint</span>' + config.hint;
      });
    }

    if (config.mode === 'anthropic') {
      const keyPanel = host.querySelector('.sandbox-key-panel');
      function renderKeyPanel() {
        const k = getKey();
        if (k) {
          keyPanel.innerHTML = `
            <span class="key-label">key:</span>
            <code>${escapeHtml(k.slice(0, 7))}…${escapeHtml(k.slice(-4))}</code>
            <button class="btn ghost btn-tiny" data-act="clear">clear key</button>
          `;
          keyPanel.querySelector('[data-act="clear"]').addEventListener('click', () => {
            if (confirm('Clear the saved Anthropic key?')) {
              clearKey();
              renderKeyPanel();
            }
          });
        } else {
          keyPanel.innerHTML = `
            <span class="key-label">no key saved</span>
            <button class="btn ghost btn-tiny" data-act="set">set key</button>
          `;
          keyPanel.querySelector('[data-act="set"]').addEventListener('click', () => {
            try { ensureKey(); renderKeyPanel(); } catch {}
          });
        }
      }
      renderKeyPanel();
    }

    if (window.Progress) {
      const state = window.Progress.getSandbox(id);
      if (state.status === 'passed') sandboxEl.classList.add('passed');
    }
  }

  function mountRegistered(id) {
    document.querySelectorAll('.sandbox-mount').forEach(host => {
      if (host.dataset.sandboxId !== id) return;
      const config = registry.get(id);
      if (!config) return;
      try {
        mountOne(host, config);
      } catch (err) {
        console.error('[sandbox] mount failed for', id, err);
        host.innerHTML = '<div class="sandbox-error">Failed to mount sandbox ' + escapeHtml(id) + ': ' + escapeHtml(err.message) + '</div>';
      }
    });
  }

  function mountAll() {
    document.querySelectorAll('.sandbox-mount').forEach(host => {
      const id = host.dataset.sandboxId;
      const config = registry.get(id);
      if (!config) {
        host.innerHTML = '<div class="sandbox-error">No config registered for sandbox: ' + escapeHtml(id) + '</div>';
        return;
      }
      try {
        mountOne(host, config);
      } catch (err) {
        console.error('[sandbox] mount failed for', id, err);
        host.innerHTML = '<div class="sandbox-error">Failed to mount sandbox ' + escapeHtml(id) + ': ' + escapeHtml(err.message) + '</div>';
      }
    });
    hasMounted = true;
  }

  const queued = (window.Sandbox && window.Sandbox._queue) ? window.Sandbox._queue.slice() : [];
  window.Sandbox = { register, mountAll, getKey, setKey, clearKey, callClaude };
  queued.forEach(([id, config]) => register(id, config));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
