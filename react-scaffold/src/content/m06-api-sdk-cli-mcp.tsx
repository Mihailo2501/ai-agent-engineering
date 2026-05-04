import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickLayerFn = (useCase: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function LayerStackDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-4 font-heading text-lg text-ink-900">Demo · The four-layer stack</p>
      <KeyExplainer
        entries={[
          {
            id: 'mcp',
            label: 'Layer 3: MCP',
            body: 'Model Context Protocol. A wire format for exposing tools to any LLM harness that speaks it. Sits beside the harness layer rather than above it: the harness uses MCP to get its tools. Why pick: you want tools reusable across Claude Code, Cursor, your own CLI, with one implementation. Cost: protocol overhead, fewer assumptions about transport.'
          },
          {
            id: 'cli',
            label: 'Layer 2: CLI / harness',
            body: 'A program (Claude Code, Codex, Cursor, your own) that wraps the SDK with a UI, file system access, permission model, subagents, and lifecycle hooks. Why pick: developer ergonomics, day-to-day iteration, productivity wins. Cost: harness lock-in: the conventions, settings layout, and extension surface differ across CLIs.'
          },
          {
            id: 'sdk',
            label: 'Layer 1: SDK',
            body: 'Typed library wrapping the HTTP API in your language (Anthropic SDK in TS or Python). Adds retry logic, streaming helpers, type safety, error hierarchies. Why pick: you are running an agent loop inside a service or script. Cost: SDK pinned to a major version, occasional API drift between SDK release and underlying API change.'
          },
          {
            id: 'http',
            label: 'Layer 0: HTTP API',
            body: 'A single endpoint at /v1/messages. JSON in, JSON out. Stateless. The layer everything else sits on. Why pick: zero dependencies, batch jobs, cross-language scripting, debugging what the SDK actually sent. Cost: you reinvent retry, streaming, error parsing, type safety.'
          }
        ]}
      >
        <div className="flex flex-col gap-2 rounded-xl bg-white/40 p-4">
          <div className="rounded-lg bg-clay-peach px-4 py-3 text-center font-mono text-sm">
            <KeyExplainerKey id="mcp">Layer 3 · MCP (Model Context Protocol)</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-center font-mono text-sm">
            <KeyExplainerKey id="cli">Layer 2 · CLI / harness (Claude Code, Codex, Cursor)</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-mint px-4 py-3 text-center font-mono text-sm">
            <KeyExplainerKey id="sdk">Layer 1 · SDK (Anthropic SDK in TS / Python)</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-sky px-4 py-3 text-center font-mono text-sm">
            <KeyExplainerKey id="http">Layer 0 · HTTP API (POST /v1/messages)</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function McpWalkthroughDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">MCP request walkthrough</p>
        <p className="text-sm text-ink-700">
          Claude Code session attaches a Potter MCP server. A user asks "Brief me on acme.com." Trace the request from harness to MCP server and back.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'harness',
            title: '1. initialize',
            body: (
              <>
                Claude Code spawns the Potter MCP process and sends an <code>initialize</code> notification with its capabilities. The server responds with its own capabilities, server info, and the protocol version it speaks.
              </>
            )
          },
          {
            actor: 'harness',
            title: '2. tools/list',
            body: (
              <>
                Harness asks the server to enumerate available tools. Server returns the catalog: name, description, inputSchema for each. Claude Code merges these into its tool registry alongside built-ins.
              </>
            )
          },
          {
            actor: 'user',
            title: '3. user prompt',
            body: 'User types "Brief me on acme.com." The harness adds the prompt to messages and calls the API.'
          },
          {
            actor: 'model',
            title: '4. model emits tool_use',
            body: (
              <>
                Model returns <code>{'{ type: "tool_use", name: "potter_research_company", input: { domain: "acme.com" } }'}</code>. <code>stop_reason</code> is <code>tool_use</code>.
              </>
            )
          },
          {
            actor: 'harness',
            title: '5. tools/call',
            body: (
              <>
                Harness routes the tool_use to the MCP server with a <code>tools/call</code> request: name and arguments. Local subprocess; latency in single-digit ms.
              </>
            )
          },
          {
            actor: 'tool',
            title: '6. server executes',
            body: 'Potter MCP server hits Proxycurl, parses the response, builds a structured company brief object.'
          },
          {
            actor: 'harness',
            title: '7. tool_result back',
            body: (
              <>
                Server returns the result via MCP. Harness wraps it in a <code>tool_result</code> content block on a user-role message and calls the API again.
              </>
            )
          },
          {
            actor: 'model',
            title: '8. final answer',
            body: (
              <>
                Model uses the tool_result to write the briefing. <code>stop_reason</code> is <code>end_turn</code>. Harness renders to the user.
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testPickLayer(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickLayerFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickLayer.' };

  const cases = [
    { task: { kind: 'nightly-batch-job' }, want: 'api', why: 'Batch jobs run far from a UI. Raw HTTP keeps dependencies minimal' },
    { task: { kind: 'in-process-agent-loop' }, want: 'sdk', why: 'In-process agents want type-safe streaming and retry without rebuilding it' },
    { task: { kind: 'developer-iterating-locally' }, want: 'cli', why: 'Iteration on code wants the harness, file system, and permission UX' },
    { task: { kind: 'expose-tools-to-many-harnesses' }, want: 'mcp', why: 'Tool reuse across harnesses is exactly what MCP exists for' },
    { task: { kind: 'team-shared-research-toolkit' }, want: 'mcp', why: 'Sharing tools across team and multiple harnesses lands at MCP' },
    { task: { kind: 'quick-personal-script' }, want: 'sdk', why: 'Scripts default to the SDK, not raw HTTP, unless you specifically want zero deps' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong layer for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'sdk') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "sdk", the safest default for new code.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Layer routing matches the trade-off: API for headless, SDK for in-process, CLI for dev work, MCP for shared tools.'
  };
}

export function testMcpToolDef(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const tool = asRecord(result);
  if (!tool) return { passed: false, message: 'Return a tool definition object.' };

  if (tool.name !== 'lookup_company') {
    return {
      passed: false,
      message: 'name must be exactly "lookup_company".',
      details: 'got ' + JSON.stringify(tool.name)
    };
  }
  if (typeof tool.description !== 'string' || tool.description.length < 30) {
    return {
      passed: false,
      message: 'description must be a string of at least 30 characters explaining when to call.',
      details: 'got ' + JSON.stringify(tool.description)
    };
  }
  if ('input_schema' in tool && !('inputSchema' in tool)) {
    return {
      passed: false,
      message: 'MCP uses camelCase: the field is inputSchema, not input_schema. (Anthropic SDK uses snake_case input_schema; that is a different layer.)',
      details: 'keys: ' + Object.keys(tool).join(', ')
    };
  }
  const schema = asRecord(tool.inputSchema);
  if (!schema) {
    return { passed: false, message: 'inputSchema must be an object.' };
  }
  if (schema.type !== 'object') {
    return {
      passed: false,
      message: 'inputSchema.type must be "object".',
      details: 'got ' + JSON.stringify(schema.type)
    };
  }
  const properties = asRecord(schema.properties);
  if (!properties) return { passed: false, message: 'inputSchema.properties must be an object.' };
  const domain = asRecord(properties.domain);
  if (!domain) {
    return {
      passed: false,
      message: 'properties.domain must be an object describing the domain argument.'
    };
  }
  if (domain.type !== 'string') {
    return {
      passed: false,
      message: 'properties.domain.type must be "string".',
      details: 'got ' + JSON.stringify(domain.type)
    };
  }
  if (typeof domain.description !== 'string' || domain.description.length < 5) {
    return {
      passed: false,
      message: 'properties.domain.description should be at least 5 characters; the model uses it to fill the argument.'
    };
  }
  if (!Array.isArray(schema.required) || !schema.required.includes('domain')) {
    return {
      passed: false,
      message: 'inputSchema.required must include "domain".',
      details: 'got ' + JSON.stringify(schema.required)
    };
  }
  return {
    passed: true,
    message: 'MCP tool definition shape is correct. Same JSON Schema as the Anthropic tools field, but camelCase inputSchema instead of snake_case input_schema.'
  };
}

export function testShapeTheApi(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const block = asRecord(result);
  if (!block) {
    return {
      passed: false,
      message: 'Return the tool_use content block from the response.',
      details: 'got ' + JSON.stringify(result)
    };
  }
  if (block.type !== 'tool_use') {
    return {
      passed: false,
      message: 'The returned block should have type === "tool_use".',
      details: 'got type ' + JSON.stringify(block.type)
    };
  }
  if (block.name !== 'get_weather') {
    return {
      passed: false,
      message: 'Tool name should be "get_weather". Did you define the tool correctly and force tool_choice?',
      details: 'got name ' + JSON.stringify(block.name)
    };
  }
  const input = asRecord(block.input);
  const cityValue = input ? input.city : undefined;
  const city = typeof cityValue === 'string' ? cityValue.toLowerCase() : '';
  if (!city.includes('paris')) {
    return {
      passed: false,
      message: 'input.city should contain "Paris".',
      details: 'got input ' + JSON.stringify(block.input)
    };
  }
  return {
    passed: true,
    message: 'Layer 0 round trip worked: tools field set, model decided to call get_weather, you pulled the tool_use block out of content.'
  };
}
