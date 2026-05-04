import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

type EvalToolFn = (expected: ToolCall[], actual: ToolCall[]) => number;
type PickEvalFn = (task: { kind: string }) => unknown;

export function EvalPyramidDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · The eval pyramid</p>
      <p className="mb-4 text-sm text-ink-700">
        Click a layer to see what it scores, where it lives, and what it costs.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'unit',
            label: 'Unit · tool implementations',
            body: 'What it scores: each tool function in isolation. Does fetch_company_info return the right shape? Does compose_brief handle empty input? Where it lives: the same place your code lives, run on every CI build. Cost: cheap, fast, deterministic. Pitfall: passing unit tests for a broken agent loop because the tools are correct in isolation but wired together wrong.'
          },
          {
            id: 'behavioral',
            label: 'Behavioral · agent flows under test',
            body: 'What it scores: the agent loop end-to-end on representative inputs. Did it pick the right tool? Were the args sane? Did it recover from errors? Did stop_reason match expectation? Where it lives: a separate test suite invoking your agent against fixtures with mocked or real tools. Cost: a model call per case, more tokens, slower CI. Pitfall: dataset overfit. Add cases continuously from production traces.'
          },
          {
            id: 'golden',
            label: 'Golden · open-ended quality',
            body: 'What it scores: response quality on the canonical inputs you have curated. LLM-as-judge against a rubric, sometimes with a small human-labeled subset for calibration. Where it lives: a versioned golden dataset in your repo or eval platform. Cost: judge calls plus baseline tracking. Pitfall: judge bias (judge agreement with humans drifts) and golden staleness (production has moved on).'
          },
          {
            id: 'redteam',
            label: 'Red-team · adversarial inputs',
            body: 'What it scores: behavior on hostile inputs. Prompt injection from data, jailbreak attempts, edge cases the happy path never sees. Where it lives: a dedicated red-team dataset that grows from incident postmortems. Cost: focused but ongoing investment. Pitfall: false sense of safety from a small dataset; real attackers always discover new shapes.'
          },
          {
            id: 'prod',
            label: 'Production sampling · ongoing',
            body: 'What it scores: live traffic, sampled. A percentage of real requests run through the judge prompt; drift triggers alerts. Where it lives: in your observability stack, alongside dashboards. Cost: continuous low-volume judge calls plus alert plumbing. Pitfall: ignoring tail behaviors because the average looks fine.'
          }
        ]}
      >
        <div className="grid gap-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="prod">Production sampling · top of the pyramid</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="redteam">Red-team · adversarial</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="golden">Golden · open-ended quality</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="behavioral">Behavioral · agent flows</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="unit">Unit · tool implementations</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function JudgeWalkthroughDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Building an LLM judge</p>
        <p className="text-sm text-ink-700">
          Six stages from "what should the judge measure" to "production sampling with drift alarms".
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'team',
            title: '1. Define the rubric',
            body: 'What does "good" look like? Write a 3 to 5-item scoring rubric in plain English. For an answer-quality judge: factual correctness, addresses the question, no fabrication, appropriate length. Each item gets a 1 to 5 scale or a binary pass/fail.'
          },
          {
            actor: 'team',
            title: '2. Write the judge prompt',
            body: 'Structure: system prompt with the rubric, user message containing the question and the candidate response, ask for a score plus a short rationale. Force tool use (Module 12 territory) for a clean parseable output. Avoid free-text scoring; the parser will hate you.'
          },
          {
            actor: 'team',
            title: '3. Calibrate against humans',
            body: 'Sample 50 to 200 cases. Have humans score them on the same rubric. Run the judge on the same cases. Compute agreement (Cohen\'s kappa or simpler "% within 1 point"). If agreement is low, the rubric is ambiguous or the judge is biased; iterate on the prompt.'
          },
          {
            actor: 'tool',
            title: '4. Run on the golden set',
            body: 'Pass every golden-dataset case through the agent and the judge. Aggregate scores by case and by rubric item. Set a baseline: "median score is 4.2; tail at 1 to 2 is 8% of cases". Future runs are compared against this baseline.'
          },
          {
            actor: 'team',
            title: '5. Use as regression test',
            body: 'On each agent change (prompt edit, model swap, tool change), re-run the judge over the golden set. If aggregate scores drop or a previously-good case now fails, hold the change. Treat the judge run like you would treat unit tests on a code change.'
          },
          {
            actor: 'team',
            title: '6. Production sampling and drift alarms',
            body: 'Sample a percentage of real traffic, run the judge, write the score to your observability stack. Alert on rolling-window drift: if scores drop more than X% over the last 1000 samples, page someone. The judge is now the production quality monitor.'
          }
        ]}
      />
    </div>
  );
}

export function testEvalToolSelection(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as EvalToolFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return evalToolSelection.' };

  const expected: ToolCall[] = [
    { name: 'research_company', args: { domain: 'acme.com' } },
    { name: 'find_decision_maker', args: { role: 'CTO' } }
  ];

  // Perfect match: 2 names + 2 args = 3 / 3 = 1.0
  const perfect = fn(expected, [
    { name: 'research_company', args: { domain: 'acme.com' } },
    { name: 'find_decision_maker', args: { role: 'CTO' } }
  ]);
  if (typeof perfect !== 'number' || Math.abs(perfect - 1) > 1e-6) {
    return {
      passed: false,
      message: 'Perfect match should score 1.0.',
      details: 'got ' + JSON.stringify(perfect)
    };
  }

  // Names match, args wrong: 2*1 + 0 = 2; max = 2*1 + 2*0.5 = 3 -> 2/3
  const partial = fn(expected, [
    { name: 'research_company', args: { domain: 'wrong.com' } },
    { name: 'find_decision_maker', args: { role: 'CEO' } }
  ]);
  if (typeof partial !== 'number' || Math.abs(partial - 2 / 3) > 1e-6) {
    return {
      passed: false,
      message: 'Names right, args wrong should score 2/3.',
      details: 'got ' + JSON.stringify(partial)
    };
  }

  // Wrong names: 0 / 3 = 0
  const wrong = fn(expected, [
    { name: 'wrong_tool_a', args: {} },
    { name: 'wrong_tool_b', args: {} }
  ]);
  if (typeof wrong !== 'number' || Math.abs(wrong - 0) > 1e-6) {
    return {
      passed: false,
      message: 'Wrong tools should score 0.',
      details: 'got ' + JSON.stringify(wrong)
    };
  }

  // Missing call: 1 name + 1 args = 1.5 / 3 = 0.5
  const missing = fn(expected, [
    { name: 'research_company', args: { domain: 'acme.com' } }
  ]);
  if (typeof missing !== 'number' || Math.abs(missing - 0.5) > 1e-6) {
    return {
      passed: false,
      message: 'Missing one expected call should score 0.5 (1 name + 1 args matched out of 3 max).',
      details: 'got ' + JSON.stringify(missing)
    };
  }

  return {
    passed: true,
    message: 'Tool-selection scoring rewards name match (+1) and arg match (+0.5), normalized by the max possible.'
  };
}

export function testPickEvalShape(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickEvalFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickEvalShape.' };

  const cases = [
    { task: { kind: 'extraction-with-known-answer' }, want: 'exact-match', why: 'Known-answer extraction is exact-match' },
    { task: { kind: 'open-ended-response-quality' }, want: 'llm-judge', why: 'Open-ended quality is what LLM-as-judge is for' },
    { task: { kind: 'multi-step-tool-use-correctness' }, want: 'behavioral', why: 'Multi-step tool use is behavioral eval' },
    { task: { kind: 'safety-critical-edge-cases' }, want: 'human-review', why: 'Safety-critical needs humans' },
    { task: { kind: 'classification-accuracy' }, want: 'exact-match', why: 'Classification has a known label' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong eval shape for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'llm-judge') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "llm-judge", the most general open-ended scoring.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Eval shape routing matches the rules: exact-match for known answers, llm-judge for open-ended, behavioral for tool use, human-review for safety.'
  };
}

export async function testWriteLlmJudge(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  if (typeof result !== 'number') {
    return {
      passed: false,
      message: 'Return a numeric score (1 to 5).',
      details: 'got ' + JSON.stringify(result)
    };
  }
  const score = result;
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return {
      passed: false,
      message: 'Score must be a number in [1, 5].',
      details: 'got ' + JSON.stringify(score)
    };
  }
  if (score < 4) {
    return {
      passed: false,
      message: 'A correct "Paris" answer should score 4 or 5. The judge prompt is probably not asking the model to score correctness.',
      details: 'got ' + score
    };
  }
  // Acceptable
  return {
    passed: true,
    message: 'Judge correctly scored a Paris answer at 4 or 5. The pattern: score with a tight rubric, force tool use for a clean numeric output.'
  };
}

