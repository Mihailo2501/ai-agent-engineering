import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickExtensionShapeFn = (need: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

export function ExtensionSurfacePicker() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Pick the right extension shape</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each extension type to see what triggers it, how to configure it, and when to reach for it.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'hook',
            label: 'Hook',
            body: 'Shell command Claude Code runs at a lifecycle event (UserPromptSubmit, PreToolUse, PostToolUse, Stop, etc). Configured in settings.json under "hooks" with matchers and commands. Use when a rule must run unconditionally on every event: enforce a lint, log every prompt, deny a tool by name. Hooks are deterministic; they fire whether the model wants them to or not.'
          },
          {
            id: 'skill',
            label: 'Skill',
            body: 'A markdown file with frontmatter (name, description) plus a body. The model invokes a skill when its description matches the user\'s intent. Lives in /.claude/skills or globally in ~/.claude/skills. Use when you want a prompt-templated capability the model decides to use, like "review the staging branch" or "summarize this PR." Discretionary; the model picks.'
          },
          {
            id: 'slash',
            label: 'Slash command',
            body: 'A file in /.claude/commands that expands to a templated prompt when the user types /<name>. Use when you want a user-typed shortcut to a templated prompt: /review, /test, /deploy. Distinct from a skill in that the user invokes it explicitly; the model does not pick.'
          },
          {
            id: 'subagent',
            label: 'Subagent',
            body: 'A scoped child agent with its own context, optional tool subset, and system prompt. Defined in /.claude/agents. Use for long-running, well-scoped tasks that should not pollute the parent\'s context: deep research, complex refactors, exhaustive search. Costs an extra API round trip; pays for itself when the parent\'s context budget would otherwise blow up.'
          },
          {
            id: 'plugin',
            label: 'Plugin',
            body: 'A bundle of skills, slash commands, hooks, and agent definitions distributed as a directory with marketplace.json. Install via /plugin add. Use when you want to share a coherent extension package across projects or with collaborators. Plugins are about distribution: if you have one project of skills, just commit them; if you have a reusable set, package as a plugin.'
          },
          {
            id: 'mcp',
            label: 'MCP server',
            body: 'A separate process exposing tools via the Model Context Protocol. Configured in .mcp.json per project. Use when you want tools reachable from any MCP-speaking harness, not just Claude Code: Potter, hosted databases, vendor-provided MCPs. Module 06 was the deep dive; this is its appearance in the Claude Code surface.'
          }
        ]}
      >
        <div className="grid gap-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="hook">Hook · settings.json command, runs on lifecycle event</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="skill">Skill · markdown file, model decides when to invoke</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="slash">Slash command · user-typed shortcut, expands to a prompt</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="subagent">Subagent · scoped child agent with own context</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="plugin">Plugin · bundle of all of the above, distributable</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="mcp">MCP server · separate process, portable across harnesses</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function HookLifecycleStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Hook lifecycle walkthrough</p>
        <p className="text-sm text-ink-700">
          Trace one tool-using turn through Claude Code with hooks attached at three lifecycle points.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. User submits a prompt',
            body: '"Edit src/api.ts to add request retries."'
          },
          {
            actor: 'harness',
            title: '2. UserPromptSubmit hook fires',
            body: (
              <>
                The configured shell command runs with the prompt as input. Common uses: log the prompt to an audit file, gate or transform the prompt before it goes to the model, refuse based on a denylist.
              </>
            )
          },
          {
            actor: 'model',
            title: '3. Model receives the prompt',
            body: 'After hooks finish, the prompt (potentially mutated) goes to the API. Model returns a tool_use block requesting Edit on src/api.ts.'
          },
          {
            actor: 'harness',
            title: '4. PreToolUse hook fires',
            body: (
              <>
                Configured shell command runs with the tool name and input as JSON. Can deny the call ("no edits to api.ts during freeze"), mutate the input, or log. Returning a non-zero exit code blocks the tool.
              </>
            )
          },
          {
            actor: 'tool',
            title: '5. Tool executes',
            body: 'If PreToolUse approved, Claude Code runs Edit with the model-supplied arguments. The file changes; the diff lands.'
          },
          {
            actor: 'harness',
            title: '6. PostToolUse hook fires',
            body: (
              <>
                Configured shell command runs with the tool result. Common uses: auto-format the edited file, run <code>npm test</code> to catch regressions, log the change to git, sync to a watcher.
              </>
            )
          },
          {
            actor: 'model',
            title: '7. Model continues',
            body: 'Tool result goes back into the messages array. Model decides whether to call another tool or end the turn. Loop continues.'
          },
          {
            actor: 'harness',
            title: '8. Stop hook fires (when model emits end_turn)',
            body: 'Final lifecycle event when the loop exits. Common uses: notify a Slack channel, save session summary, run a final smoke test.'
          }
        ]}
      />
    </div>
  );
}

export function testHookConfig(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const root = asRecord(result);
  if (!root) return { passed: false, message: 'Return the hooks configuration object.' };

  // Accept either { hooks: { ... } } (full settings.json snippet) or the hooks block directly.
  const innerHooks = asRecord(root.hooks);
  const hooks: Record<string, unknown> = innerHooks ?? root;

  const postArr = asArray(hooks.PostToolUse);
  if (!postArr || postArr.length === 0) {
    return { passed: false, message: 'PostToolUse must be present and non-empty.' };
  }
  const postEntry = asRecord(postArr[0]);
  if (!postEntry) return { passed: false, message: 'PostToolUse[0] must be an object with matcher and hooks.' };
  if (postEntry.matcher !== 'Edit|Write') {
    return {
      passed: false,
      message: 'PostToolUse[0].matcher must be exactly "Edit|Write".',
      details: 'got ' + JSON.stringify(postEntry.matcher)
    };
  }
  const postHooks = asArray(postEntry.hooks);
  if (!postHooks || postHooks.length === 0) {
    return { passed: false, message: 'PostToolUse[0].hooks must be a non-empty array.' };
  }
  const postHook = asRecord(postHooks[0]);
  if (!postHook || postHook.type !== 'command') {
    return { passed: false, message: 'PostToolUse hook must have type === "command".' };
  }
  if (typeof postHook.command !== 'string' || !/npm\s+test/.test(postHook.command)) {
    return {
      passed: false,
      message: 'PostToolUse hook command should run "npm test".',
      details: 'got ' + JSON.stringify(postHook.command)
    };
  }

  const submitArr = asArray(hooks.UserPromptSubmit);
  if (!submitArr || submitArr.length === 0) {
    return { passed: false, message: 'UserPromptSubmit must be present and non-empty.' };
  }
  const submitEntry = asRecord(submitArr[0]);
  const submitHooks = submitEntry ? asArray(submitEntry.hooks) : null;
  const submitHook = submitHooks && submitHooks.length > 0 ? asRecord(submitHooks[0]) : null;
  if (!submitHook || submitHook.type !== 'command' || typeof submitHook.command !== 'string') {
    return {
      passed: false,
      message: 'UserPromptSubmit hook must have a hooks[0] entry with type "command" and a command string.'
    };
  }
  if (!/>>|>|tee|append|log/.test(submitHook.command.toLowerCase())) {
    return {
      passed: false,
      message: 'UserPromptSubmit command should write to a log file (use >>, >, tee, or similar).',
      details: 'got ' + JSON.stringify(submitHook.command)
    };
  }

  return {
    passed: true,
    message: 'Hooks configuration is correct: PostToolUse runs npm test on edits, UserPromptSubmit logs every prompt.'
  };
}

export function testPickExtensionShape(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickExtensionShapeFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pick.' };

  const cases = [
    { task: { kind: 'enforce-rule-on-every-tool-call' }, want: 'hook', why: 'Unconditional rule on every tool call is a hook' },
    { task: { kind: 'prompt-templated-capability-model-invokes' }, want: 'skill', why: 'Model-invoked prompt template is a skill' },
    { task: { kind: 'user-typed-shortcut-to-prompt' }, want: 'slash', why: 'User-typed shortcut is a slash command' },
    { task: { kind: 'long-running-scoped-task' }, want: 'subagent', why: 'Scoped task with its own context is a subagent' },
    { task: { kind: 'bundle-skills-and-hooks-for-distribution' }, want: 'plugin', why: 'A reusable bundle for distribution is a plugin' },
    { task: { kind: 'tool-callable-from-many-harnesses' }, want: 'mcp', why: 'Cross-harness tool is MCP' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong extension for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'skill') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "skill", the lowest-friction extension that the model can opt into when relevant.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Extension routing is correct. Hooks for unconditional rules, skills for model-invoked, slash for user-invoked, subagents for scope, plugins for distribution, MCP for portability.'
  };
}

export function testSkillFrontmatter(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const obj = asRecord(result);
  if (!obj) return { passed: false, message: 'Return the skill frontmatter object.' };

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    return { passed: false, message: 'name is required and must be a string.' };
  }
  const name = obj.name.toLowerCase();
  if (!name.includes('git') || !name.includes('review')) {
    return {
      passed: false,
      message: 'name should clearly identify the skill. Include "git" and "review" so the model and the user can both find it.',
      details: 'got name ' + JSON.stringify(obj.name)
    };
  }

  if (typeof obj.description !== 'string' || obj.description.length < 40) {
    return {
      passed: false,
      message: 'description must be a string of at least 40 characters; the model reads it to decide when to invoke.',
      details: 'got ' + JSON.stringify(obj.description)
    };
  }
  const desc = obj.description.toLowerCase();
  const hasReview = /review/.test(desc);
  const hasUncommitted = /uncommitted|unstaged|staged|changes|diff|working/.test(desc);
  if (!hasReview || !hasUncommitted) {
    return {
      passed: false,
      message:
        'description should mention "review" and reference uncommitted/staged changes (or working tree). The model picks skills by description match.',
      details: 'got ' + JSON.stringify(obj.description)
    };
  }

  return {
    passed: true,
    message: 'Skill frontmatter is well-formed. Name identifies the action; description is rich enough to win when the user asks Claude to review changes.'
  };
}
