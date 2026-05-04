import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';

interface ToolEntry {
  name: string;
  description: string;
}

type RewriteFn = (vague: string) => string;
type FormatErrorFn = (err: { kind: string; retryAfter?: number; message?: string }) => unknown;
type SelectTopKFn = (query: string, catalog: ToolEntry[], k: number) => string[];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const HEDGING_RX = /\b(maybe|possibly|might|kinda|sort\s+of|perhaps)\b/i;

const examplePairs = [
  {
    vague: 'Get company info.',
    rewritten:
      'Look up a company by its domain (e.g. acme.com). Returns name, employee size, industry, headquarters. Use this when the user mentions a company name or domain and asks about who they are, what they do, or how big they are. Do not call for individuals, the lookup_person tool covers that.'
  },
  {
    vague: 'Search for stuff.',
    rewritten:
      'Search the open web for a query and return the top 5 results with title, URL, and snippet. Use this only when the user asks a question that requires recent or general web information that is not in your training data. Do not use for company or person research; lookup_company and lookup_person are more reliable.'
  },
  {
    vague: 'Send a message.',
    rewritten:
      'Send a one-off email to a single recipient via the configured outbound mailbox. Use this when the user explicitly requests an email be sent and has provided recipient, subject, and body. Do not call for batch outreach (use enroll_in_sequence) or for internal Slack messages (use post_to_slack).'
  }
];

export function DescriptionRewriter() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Rewrite vague descriptions</p>
      <p className="mb-4 text-sm text-ink-700">
        Same tool, two descriptions. The vague version is what people write first; the rewritten version is what the model needs to pick correctly.
      </p>
      <div className="space-y-4">
        {examplePairs.map((pair, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-clay-peach/40 p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">Vague</p>
              <p className="font-mono text-sm text-ink-900">{pair.vague}</p>
              <p className="mt-3 text-xs text-ink-500">Model has nothing to disambiguate against. Selection becomes a coin flip.</p>
            </div>
            <div className="rounded-xl bg-clay-mint p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">Rewritten</p>
              <p className="font-mono text-sm text-ink-900">{pair.rewritten}</p>
              <p className="mt-3 text-xs text-ink-500">"When to call" + "do not call for" + concrete output shape. Same tool; reliable selection.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolCatalogDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Potter tool catalog (sample)</p>
      <p className="mb-4 text-sm text-ink-700">
        Click a tool name to see its namespace, description shape, and what the schema looks like. Patterns lift directly from Potter's spec.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'pot-research-company',
            label: 'potter_research_company',
            body: 'Namespace: potter_research_*. Description: "Full enrichment for a company by domain or name. Returns size, industry, funding, recent news, key people. Slow but thorough." Schema: { domain: string, name?: string }. Gating: confirm before running because it consumes Proxycurl credits. When NOT to call: for quick lookups, prefer potter_linkedin_company.'
          },
          {
            id: 'pot-research-person',
            label: 'potter_research_person',
            body: 'Namespace: potter_research_*. Description: "Full enrichment for a person by LinkedIn URL or name + company. Returns title, history, recent posts." Schema: { linkedinUrl?: string, name?: string, company?: string }. Gating: confirm. When NOT to call: for batch lookups, use potter_linkedin_company first to gather URLs, then map.'
          },
          {
            id: 'pot-linkedin-company',
            label: 'potter_linkedin_company',
            body: 'Namespace: potter_linkedin_*. Description: "Lightweight LinkedIn company page extraction. Returns name, size, industry, employees count. Cheap and fast." Schema: { url: string }. Gating: auto-approved (read-only). When NOT to call: when you need funding or news, use potter_research_company.'
          },
          {
            id: 'pot-linkedin-posts',
            label: 'potter_linkedin_posts',
            body: 'Namespace: potter_linkedin_*. Description: "Pull recent posts from a LinkedIn profile. Returns last 10 posts with text, date, engagement counts." Schema: { profileUrl: string, limit?: number }. Gating: auto-approved. When NOT to call: for company posts, use potter_linkedin_company instead.'
          },
          {
            id: 'pot-browser-act',
            label: 'potter_browser_act',
            body: 'Namespace: potter_browser_*. Description: "Drive a browser session against a hostile or dynamic site. Takes a screenshot, decides next action, executes via Stagehand. The deliberate exception to no-LLM-inside-MCP." Schema: { url: string, goal: string }. Gating: confirm; expensive and side-effectful. When NOT to call: any time deterministic selectors work, use potter_web_scrape instead.'
          },
          {
            id: 'pot-web-scrape',
            label: 'potter_web_scrape',
            body: 'Namespace: potter_web_*. Description: "Scrape a static page via Firecrawl. Returns clean markdown of the page text. Fast, cheap, no JS rendering." Schema: { url: string }. Gating: auto-approved. When NOT to call: for dynamic pages or anti-bot walls, use potter_browser_act.'
          },
          {
            id: 'pot-web-search',
            label: 'potter_web_search',
            body: 'Namespace: potter_web_*. Description: "Web search returning top 5 results with title, URL, snippet. Uses Firecrawl search tier." Schema: { query: string, limit?: number }. Gating: auto-approved. When NOT to call: when the question is about a specific company or person; the research_* tools are more reliable.'
          },
          {
            id: 'pot-find-decision-maker',
            label: 'potter_find_decision_maker',
            body: 'Namespace: potter_research_*. Description: "Given a company domain and a role title (or seniority pattern), return the most likely decision maker with name, title, LinkedIn URL." Schema: { domain: string, role: string }. Gating: confirm. When NOT to call: for org-wide lookups, use lookup_company plus the hierarchy.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-research-company">potter_research_company</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-research-person">potter_research_person</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-linkedin-company">potter_linkedin_company</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-linkedin-posts">potter_linkedin_posts</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-browser-act">potter_browser_act</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-web-scrape">potter_web_scrape</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-web-search">potter_web_search</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 font-mono text-sm">
            <KeyExplainerKey id="pot-find-decision-maker">potter_find_decision_maker</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function testRewriteDescription(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as RewriteFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return rewriteDescription.' };

  const vague = 'Get info.';
  let rewritten: string;
  try {
    rewritten = fn(vague);
  } catch (error) {
    return { passed: false, message: 'Threw on input.', details: error instanceof Error ? error.message : String(error) };
  }
  if (typeof rewritten !== 'string') {
    return { passed: false, message: 'Return a string.' };
  }
  if (rewritten.length < vague.length + 50) {
    return {
      passed: false,
      message: 'Rewritten description must be at least 50 characters longer than the vague input. The model needs the surface area to disambiguate.',
      details: 'lengths: vague=' + vague.length + ', rewritten=' + rewritten.length
    };
  }
  if (!/\bwhen\b|\bif\b|\buse\s+(this|when|to)\b/i.test(rewritten)) {
    return {
      passed: false,
      message: 'Rewritten description should explain when to call, with phrases like "when", "if", or "use this when/to".',
      details: 'got: ' + JSON.stringify(rewritten)
    };
  }
  if (HEDGING_RX.test(rewritten)) {
    return {
      passed: false,
      message: 'Rewritten description must not contain hedging words (maybe, possibly, might, perhaps). Tool descriptions are prompts; commit.',
      details: 'got: ' + JSON.stringify(rewritten)
    };
  }
  return {
    passed: true,
    message: 'Description is longer, explains when to call, and avoids hedging. Tool selection just got more reliable.'
  };
}

export function testFormatToolError(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as FormatErrorFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return formatToolError.' };

  const cases = [
    {
      err: { kind: 'rate_limited', retryAfter: 30, message: 'API rate limit exceeded' },
      check: (out: Record<string, unknown>) => {
        if (out.is_error !== true) return 'is_error must be true';
        if (out.kind !== 'rate_limited') return 'kind should pass through';
        if (typeof out.message !== 'string') return 'message must be a string';
        if (out.retry_hint !== 'retry-after-30') return 'retry_hint for rate_limited should be "retry-after-N" using err.retryAfter';
        return null;
      }
    },
    {
      err: { kind: 'not_found', message: 'Company acme.com not found' },
      check: (out: Record<string, unknown>) => {
        if (out.is_error !== true) return 'is_error must be true';
        if (out.kind !== 'not_found') return 'kind should pass through';
        if (out.retry_hint !== 'abort') return 'retry_hint for not_found should be "abort"';
        return null;
      }
    },
    {
      err: { kind: 'auth_failed', message: 'Invalid API key' },
      check: (out: Record<string, unknown>) => {
        if (out.retry_hint !== 'abort') return 'retry_hint for auth_failed should be "abort"';
        return null;
      }
    },
    {
      err: { kind: 'network', message: 'connection reset' },
      check: (out: Record<string, unknown>) => {
        if (out.retry_hint !== 'retry') return 'retry_hint for network should be "retry"';
        return null;
      }
    },
    {
      err: { kind: 'validation', message: 'domain field required' },
      check: (out: Record<string, unknown>) => {
        if (out.retry_hint !== 'fix-input') return 'retry_hint for validation should be "fix-input"';
        return null;
      }
    }
  ];

  for (const c of cases) {
    let raw: unknown;
    try {
      raw = fn(c.err);
    } catch (error) {
      return { passed: false, message: 'Threw on ' + JSON.stringify(c.err), details: error instanceof Error ? error.message : String(error) };
    }
    const out = asRecord(raw);
    if (!out) {
      return {
        passed: false,
        message: 'Return an object for kind="' + c.err.kind + '".',
        details: 'got ' + JSON.stringify(raw)
      };
    }
    const fail = c.check(out);
    if (fail) {
      return {
        passed: false,
        message: 'Wrong shape for kind="' + c.err.kind + '": ' + fail,
        details: 'got ' + JSON.stringify(out)
      };
    }
  }

  return {
    passed: true,
    message: 'Structured errors are correct. The agent can pattern-match on retry_hint to decide retry, fix-input, or abort.'
  };
}

export function testToolCatalogSearch(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as SelectTopKFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return selectTopK.' };

  const catalog: ToolEntry[] = [
    { name: 'lookup_company', description: 'Look up a company by domain. Returns size, industry, location.' },
    { name: 'lookup_person', description: 'Look up a person by LinkedIn URL or name and company.' },
    { name: 'send_email', description: 'Send an email to a single recipient via the configured outbound mailbox.' },
    { name: 'search_web', description: 'Search the open web for a query. Returns top results with snippets.' },
    { name: 'create_calendar_event', description: 'Create a Google Calendar event.' },
    { name: 'extract_text_from_pdf', description: 'Extract plain text from a PDF document.' }
  ];

  const cases = [
    { query: 'company lookup', want0: 'lookup_company', why: 'both query words match name and description' },
    { query: 'send email', want0: 'send_email', why: 'both query words match the tool name' },
    { query: 'pdf extract', want0: 'extract_text_from_pdf', why: 'both query words match' },
    { query: 'linkedin person', want0: 'lookup_person', why: 'description mentions LinkedIn; name has person' }
  ];

  for (const c of cases) {
    const out = fn(c.query, catalog, 3);
    if (!Array.isArray(out)) {
      return { passed: false, message: 'selectTopK should return an array.', details: 'got ' + JSON.stringify(out) };
    }
    if (out[0] !== c.want0) {
      return {
        passed: false,
        message: 'Top-1 for query "' + c.query + '" should be "' + c.want0 + '". ' + c.why + '.',
        details: 'got ' + JSON.stringify(out)
      };
    }
    if (out.length > 3) {
      return {
        passed: false,
        message: 'k=3 should cap result length at 3.',
        details: 'got length ' + out.length
      };
    }
  }

  // Empty catalog
  const empty = fn('anything', [], 3);
  if (!Array.isArray(empty) || empty.length !== 0) {
    return {
      passed: false,
      message: 'Empty catalog should return [].',
      details: 'got ' + JSON.stringify(empty)
    };
  }

  return {
    passed: true,
    message: 'Top-K retrieval works on a small catalog. The same shape applied to 50+ tools is what makes a large catalog usable.'
  };
}
