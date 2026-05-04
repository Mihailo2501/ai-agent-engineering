import type { RunLine, Verdict } from '../lib/sandbox/types';
import Stepper from '../components/stepper';

interface CallEvent {
  kind: string;
  name?: string;
  provider?: string;
  latency_ms: number;
  cost_usd?: number;
}

interface CallSummary {
  harness: string;
  tools: string[];
  providers: string[];
  totalCost: number;
  totalLatency: number;
}

type TraceCallFn = (eventLog: CallEvent[]) => CallSummary;

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

type ValidateToolFn = (def: ToolDefinition) => { ok: boolean; errors: string[] };
type PickRuntimeFn = (useCase: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function ThreeRuntimeDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Three runtimes, one core</p>
      <p className="mb-4 text-sm text-ink-700">
        Same Potter tool functions, three deployment shapes. Pick by how the consumer wants to call it.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">MCP server</p>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">stdio + http</p>
          <p className="mb-3 text-xs text-ink-700">
            Wraps the tool functions in a Model Context Protocol server. Used inside Claude Code, Cursor, n8n, or any MCP-speaking harness. The harness owns the loop; Potter ships the tool surface.
          </p>
          <p className="text-xs text-ink-700"><strong>When to use:</strong> interactive research inside any MCP-aware harness.</p>
        </div>
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">batch-brief runtime</p>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">scheduled background</p>
          <p className="mb-3 text-xs text-ink-700">
            A scheduled host wrapped around the tool functions. Reads a CSV or queue, calls Potter tools per row, produces a markdown brief, posts to Slack or saves to disk. Cron-driven or Inngest-triggered.
          </p>
          <p className="text-xs text-ink-700"><strong>When to use:</strong> nightly enrichment of N rows; weekly reports; any background batch.</p>
        </div>
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">Standalone CLI</p>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">interactive terminal</p>
          <p className="mb-3 text-xs text-ink-700">
            Direct CLI surface over the tool functions. <code>potter research-company --domain acme.com</code> calls the tool and prints the result. Useful for one-off lookups, debugging, and scripting from shells without an MCP harness.
          </p>
          <p className="text-xs text-ink-700"><strong>When to use:</strong> one-off command from a terminal; ad-hoc spot checks.</p>
        </div>
      </div>
    </section>
  );
}

export function EndToEndCallStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">End-to-end research call</p>
        <p className="text-sm text-ink-700">
          One question, eight stages. Trace it from the user's prompt through the harness, the API, the MCP server, the provider, and back.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. User prompts the harness',
            body: '"Tell me about Acme.ai." Typed into Claude Code. The harness has Potter attached via .mcp.json; the tool catalog includes potter_research_company plus other Potter tools.'
          },
          {
            actor: 'model',
            title: '2. Model picks a tool',
            body: 'Claude reads the user prompt, the system prompt, and the tool descriptions. It emits a tool_use block: {"name": "potter_research_company", "input": {"domain": "acme.ai"}}. Stop reason: tool_use.'
          },
          {
            actor: 'tool',
            title: '3. Harness routes to MCP',
            body: 'Claude Code receives the tool_use, looks up potter_research_company in its MCP registry, and dispatches the call to Potter\'s MCP server (running locally as an stdio child process or remotely via http transport).'
          },
          {
            actor: 'tool',
            title: '4. Potter validates input',
            body: 'The MCP SDK validates the input against potter_research_company\'s declared schema. Domain must be a string; must look like a domain. Invalid input: structured error returned without invoking any provider.'
          },
          {
            actor: 'tool',
            title: '5. Potter invokes a provider',
            body: 'Routing logic picks the primary: Proxycurl for company research. HTTP POST to Proxycurl\'s API; fallback to Apify if Proxycurl is rate-limited. Result is normalized to Potter\'s output shape (consistent across providers).'
          },
          {
            actor: 'tool',
            title: '6. Result returned through MCP',
            body: 'Potter returns the structured result through the MCP transport. The harness packages it as a tool_result block and adds it to the messages array.'
          },
          {
            actor: 'model',
            title: '7. Model synthesizes',
            body: 'Claude reads the tool_result, plus everything that came before, and produces the final answer. Stop reason: end_turn. The user sees the response.'
          },
          {
            actor: 'team',
            title: '8. Audit trail completes',
            body: 'Structured events landed throughout: harness routing, MCP dispatch, schema validation, provider call (with redacted args), provider result size, total latency, total cost. Run_id correlates the eight stages into one timeline.'
          }
        ]}
      />
    </div>
  );
}

export function testTraceTheCall(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as TraceCallFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return traceCall.' };

  const log: CallEvent[] = [
    { kind: 'harness.route', name: 'claude-code', latency_ms: 5 },
    { kind: 'tool.call', name: 'potter_research_company', latency_ms: 412, cost_usd: 0 },
    { kind: 'provider.invoke', provider: 'proxycurl', latency_ms: 380, cost_usd: 0.04 },
    { kind: 'tool.call', name: 'potter_research_person', latency_ms: 350, cost_usd: 0 },
    { kind: 'provider.invoke', provider: 'proxycurl', latency_ms: 320, cost_usd: 0.04 },
    { kind: 'model.call', name: 'claude-sonnet-4-6', latency_ms: 800, cost_usd: 0.018 }
  ];

  const summary = asRecord(fn(log));
  if (!summary) return { passed: false, message: 'Return a summary object.' };

  if (summary.harness !== 'claude-code') {
    return {
      passed: false,
      message: 'summary.harness should be the name from the harness.route event.',
      details: JSON.stringify(summary)
    };
  }

  const tools = Array.isArray(summary.tools) ? (summary.tools as string[]) : null;
  if (
    !tools ||
    tools.length !== 2 ||
    !tools.includes('potter_research_company') ||
    !tools.includes('potter_research_person')
  ) {
    return {
      passed: false,
      message: 'summary.tools should contain the two distinct tool names from the log.',
      details: JSON.stringify(summary.tools)
    };
  }

  const providers = Array.isArray(summary.providers) ? (summary.providers as string[]) : null;
  if (!providers || providers.length !== 1 || !providers.includes('proxycurl')) {
    return {
      passed: false,
      message: 'summary.providers should be the unique providers used (just proxycurl here).',
      details: JSON.stringify(summary.providers)
    };
  }

  const expectedCost = 0 + 0.04 + 0 + 0.04 + 0.018;
  if (typeof summary.totalCost !== 'number' || Math.abs((summary.totalCost as number) - expectedCost) > 1e-6) {
    return {
      passed: false,
      message: 'summary.totalCost should be the sum of cost_usd across events.',
      details: 'expected ' + expectedCost + ', got ' + JSON.stringify(summary.totalCost)
    };
  }

  const expectedLatency = log.reduce((s, e) => s + e.latency_ms, 0);
  if (typeof summary.totalLatency !== 'number' || summary.totalLatency !== expectedLatency) {
    return {
      passed: false,
      message: 'summary.totalLatency should sum latency_ms across events.',
      details: 'expected ' + expectedLatency + ', got ' + JSON.stringify(summary.totalLatency)
    };
  }

  return {
    passed: true,
    message: 'Trace summary correctly extracts harness, distinct tools, distinct providers, total cost, and total latency.'
  };
}

export function testDesignATool(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ValidateToolFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return validateToolDefinition.' };

  const good: ToolDefinition = {
    name: 'potter_company_funding',
    description:
      'Fetch recent funding rounds for a company. Use when the user asks about funding history, latest raises, or investor lists. Do not use for general firmographic data; use potter_research_company for that.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        limit: { type: 'number' }
      },
      required: ['domain']
    }
  };
  const okOut = fn(good);
  const ok = asRecord(okOut);
  if (!ok || ok.ok !== true || !Array.isArray(ok.errors) || (ok.errors as unknown[]).length !== 0) {
    return {
      passed: false,
      message: 'Well-formed tool definition should pass with empty errors.',
      details: JSON.stringify(okOut)
    };
  }

  // Missing namespace
  const noNs = fn({
    name: 'company_funding',
    description: good.description,
    inputSchema: good.inputSchema
  });
  const ns = asRecord(noNs);
  if (!ns || ns.ok !== false || !(ns.errors as string[]).some((e) => /namespace|prefix/i.test(e))) {
    return {
      passed: false,
      message: 'Missing potter_ namespace prefix should fail with a namespace/prefix error.',
      details: JSON.stringify(noNs)
    };
  }

  // Description too short
  const short = fn({
    name: 'potter_company_funding',
    description: 'Get funding.',
    inputSchema: good.inputSchema
  });
  const sh = asRecord(short);
  if (!sh || sh.ok !== false || !(sh.errors as string[]).some((e) => /description/i.test(e))) {
    return {
      passed: false,
      message: 'A 2-word description should fail with a description-length error.',
      details: JSON.stringify(short)
    };
  }

  // Missing "when to call" / "do not call" beats
  const noBeats = fn({
    name: 'potter_company_funding',
    description:
      'Fetch recent funding rounds for a given company. Returns an array of round objects with date, amount, and investors.',
    inputSchema: good.inputSchema
  });
  const nb = asRecord(noBeats);
  if (!nb || nb.ok !== false || !(nb.errors as string[]).some((e) => /(when|do not)/i.test(e))) {
    return {
      passed: false,
      message: 'Description without when-to-call or do-not-call beats should fail.',
      details: JSON.stringify(noBeats)
    };
  }

  // Schema with no required fields
  const noReq = fn({
    name: 'potter_company_funding',
    description: good.description,
    inputSchema: { type: 'object', properties: { domain: { type: 'string' } }, required: [] }
  });
  const nr = asRecord(noReq);
  if (!nr || nr.ok !== false || !(nr.errors as string[]).some((e) => /required/i.test(e))) {
    return {
      passed: false,
      message: 'Schema with empty required array should fail; tools should declare what is required.',
      details: JSON.stringify(noReq)
    };
  }

  return {
    passed: true,
    message: 'Validator catches missing namespace, short description, missing when/do-not beats, and missing required fields.'
  };
}

export function testPickRuntime(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickRuntimeFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickPotterRuntime.' };

  const cases = [
    { task: { kind: 'inside-claude-code-interactive' }, want: 'mcp' },
    { task: { kind: 'inside-cursor-interactive' }, want: 'mcp' },
    { task: { kind: 'nightly-enrichment-of-csv' }, want: 'batch-brief' },
    { task: { kind: 'weekly-funding-monitor' }, want: 'batch-brief' },
    { task: { kind: 'one-off-terminal-command' }, want: 'cli' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong runtime for kind "' + c.task.kind + '".',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'mcp') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "mcp", the default for any harness-driven use.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Runtime picker matches: harness-interactive -> mcp; scheduled batch -> batch-brief; one-off terminal -> cli.'
  };
}
