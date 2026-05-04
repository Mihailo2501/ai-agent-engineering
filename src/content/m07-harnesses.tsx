import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';

type PickHarnessFn = (useCase: { kind: string }) => unknown;

interface ApiResponse {
  content: Array<{ type: string; id?: string; name?: string; input?: unknown; text?: string }>;
  stop_reason: string;
}

interface RunAgentArgs {
  messages: Array<Record<string, unknown>>;
  apiCall: (opts: { messages: unknown[] }) => Promise<ApiResponse>;
  runTool: (name: string, input: unknown) => Promise<string>;
  maxIters?: number;
}

type RunAgentFn = (args: RunAgentArgs) => Promise<Array<Record<string, unknown>>>;
type GateToolCallFn = (
  toolName: string,
  askUser: (prompt: string) => Promise<boolean>
) => Promise<boolean>;

const checkRow = 'rounded-xl bg-clay-cream px-4 py-3 text-sm';
const dimensionHeader = 'self-center text-xs uppercase tracking-widest text-ink-700';

export function HarnessMatrixDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Harness comparison matrix</p>
      <p className="mb-4 text-sm text-ink-700">
        Five harnesses, six dimensions. Click a cell to see how each handles that capability.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'cc-files',
            label: 'Claude Code · file system',
            body: 'Native read, edit, write tools tied to your working directory. Permission prompts gate writes by default; reads are auto-approved. Hooks fire on each operation. Settings.json layering controls which paths are writable.'
          },
          {
            id: 'cc-perm',
            label: 'Claude Code · permissions',
            body: 'Per-tool prompts with allowlist memory. /permissions for in-session changes. settings.json permissions block for durable rules. Read-only tools commonly allowlisted; write and network tools gated.'
          },
          {
            id: 'cc-sub',
            label: 'Claude Code · subagents',
            body: 'Spawn scoped agents from the Agent tool. Each subagent has its own context, optional tool subset, and returns one summary back to the parent. Agent definitions live in /.claude/agents.'
          },
          {
            id: 'cc-sched',
            label: 'Claude Code · scheduling',
            body: 'Cron and one-shot routines via the schedule skill. Routines run remote agents on a cadence. Built for "open a cleanup PR in 2 weeks" or "triage every Monday" patterns.'
          },
          {
            id: 'cc-multi',
            label: 'Claude Code · multi-user',
            body: 'Single-user by design. Shared tools come via MCP attachments and shared settings.json in the repo, not via shared sessions. Multi-user collaboration is not the harness pattern.'
          },
          {
            id: 'cc-deploy',
            label: 'Claude Code · deployment',
            body: 'Local CLI on developer machines. No hosted runtime (other than the optional remote routines). The harness is your laptop; the model is over the network.'
          },
          {
            id: 'codex-files',
            label: 'Codex · file system',
            body: 'Similar to Claude Code: read, edit, write tied to a working directory, with review and exec subcommands as alternative invocation shapes.'
          },
          {
            id: 'codex-perm',
            label: 'Codex · permissions',
            body: 'Per-tool gating with configurable allowlists. The exec subcommand has its own approval semantics for shell calls.'
          },
          {
            id: 'codex-sub',
            label: 'Codex · subagents',
            body: 'Subagent-equivalent flows through review and exec subcommands plus plugin-defined helpers. Less standardized than Claude Code subagents in 2026.'
          },
          {
            id: 'codex-sched',
            label: 'Codex · scheduling',
            body: 'No first-class scheduling primitive in the CLI itself. Schedule via cron or your CI runner.'
          },
          {
            id: 'codex-multi',
            label: 'Codex · multi-user',
            body: 'Single-user CLI. Sharing happens via repo-checked configuration and plugins, not shared sessions.'
          },
          {
            id: 'codex-deploy',
            label: 'Codex · deployment',
            body: 'Local CLI. Same shape as Claude Code: developer machine, model over the network.'
          },
          {
            id: 'cursor-files',
            label: 'Cursor · file system',
            body: 'Editor-integrated. Agent operates against the open repo with the editor as the UI surface. File operations naturally tied to editor state.'
          },
          {
            id: 'cursor-perm',
            label: 'Cursor · permissions',
            body: 'Approval prompts inside the editor. Tighter scope to the project than a terminal CLI; agent moves are auditable through editor diffs.'
          },
          {
            id: 'cursor-sub',
            label: 'Cursor · subagents',
            body: 'Background agents and rule files configure scoped behavior. The "agent vs chat" distinction in Cursor maps roughly to "loop with file access vs single-turn."'
          },
          {
            id: 'cursor-sched',
            label: 'Cursor · scheduling',
            body: 'No first-class scheduling. Background agents run during the editor session; scheduling lives outside the harness.'
          },
          {
            id: 'cursor-multi',
            label: 'Cursor · multi-user',
            body: 'Single-developer-per-session. Team conventions live in shared rules files committed to the repo.'
          },
          {
            id: 'cursor-deploy',
            label: 'Cursor · deployment',
            body: 'Editor on the developer machine. Hosted background agent variants exist for longer-running tasks.'
          },
          {
            id: 'n8n-files',
            label: 'n8n · file system',
            body: 'Workflow nodes can read and write files via dedicated nodes. Not the primary use case; n8n shines at orchestrating SaaS APIs and webhooks more than at file editing.'
          },
          {
            id: 'n8n-perm',
            label: 'n8n · permissions',
            body: 'Permissions inside the workflow are open by default. The trust boundary is the workflow itself: who can edit and trigger it.'
          },
          {
            id: 'n8n-sub',
            label: 'n8n · subagents',
            body: 'Sub-workflows and the LangChain Agent node give you the equivalent of subagent spawning, but as workflow nodes rather than scoped sessions.'
          },
          {
            id: 'n8n-sched',
            label: 'n8n · scheduling',
            body: 'First-class. Cron triggers, webhook triggers, polling triggers. Scheduling is a primitive of the platform, not an add-on.'
          },
          {
            id: 'n8n-multi',
            label: 'n8n · multi-user',
            body: 'Built for multi-user. Workflows are versioned and shared across the team; users have roles and permissions on the platform itself.'
          },
          {
            id: 'n8n-deploy',
            label: 'n8n · deployment',
            body: 'Self-host or n8n cloud. Workflows run as scheduled services or on-demand via webhook. The most "deployable" of the harnesses listed here.'
          },
          {
            id: 'custom-files',
            label: 'Custom · file system',
            body: 'You build it. fs in Node, pathlib in Python. Whatever you need, you write the read/write/diff helpers.'
          },
          {
            id: 'custom-perm',
            label: 'Custom · permissions',
            body: 'You build it. Often "no permissions because nobody else uses this" for a personal script; gating you write yourself for anything shared.'
          },
          {
            id: 'custom-sub',
            label: 'Custom · subagents',
            body: 'Trivial: nest the loop. Complex: design context isolation, tool scoping, result merging. Worth the effort only when subagents are core to the product.'
          },
          {
            id: 'custom-sched',
            label: 'Custom · scheduling',
            body: 'Cron, GitHub Actions, AWS EventBridge, or your own scheduler. Whatever you ship, you wire.'
          },
          {
            id: 'custom-multi',
            label: 'Custom · multi-user',
            body: 'You build it from session storage onward. This is months of feature work pretending to be a side project.'
          },
          {
            id: 'custom-deploy',
            label: 'Custom · deployment',
            body: 'Whatever your product ships on. Lambda, Cloudflare Worker, Docker container, embedded in a desktop app. Total control, total burden.'
          }
        ]}
      >
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-2 text-center">
          <div></div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Claude Code</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Codex</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Cursor</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">n8n</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Custom</div>

          <div className={dimensionHeader}>file system</div>
          <div className={checkRow}><KeyExplainerKey id="cc-files">native</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-files">native</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-files">editor</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-files">node-based</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-files">DIY</KeyExplainerKey></div>

          <div className={dimensionHeader}>permissions</div>
          <div className={checkRow}><KeyExplainerKey id="cc-perm">per-tool</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-perm">per-tool</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-perm">editor</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-perm">workflow</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-perm">DIY</KeyExplainerKey></div>

          <div className={dimensionHeader}>subagents</div>
          <div className={checkRow}><KeyExplainerKey id="cc-sub">first-class</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-sub">via subcommand</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-sub">background</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-sub">sub-workflows</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-sub">DIY</KeyExplainerKey></div>

          <div className={dimensionHeader}>scheduling</div>
          <div className={checkRow}><KeyExplainerKey id="cc-sched">routines</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-sched">external</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-sched">external</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-sched">first-class</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-sched">DIY</KeyExplainerKey></div>

          <div className={dimensionHeader}>multi-user</div>
          <div className={checkRow}><KeyExplainerKey id="cc-multi">single</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-multi">single</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-multi">single</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-multi">team</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-multi">DIY</KeyExplainerKey></div>

          <div className={dimensionHeader}>deployment</div>
          <div className={checkRow}><KeyExplainerKey id="cc-deploy">local</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="codex-deploy">local</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="cursor-deploy">local</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="n8n-deploy">hosted</KeyExplainerKey></div>
          <div className={checkRow}><KeyExplainerKey id="custom-deploy">your stack</KeyExplainerKey></div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function HarnessCodeWalkthrough() {
  const lines: Array<{ code: string; note: string }> = [
    { code: "import Anthropic from '@anthropic-ai/sdk';", note: 'SDK import. Layer 1 from Module 06.' },
    { code: "const client = new Anthropic();", note: 'Reads ANTHROPIC_API_KEY from the environment.' },
    { code: 'const tools = [{', note: 'Tool registry. The model picks among these on each turn.' },
    { code: "  name: 'get_weather', description: 'Look up weather for a city.',", note: "Description is the prompt. The model decides via this string." },
    { code: "  input_schema: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] }", note: 'Schema describes arguments. Anthropic SDK uses snake_case input_schema.' },
    { code: '}];', note: '' },
    { code: '', note: '' },
    { code: 'async function runTool(name, input) {', note: 'Tool registry: name to executor. Real harnesses use a Map.' },
    { code: "  if (name === 'get_weather') return `18C in ${input.city}`;", note: 'Real implementations call the actual API or library.' },
    { code: "  throw new Error(`unknown tool: ${name}`);", note: 'Unknown-tool errors should be loud, not silent.' },
    { code: '}', note: '' },
    { code: '', note: '' },
    { code: "const messages = [{ role: 'user', content: 'Weather in Paris?' }];", note: 'The conversation array. Harness owns it; the API does not.' },
    { code: '', note: '' },
    { code: 'while (true) {', note: 'The loop. Five lines of structure; everything else is detail.' },
    { code: "  const resp = await client.messages.create({ model: 'claude-opus-4-7', max_tokens: 1024, tools, messages });", note: 'One forward pass per iteration. Module 02 is what is happening here.' },
    { code: "  messages.push({ role: 'assistant', content: resp.content });", note: "Persist the assistant turn so the next call sees it." },
    { code: "  if (resp.stop_reason === 'end_turn') break;", note: 'stop_reason drives the loop. Module 01 covered this.' },
    { code: "  const toolResults = resp.content", note: 'Filter content for tool_use blocks; build tool_result payloads.' },
    { code: "    .filter(b => b.type === 'tool_use')", note: '' },
    { code: "    .map(async b => ({ type: 'tool_result', tool_use_id: b.id, content: await runTool(b.name, b.input) }));", note: 'Run tools in parallel via map; await all.' },
    { code: "  messages.push({ role: 'user', content: await Promise.all(toolResults) });", note: 'Append the user-role tool_result message and loop.' },
    { code: '}', note: '' }
  ];

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · The 50-line harness, annotated</p>
      <p className="mb-4 text-sm text-ink-700">
        Every harness in existence is a variation on this code. The differences (UI, files, permissions, hooks, subagents) wrap around it; the loop itself is the loop.
      </p>
      <div className="space-y-4">
        <pre className="overflow-x-auto rounded-xl bg-[#1A2530] p-4 font-mono text-xs leading-relaxed text-white">
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block min-h-[1.2em]">
                <span className="mr-3 inline-block w-6 text-right text-white/40">{i + 1}</span>
                {line.code || ' '}
              </span>
            ))}
          </code>
        </pre>
        <ol className="space-y-1 text-xs">
          {lines.map((line, i) =>
            line.note ? (
              <li
                key={i}
                className="flex gap-3 rounded-lg bg-white/60 px-3 py-2"
              >
                <span className="w-6 shrink-0 text-right font-mono text-ink-500">
                  {i + 1}
                </span>
                <span className="text-ink-700">{line.note}</span>
              </li>
            ) : null
          )}
        </ol>
      </div>
    </section>
  );
}

export function testPickHarness(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickHarnessFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickHarness.' };

  const cases = [
    { task: { kind: 'solo-dev-coding-locally' }, want: 'claude-code', why: 'Solo dev iteration is exactly what Claude Code is for' },
    { task: { kind: 'editor-integrated-coding' }, want: 'cursor', why: 'When the editor is the primary surface, Cursor wraps the agent in the editor' },
    { task: { kind: 'openai-aligned-team' }, want: 'codex', why: 'OpenAI shop reaches for Codex first' },
    { task: { kind: 'nightly-multi-system-automation' }, want: 'n8n', why: 'Cron triggers and SaaS connectors are n8n primitives' },
    { task: { kind: 'embedded-in-product' }, want: 'custom', why: 'Embedded in another product cannot bring a general-purpose CLI' },
    { task: { kind: 'one-off-script' }, want: 'custom', why: 'A one-off script that does not need a UI is custom (or a tiny SDK loop)' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong harness for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'mystery' });
  if (fallback !== 'claude-code') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "claude-code", the safe default for code work.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Harness routing matches the trade-offs: code work to Claude Code, editor work to Cursor, OpenAI to Codex, automation to n8n, embedded to custom.'
  };
}

export async function testWriteTheLoop(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  const fn = result as RunAgentFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return runAgent.' };

  // Case 1: end_turn immediately
  {
    const responses: ApiResponse[] = [
      { content: [{ type: 'text', text: 'hi' }], stop_reason: 'end_turn' }
    ];
    let i = 0;
    const apiCall = async () => responses[i++];
    const runTool = async () => 'unused';
    let finalMessages: Array<Record<string, unknown>>;
    try {
      finalMessages = await fn({
        messages: [{ role: 'user', content: 'hi' }],
        apiCall,
        runTool
      });
    } catch (error) {
      return { passed: false, message: 'Threw on simple end_turn case.', details: error instanceof Error ? error.message : String(error) };
    }
    if (!Array.isArray(finalMessages) || finalMessages.length !== 2) {
      return {
        passed: false,
        message: 'After one end_turn response, log should have 2 messages: the original user + assistant.',
        details: 'got length ' + (Array.isArray(finalMessages) ? finalMessages.length : 'not array')
      };
    }
  }

  // Case 2: tool_use then end_turn
  {
    const responses: ApiResponse[] = [
      { content: [{ type: 'tool_use', id: 't1', name: 'get_weather', input: { city: 'Paris' } }], stop_reason: 'tool_use' },
      { content: [{ type: 'text', text: '18C' }], stop_reason: 'end_turn' }
    ];
    let i = 0;
    const apiCall = async () => responses[i++];
    let toolCalls = 0;
    const runTool = async (name: string) => {
      toolCalls++;
      return name === 'get_weather' ? '18C, partly cloudy' : 'unknown';
    };
    let finalMessages: Array<Record<string, unknown>>;
    try {
      finalMessages = await fn({
        messages: [{ role: 'user', content: 'weather' }],
        apiCall,
        runTool
      });
    } catch (error) {
      return { passed: false, message: 'Threw on tool_use case.', details: error instanceof Error ? error.message : String(error) };
    }
    if (toolCalls !== 1) {
      return {
        passed: false,
        message: 'Expected runTool to be called exactly once when tool_use was emitted.',
        details: 'called ' + toolCalls + ' times'
      };
    }
    if (finalMessages.length !== 4) {
      return {
        passed: false,
        message: 'After one tool round trip, log should have 4 messages: user, assistant(tool_use), user(tool_result), assistant(end_turn).',
        details: 'got length ' + finalMessages.length
      };
    }
  }

  // Case 3: iteration cap
  {
    let apiCalls = 0;
    const apiCall = async (): Promise<ApiResponse> => {
      apiCalls++;
      return {
        content: [{ type: 'tool_use', id: 'tx', name: 'get_weather', input: { city: 'Paris' } }],
        stop_reason: 'tool_use'
      };
    };
    const runTool = async () => 'still 18C';
    let finalMessages: Array<Record<string, unknown>>;
    try {
      finalMessages = await fn({
        messages: [{ role: 'user', content: 'forever' }],
        apiCall,
        runTool,
        maxIters: 3
      });
    } catch (error) {
      return { passed: false, message: 'Threw on iteration-cap case.', details: error instanceof Error ? error.message : String(error) };
    }
    void finalMessages;
    if (apiCalls > 3) {
      return {
        passed: false,
        message: 'maxIters cap not respected. With maxIters=3 and unbounded tool_use, apiCall should run at most 3 times.',
        details: 'apiCall count ' + apiCalls
      };
    }
  }

  return {
    passed: true,
    message: 'Loop is correct: terminates on end_turn, runs tools and re-calls on tool_use, respects maxIters cap.'
  };
}

export async function testPermissionPrompt(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  const fn = result as GateToolCallFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return gateToolCall.' };

  let asked = 0;
  const askYes = async () => {
    asked++;
    return true;
  };
  const askNo = async () => {
    asked++;
    return false;
  };

  asked = 0;
  const safe = await fn('search', askYes);
  if (safe !== true) {
    return {
      passed: false,
      message: 'Auto-approved tools (search, list_files, get_file_content) should return true without asking.',
      details: 'got ' + JSON.stringify(safe)
    };
  }
  if (asked !== 0) {
    return {
      passed: false,
      message: 'Auto-approved tools should not call askUser at all.',
      details: 'askUser was called ' + asked + ' times'
    };
  }

  asked = 0;
  const safe2 = await fn('list_files', askYes);
  if (safe2 !== true || asked !== 0) {
    return {
      passed: false,
      message: 'list_files should be auto-approved with no prompt.',
      details: 'returned ' + JSON.stringify(safe2) + ', asks=' + asked
    };
  }

  asked = 0;
  const writeYes = await fn('write_file', askYes);
  if (writeYes !== true || asked !== 1) {
    return {
      passed: false,
      message: 'write_file is gated. Must call askUser exactly once and return its result (true here).',
      details: 'returned ' + JSON.stringify(writeYes) + ', asks=' + asked
    };
  }

  asked = 0;
  const writeNo = await fn('execute_shell', askNo);
  if (writeNo !== false || asked !== 1) {
    return {
      passed: false,
      message: 'Unknown / dangerous tools should call askUser and return its result (false here).',
      details: 'returned ' + JSON.stringify(writeNo) + ', asks=' + asked
    };
  }

  return {
    passed: true,
    message: 'Permission gate correctly auto-approves read-only tools and routes everything else through askUser.'
  };
}
