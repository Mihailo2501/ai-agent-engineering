import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickToolFn = (task: { kind: string }) => unknown;

interface SelectorTarget {
  role?: string;
  name?: string;
  id?: string;
  className?: string;
}

interface SelectorPick {
  strategy: 'role-text' | 'css' | 'xpath';
  value: string;
}

type PickSelectorFn = (target: SelectorTarget) => SelectorPick;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function StagehandModeDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Stagehand: act() vs primitives</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each mode to see when it wins, what it costs, and the common pitfalls.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'act',
            label: 'act() · LLM-driven action',
            body: 'You describe what you want in natural language ("click the Sign In button"). Stagehand takes a snapshot of the page, calls a model to choose the right element and action, then executes via Playwright. Wins on novel pages where you do not know the selectors in advance, or pages that change between runs (A/B tests, dynamic class names). Costs a model call per action plus the screenshot tokens. Pitfalls: latency stacks fast on multi-step flows, costs add up, and the model occasionally clicks the wrong element when the page has multiple plausible candidates.'
          },
          {
            id: 'observe',
            label: 'observe() · plan without acting',
            body: 'Returns a list of candidate actions for a given description, without executing. Useful when you want to inspect what the model would do before committing, or to feed candidates into your own selection logic. Lower cost than act() because no Playwright execution; same model call cost.'
          },
          {
            id: 'extract',
            label: 'extract() · structured pull from a page',
            body: 'Pass a Zod schema; Stagehand pulls the matching fields out of the current page using the model. Equivalent in spirit to the "tool use as extraction" pattern from Module 12, but applied to live page content instead of plain text. Wins for scraping product details, pricing, transcripts, or any content you would otherwise script with brittle selectors.'
          },
          {
            id: 'primitives',
            label: 'Playwright primitives · click, fill, goto',
            body: 'Deterministic, stable, no model call per action. Works when you know the selectors and the page structure is consistent. Wins in production for known flows: a login, a checkout step you have run a thousand times, an admin page with stable testids. Pitfalls: selectors break when the page changes; you have to maintain the selector layer over time.'
          },
          {
            id: 'mix',
            label: 'Mixed · primitives + act() fallback',
            body: 'Use primitives by default; fall back to act() when a step fails (selector throws, timeout, captcha appears). Keeps cost and latency low on the happy path, gives the model a chance to recover when something unexpected happens. The pattern most production browser agents converge on.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="act">act() · natural-language action</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="observe">observe() · plan only</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="extract">extract() · structured extraction</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="primitives">Playwright primitives</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900 md:col-span-2">
            <KeyExplainerKey id="mix">Mixed: primitives by default, act() on failure</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function BrowserToolStepperDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Browser tool walkthrough</p>
        <p className="text-sm text-ink-700">
          Trace one user task through the six stages of a browser tool, from harness intent to executed Playwright action.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. User task arrives',
            body: '"Find the price of the latest iPhone on Apple\'s site." The harness routes this to an agent loop that has a high-level browser tool registered (`web_visit_and_extract` or similar).'
          },
          {
            actor: 'model',
            title: '2. Agent picks a high-level tool',
            body: (
              <>
                The agent loop emits a <code>tool_use</code> for <code>web_visit_and_extract</code> with arguments like <code>{`{ url: 'https://apple.com/iphone', extract: 'price' }`}</code>. High-level tool grain (Module 10) keeps the model out of low-level click decisions.
              </>
            )
          },
          {
            actor: 'tool',
            title: '3. Browser tool runtime starts a session',
            body: 'The tool server (running locally or on Browserbase) spins up a browser context. New page, fresh cookies, optional residential proxy. Navigates to the URL. Waits for network idle.'
          },
          {
            actor: 'tool',
            title: '4. Deterministic primitives where possible',
            body: (
              <>
                Tries Playwright primitives first: <code>getByRole('heading', {`{ name: /iPhone/i }`})</code> to anchor, <code>getByText(/from \$/)</code> to find the price. Stable selectors, no model call, deterministic.
              </>
            )
          },
          {
            actor: 'tool',
            title: '5. act() fallback when primitives fail',
            body: 'If selectors throw or the price is rendered in an unexpected layout, fall back to a scoped Stagehand act() / extract() call on the page. One model call, screenshot included if needed. Runtime keeps the model decision inside the tool, not bubbling screenshots out.'
          },
          {
            actor: 'tool',
            title: '6. Structured result back to the agent',
            body: (
              <>
                Tool returns a typed result: <code>{`{ url: '...', price_usd: 799, captured_at: '...' }`}</code>. Agent loop receives a clean <code>tool_result</code> block, no parsing of HTML or screenshots in the harness layer. The agent decides whether to keep going, summarize, or stop.
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testPickToolGrain(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickToolFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickTool.' };

  const cases = [
    { task: { kind: 'buy-product-on-amazon' }, want: 'purchase_product', why: 'High-level intent for buying belongs in a single purchase_product tool' },
    { task: { kind: 'fill-form-with-user-data' }, want: 'fill_form', why: 'Fill-the-form maps to a mid-level fill_form tool' },
    { task: { kind: 'extract-price-from-product-page' }, want: 'extract_price', why: 'Extraction from a known shape is its own high-level tool' },
    { task: { kind: 'click-third-button' }, want: 'click_element_by_index', why: 'Index-based clicks are low-level and only worth exposing when truly needed' },
    { task: { kind: 'search-for-product' }, want: 'search', why: 'Search is a clean high-level intent' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong tool grain for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'extract_main_text') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "extract_main_text", the safest read-only default.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Tool grain routing matches the M10/M13 rule: high-level intentful tools by default, low-level only when the task actually demands it.'
  };
}

export function testPickSelector(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickSelectorFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickSelector.' };

  // Role + text wins
  const roleText = fn({ role: 'button', name: 'Submit' });
  const rt = asRecord(roleText);
  if (!rt || rt.strategy !== 'role-text') {
    return {
      passed: false,
      message: 'Element with role and accessible name should pick "role-text" strategy.',
      details: 'got ' + JSON.stringify(roleText)
    };
  }
  const rtValue = typeof rt.value === 'string' ? rt.value : '';
  if (!/getByRole/.test(rtValue) || !/button/.test(rtValue) || !/Submit/.test(rtValue)) {
    return {
      passed: false,
      message: 'role-text value should contain getByRole, the role, and the name.',
      details: 'got ' + JSON.stringify(rt.value)
    };
  }

  // ID wins css over class fallback
  const cssId = fn({ id: 'login-form' });
  const ci = asRecord(cssId);
  if (!ci || ci.strategy !== 'css' || ci.value !== '#login-form') {
    return {
      passed: false,
      message: 'Element with an id should pick "css" with "#login-form".',
      details: 'got ' + JSON.stringify(cssId)
    };
  }

  // Class-only is css
  const cssClass = fn({ className: 'btn-primary' });
  const cc = asRecord(cssClass);
  if (!cc || cc.strategy !== 'css' || cc.value !== '.btn-primary') {
    return {
      passed: false,
      message: 'Element with only a class should pick "css" with ".btn-primary".',
      details: 'got ' + JSON.stringify(cssClass)
    };
  }

  // Nothing useful: xpath as last resort
  const xp = fn({});
  const x = asRecord(xp);
  if (!x || x.strategy !== 'xpath') {
    return {
      passed: false,
      message: 'When no role/id/class is provided, fall back to "xpath".',
      details: 'got ' + JSON.stringify(xp)
    };
  }
  if (typeof x.value !== 'string' || !x.value.startsWith('//')) {
    return {
      passed: false,
      message: 'xpath value should be a placeholder starting with "//".',
      details: 'got ' + JSON.stringify(x.value)
    };
  }

  return {
    passed: true,
    message: 'Selector strategy follows the Playwright preference order: role+text, then css, then xpath as last resort.'
  };
}
