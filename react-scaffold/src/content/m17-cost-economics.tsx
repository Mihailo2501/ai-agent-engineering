import { useMemo, useState } from 'react';
import type { RunLine, Verdict } from '../lib/sandbox/types';
import Stepper from '../components/stepper';

interface PricingTier {
  inputPerMillion: number;
  cachedInputPerMillion: number;
  outputPerMillion: number;
}

const PRICING: Record<string, PricingTier> = {
  haiku: { inputPerMillion: 1.0, cachedInputPerMillion: 0.1, outputPerMillion: 5.0 },
  sonnet: { inputPerMillion: 3.0, cachedInputPerMillion: 0.3, outputPerMillion: 15.0 },
  opus: { inputPerMillion: 5.0, cachedInputPerMillion: 0.5, outputPerMillion: 25.0 }
};

interface CostInput {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  model: 'haiku' | 'sonnet' | 'opus';
}

type EstimateCostFn = (input: CostInput) => number;
type PickModelFn = (turn: { kind: string }) => unknown;

interface BudgetInput {
  spentUSD: number;
  capUSD: number;
}

interface BudgetVerdict {
  allow: boolean;
  reason?: string;
}

type EnforceBudgetFn = (input: BudgetInput) => BudgetVerdict;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function calcCost(input: CostInput): number {
  const tier = PRICING[input.model];
  if (!tier) return 0;
  const uncachedInput = Math.max(0, input.inputTokens - input.cachedInputTokens);
  const inputCost = (uncachedInput * tier.inputPerMillion) / 1_000_000;
  const cachedCost = (input.cachedInputTokens * tier.cachedInputPerMillion) / 1_000_000;
  const outputCost = (input.outputTokens * tier.outputPerMillion) / 1_000_000;
  return inputCost + cachedCost + outputCost;
}

export function CostCalculatorDemo() {
  const [model, setModel] = useState<'haiku' | 'sonnet' | 'opus'>('sonnet');
  const [inputTokens, setInputTokens] = useState(8000);
  const [cachedRatio, setCachedRatio] = useState(75);
  const [outputTokens, setOutputTokens] = useState(500);
  const [callsPerMonth, setCallsPerMonth] = useState(100_000);

  const cachedInputTokens = Math.round((inputTokens * cachedRatio) / 100);
  const perCall = useMemo(
    () => calcCost({ inputTokens, outputTokens, cachedInputTokens, model }),
    [inputTokens, outputTokens, cachedInputTokens, model]
  );
  const monthly = perCall * callsPerMonth;
  const tier = PRICING[model];

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Cost calculator</p>
      <p className="mb-4 text-sm text-ink-700">
        Move the sliders. Watch how cached prefix and model choice change the per-call cost; multiply by call volume.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-700">Model</label>
            <div className="flex gap-2">
              {(['haiku', 'sonnet', 'opus'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`flex-1 rounded-full px-3 py-2 text-sm ${
                    model === m ? 'bg-accent-coral text-white' : 'bg-clay-cream text-ink-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Input tokens per call: <span className="font-mono">{inputTokens.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={500}
              max={50_000}
              step={500}
              value={inputTokens}
              onChange={(e) => setInputTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Cached prefix: <span className="font-mono">{cachedRatio}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={cachedRatio}
              onChange={(e) => setCachedRatio(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Output tokens per call: <span className="font-mono">{outputTokens.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={50}
              max={4000}
              step={50}
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Calls per month: <span className="font-mono">{callsPerMonth.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={1000}
              max={1_000_000}
              step={1000}
              value={callsPerMonth}
              onChange={(e) => setCallsPerMonth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <div className="rounded-xl bg-clay-cream p-5">
          <p className="mb-4 font-heading text-base text-ink-900">Result</p>
          <p className="mb-2 text-sm text-ink-700">Per-call cost</p>
          <p className="mb-4 font-heading text-3xl text-ink-900">${perCall.toFixed(4)}</p>
          <p className="mb-2 text-sm text-ink-700">Monthly cost</p>
          <p className="mb-4 font-heading text-3xl text-ink-900">${monthly.toFixed(2)}</p>
          <p className="mb-1 text-xs text-ink-700">Per-million-token rates ({model})</p>
          <p className="text-xs font-mono text-ink-700">
            input ${tier.inputPerMillion.toFixed(2)} · cached ${tier.cachedInputPerMillion.toFixed(2)} · output ${tier.outputPerMillion.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-ink-500">
            Pricing here is illustrative; verify Anthropic's current per-million-token rates when you commit.
          </p>
        </div>
      </div>
    </section>
  );
}

export function RoutingVisualizerStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Routing across one agent session</p>
        <p className="text-sm text-ink-700">
          Five turns, three model tiers. Watch the routing logic and the cumulative cost.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. User input · classifier turn',
            body: '"Look up the latest funding for Acme Corp." Classifier turn picks Haiku because the work is "decide which tool to call". 4K input tokens (system + tool defs, mostly cached). Cost: roughly $0.0005.'
          },
          {
            actor: 'tool',
            title: '2. Tool call · research_company',
            body: 'No model call here. Potter MCP tool runs; returns structured data. Cost: provider data fee ($0.10 to Proxycurl), no LLM cost.'
          },
          {
            actor: 'model',
            title: '3. Synthesis turn · default to Sonnet',
            body: '"Summarize what we found and decide next step." Sonnet is the default reasoning model. 6K input tokens (cached prefix + tool result), 600 output tokens. Cost: roughly $0.013.'
          },
          {
            actor: 'tool',
            title: '4. Tool call · find_decision_maker',
            body: 'Another structured tool. No LLM, just provider cost. The agent has all the data it needs after this.'
          },
          {
            actor: 'model',
            title: '5. Final answer · routed back to Haiku',
            body: 'The agent has decided what to say; the final formatting turn does not need Opus or Sonnet. Haiku produces the final 200-token reply. Cost: roughly $0.001. Total session: ~$0.015 + provider fees, with cache reuse holding the prefill cost flat across turns.'
          }
        ]}
      />
    </div>
  );
}

export function testEstimateCost(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as EstimateCostFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return estimateCallCost.' };

  // Simple sonnet, no cache: input 1M @ $3 = $3, output 1M @ $15 = $15, total $18
  const c1 = fn({ inputTokens: 1_000_000, outputTokens: 1_000_000, cachedInputTokens: 0, model: 'sonnet' });
  if (typeof c1 !== 'number' || Math.abs(c1 - 18) > 1e-3) {
    return {
      passed: false,
      message: '1M input + 1M output on sonnet should be $18 ($3 + $15).',
      details: 'got ' + JSON.stringify(c1)
    };
  }

  // Fully cached input: 1M cached @ $0.30 + 1M output @ $15 = $15.30
  const c2 = fn({
    inputTokens: 1_000_000,
    outputTokens: 1_000_000,
    cachedInputTokens: 1_000_000,
    model: 'sonnet'
  });
  if (typeof c2 !== 'number' || Math.abs(c2 - 15.3) > 1e-3) {
    return {
      passed: false,
      message: 'Fully cached 1M input + 1M output on sonnet should be $15.30 (cache shaved input from $3 to $0.30).',
      details: 'got ' + JSON.stringify(c2)
    };
  }

  // Haiku: 100K input no cache + 100K output = 0.1 + 0.5 = 0.6
  const c3 = fn({ inputTokens: 100_000, outputTokens: 100_000, cachedInputTokens: 0, model: 'haiku' });
  if (typeof c3 !== 'number' || Math.abs(c3 - 0.6) > 1e-3) {
    return {
      passed: false,
      message: 'Haiku 100K input + 100K output should be $0.60 ($0.10 + $0.50).',
      details: 'got ' + JSON.stringify(c3)
    };
  }

  // Opus 10K input, 0 cache, 1K output: 0.05 + 0.025 = 0.075
  const c4 = fn({ inputTokens: 10_000, outputTokens: 1000, cachedInputTokens: 0, model: 'opus' });
  if (typeof c4 !== 'number' || Math.abs(c4 - 0.075) > 1e-3) {
    return {
      passed: false,
      message: 'Opus 10K input + 1K output should be $0.075.',
      details: 'got ' + JSON.stringify(c4)
    };
  }

  // Cached should never be billed at full rate; 1M cached + 0 uncached + 0 output = $0.30
  const c5 = fn({ inputTokens: 1_000_000, outputTokens: 0, cachedInputTokens: 1_000_000, model: 'sonnet' });
  if (typeof c5 !== 'number' || Math.abs(c5 - 0.3) > 1e-3) {
    return {
      passed: false,
      message: '1M fully cached input on sonnet should be $0.30, not $3.00.',
      details: 'got ' + JSON.stringify(c5)
    };
  }

  // Cached tokens must clamp to input tokens: 1.5M claimed cached on 1M input bills as 1M cached + 0 uncached.
  const c6 = fn({ inputTokens: 1_000_000, outputTokens: 0, cachedInputTokens: 1_500_000, model: 'sonnet' });
  if (typeof c6 !== 'number' || Math.abs(c6 - 0.3) > 1e-3) {
    return {
      passed: false,
      message: 'cachedInputTokens above inputTokens should clamp: 1.5M cached + 1M input bills as 1M cached + 0 uncached.',
      details: 'got ' + JSON.stringify(c6)
    };
  }

  return {
    passed: true,
    message: 'Cost math holds: cached input billed at the cached rate, uncached at full input rate, output at output rate.'
  };
}

export function testPickModel(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickModelFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickModel.' };

  const cases = [
    { task: { kind: 'classification' }, want: 'haiku' },
    { task: { kind: 'simple-extraction' }, want: 'haiku' },
    { task: { kind: 'default-reasoning' }, want: 'sonnet' },
    { task: { kind: 'tool-decide' }, want: 'sonnet' },
    { task: { kind: 'long-planning' }, want: 'opus' },
    { task: { kind: 'hard-math' }, want: 'opus' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong model for kind "' + c.task.kind + '". Cheap turns -> haiku, default reasoning -> sonnet, hard work -> opus.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'sonnet') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "sonnet", the safe production default.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Routing matches the cheap-default-hard split: haiku for classification/simple, sonnet for default, opus for the hardest turns.'
  };
}

export function testBudgetEnforcer(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as EnforceBudgetFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return enforceBudget.' };

  // Below soft cap: allow
  const a = asRecord(fn({ spentUSD: 50, capUSD: 100 }));
  if (!a || a.allow !== true) {
    return {
      passed: false,
      message: 'spent < 95% of cap should allow.',
      details: 'got ' + JSON.stringify(a)
    };
  }

  // Soft cap: deny with reason "soft-cap"
  const b = asRecord(fn({ spentUSD: 96, capUSD: 100 }));
  if (!b || b.allow !== false || b.reason !== 'soft-cap') {
    return {
      passed: false,
      message: 'spent in [95%, 100%) of cap should deny with reason "soft-cap".',
      details: 'got ' + JSON.stringify(b)
    };
  }

  // Hard cap: deny with reason "hard-cap"
  const c = asRecord(fn({ spentUSD: 100, capUSD: 100 }));
  if (!c || c.allow !== false || c.reason !== 'hard-cap') {
    return {
      passed: false,
      message: 'spent >= 100% of cap should deny with reason "hard-cap".',
      details: 'got ' + JSON.stringify(c)
    };
  }

  const d = asRecord(fn({ spentUSD: 200, capUSD: 100 }));
  if (!d || d.allow !== false || d.reason !== 'hard-cap') {
    return {
      passed: false,
      message: 'spent over cap is also "hard-cap".',
      details: 'got ' + JSON.stringify(d)
    };
  }

  return {
    passed: true,
    message: 'Budget enforcement: allow under 95%, soft-cap from 95% to 100%, hard-cap at and above 100%.'
  };
}
