import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickCodingAgentFn = (task: { kind: string }) => unknown;
type ValidateSpecFn = (spec: unknown) => boolean;

export function CodingAgentMatrixDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Coding agent matrix</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each agent to see how it shows up in your day: interface, edit style, scope, eval signal, deployment fit.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'claude-code',
            label: 'Claude Code',
            body: 'Interface: terminal CLI plus full extension surface (skills, plugins, hooks, slash commands). Edit style: file-aware edits with full repo context. Scope: solo iteration, planning, full-feature work. Eval signal: tests in CI, plus the eval suite you wire up. Deployment fit: a pair-programming environment in your terminal; ships features and full-feature reviews. Module 8 covers the extension surface in depth.'
          },
          {
            id: 'codex',
            label: 'Codex CLI',
            body: 'Interface: CLI with review and exec subcommands plus a plugins ecosystem. Edit style: agent runtime that can read, edit, run, and review. Scope: code review, image-to-code, broad cross-file refactors. Eval signal: tests plus reviewer feedback. Deployment fit: code-review automation, second-opinion passes, image-driven UI scaffolding.'
          },
          {
            id: 'cursor',
            label: 'Cursor',
            body: 'Interface: editor (VS Code fork) with built-in agent mode, rules files, and chat. Edit style: in-editor pair-programming with inline suggestions and full agent runs. Scope: real-time iteration in the editor; per-project rules customize behavior. Eval signal: the developer reviewing diffs as they appear. Deployment fit: the daily IDE for developers who want a tightly-integrated agent experience.'
          },
          {
            id: 'aider',
            label: 'Aider',
            body: 'Interface: terminal-driven REPL. Edit style: strict diff-based edits applied atomically. Scope: quick repo-aware edits with low friction; minimal UX overhead. Eval signal: tests in CI plus visual diff inspection. Deployment fit: minimal-friction quick edits, especially for terminal-heavy workflows; popular with users who want a CLI-native experience without Claude Code\'s extension surface.'
          },
          {
            id: 'devin',
            label: 'Devin and the autonomous-engineer lineage',
            body: 'Interface: hosted UI; the agent runs largely autonomously and reports back. Edit style: long-running agent that opens its own pull requests. Scope: well-specified medium-sized tasks. Eval signal: the PR review and the SWE-bench-style task completion. Deployment fit: queueing work for autonomous completion; the engineer reviews the diff at the end. Newer entrants in the autonomous-PR lineage have similar shapes.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="claude-code">Claude Code</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="codex">Codex CLI</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="cursor">Cursor</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="aider">Aider</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900 md:col-span-2">
            <KeyExplainerKey id="devin">Devin and the autonomous-engineer lineage</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function SpecDrivenStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Spec-driven coding workflow</p>
        <p className="text-sm text-ink-700">
          Six stages from "what do I want to build" to "the agent ships it and you reviewed the diff".
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. Write the spec',
            body: 'Goal in one sentence. In-scope and out-of-scope as bullet lists. Acceptance criteria as a checklist. The spec lives next to the code (often in a docs/ or specs/ folder) and is the single source of truth for what success means.'
          },
          {
            actor: 'model',
            title: '2. Agent generates a plan',
            body: 'You hand the spec to the agent and ask for a plan: which files to touch, which functions to add or modify, which tests to write. The plan is text or structured output; you read it before any code is written.'
          },
          {
            actor: 'user',
            title: '3. Plan review',
            body: 'You review the plan. Catch wrong assumptions, missing edge cases, or scope drift. Iterate on the plan until it matches the spec; this is much cheaper than catching the same problems after the agent has written code.'
          },
          {
            actor: 'model',
            title: '4. Agent implements',
            body: 'The agent edits files according to the plan. Tests where the spec required them; production code with the right error handling. The agent should not invent additional features the plan did not include.'
          },
          {
            actor: 'tool',
            title: '5. Tests run',
            body: 'The test suite runs (the agent triggers it). Failures point the agent to specific fixes. Iterate until the test suite is green plus your spec-derived acceptance criteria pass.'
          },
          {
            actor: 'user',
            title: '6. Human review',
            body: 'You review the diff. The agent\'s claim is "I implemented the spec"; your job is to verify. Reading the diff is much faster than reading code from scratch because the spec told you what to expect. Approve, request changes, or send back to the planning stage.'
          }
        ]}
      />
    </div>
  );
}

export function testPickCodingAgent(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickCodingAgentFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickCodingAgent.' };

  const cases = [
    { task: { kind: 'solo-terminal-iteration' }, want: 'claude-code' },
    { task: { kind: 'broad-pr-review' }, want: 'codex' },
    { task: { kind: 'in-editor-pair' }, want: 'cursor' },
    { task: { kind: 'quick-diff-edit' }, want: 'aider' },
    { task: { kind: 'long-autonomous-pr' }, want: 'devin' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong agent for kind "' + c.task.kind + '".',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'claude-code') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "claude-code", the most general default for terminal-driven coding work.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Coding agent routing matches the rule: solo terminal -> Claude Code; broad review -> Codex; in-editor pair -> Cursor; quick diff -> Aider; long autonomous PR -> Devin.'
  };
}

function isStringList(value: unknown): boolean {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function testValidateSpec(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ValidateSpecFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return validateSpec.' };

  // Valid spec
  const valid = {
    goal: 'Add a sign-in form',
    in_scope: ['email', 'password'],
    out_of_scope: ['oauth'],
    acceptance_criteria: ['fields render', 'submit calls API', 'errors render below the form']
  };
  if (fn(valid) !== true) {
    return { passed: false, message: 'A complete valid spec should return true.' };
  }

  // Missing goal
  if (fn({ in_scope: [], out_of_scope: [], acceptance_criteria: ['a', 'b', 'c'] }) !== false) {
    return { passed: false, message: 'Missing goal should fail.' };
  }

  // Missing in_scope
  if (fn({ goal: 'g', out_of_scope: [], acceptance_criteria: ['a', 'b', 'c'] }) !== false) {
    return { passed: false, message: 'Missing in_scope should fail.' };
  }

  // Too few acceptance criteria
  if (fn({ goal: 'g', in_scope: [], out_of_scope: [], acceptance_criteria: ['a', 'b'] }) !== false) {
    return { passed: false, message: 'Fewer than 3 acceptance criteria should fail.' };
  }

  // Acceptance criteria not array
  if (fn({ goal: 'g', in_scope: [], out_of_scope: [], acceptance_criteria: 'three things' }) !== false) {
    return { passed: false, message: 'acceptance_criteria must be an array.' };
  }

  // null spec
  if (fn(null) !== false) {
    return { passed: false, message: 'null spec should fail.' };
  }

  return {
    passed: true,
    message: 'Spec validator catches missing fields, non-array acceptance criteria, and the minimum-3-criteria rule.'
  };
}

void isStringList;
