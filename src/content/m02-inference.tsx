import { useMemo, useState } from 'react';
import type { RunLine, Verdict } from '../lib/sandbox/types';
import Stepper from '../components/stepper';

interface TokenProb {
  token: string;
  prob: number;
}

interface DecodeStrategiesBundle {
  pickTopP: (probs: Array<[string, number]>, p: number) => Array<[string, number]>;
  pickGreedy: (probs: Array<[string, number]>) => string | undefined;
}

interface LatencyOpts {
  inputTokens: number;
  outputTokens: number;
  ttftMsPerKToken: number;
  decodeTokPerSec: number;
}

type EstimateLatencyFn = (opts: LatencyOpts) => number;
type PickProviderFn = (task: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function arraysEqual(a: Array<[string, number]>, b: Array<[string, number]>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0]) return false;
    if (Math.abs(a[i][1] - b[i][1]) > 1e-9) return false;
  }
  return true;
}

const decodingTokens: TokenProb[] = [
  { token: 'Paris', prob: 0.62 },
  { token: 'a', prob: 0.1 },
  { token: 'Lyon', prob: 0.06 },
  { token: 'Marseille', prob: 0.05 },
  { token: 'the', prob: 0.05 },
  { token: 'Strasbourg', prob: 0.04 },
  { token: 'Nice', prob: 0.03 },
  { token: 'Bordeaux', prob: 0.02 },
  { token: 'Cannes', prob: 0.02 },
  { token: 'actually', prob: 0.01 }
];

function applyTemperature(items: TokenProb[], T: number): TokenProb[] {
  if (T <= 0) {
    const max = items.reduce((a, b) => (a.prob >= b.prob ? a : b));
    return items.map((it) => ({ token: it.token, prob: it.token === max.token ? 1 : 0 }));
  }
  const logits = items.map((it) => Math.log(Math.max(it.prob, 1e-12)) / T);
  const maxLogit = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return items.map((it, i) => ({ token: it.token, prob: exps[i] / sum }));
}

function sampleFrom(items: TokenProb[]): string {
  const r = Math.random();
  let cum = 0;
  for (const it of items) {
    cum += it.prob;
    if (r <= cum) return it.token;
  }
  return items[items.length - 1].token;
}

function topPSet(items: TokenProb[], p: number): string[] {
  const sorted = [...items].sort((a, b) => b.prob - a.prob);
  const result: string[] = [];
  let cum = 0;
  for (const it of sorted) {
    result.push(it.token);
    cum += it.prob;
    if (cum >= p) break;
  }
  return result;
}

type DecodingMode = 'idle' | 'greedy' | 'temp-0.2' | 'temp-1.0' | 'top-p-0.9';

interface DecodingResult {
  mode: DecodingMode;
  candidates: string[];
  picked: string | null;
  label: string;
}

function runDecoding(mode: DecodingMode): DecodingResult {
  if (mode === 'greedy') {
    const max = decodingTokens.reduce((a, b) => (a.prob >= b.prob ? a : b));
    return {
      mode,
      candidates: [max.token],
      picked: max.token,
      label: 'Greedy: candidate set is the single highest-probability token. Deterministic.'
    };
  }
  if (mode === 'top-p-0.9') {
    const candidates = topPSet(decodingTokens, 0.9);
    const subset = decodingTokens
      .filter((it) => candidates.includes(it.token))
      .map((it) => ({ token: it.token, prob: it.prob }));
    const subsetSum = subset.reduce((a, b) => a + b.prob, 0);
    const renorm = subset.map((it) => ({ token: it.token, prob: it.prob / subsetSum }));
    return {
      mode,
      candidates,
      picked: sampleFrom(renorm),
      label: 'Top-p 0.9: keep tokens until cumulative probability reaches 0.9, then sample from the nucleus.'
    };
  }
  const T = mode === 'temp-0.2' ? 0.2 : 1.0;
  const reshaped = applyTemperature(decodingTokens, T);
  return {
    mode,
    candidates: reshaped.map((it) => it.token),
    picked: sampleFrom(reshaped),
    label:
      T < 1
        ? 'Temperature 0.2: distribution sharpens toward the top token. Variance is low but not zero.'
        : 'Temperature 1.0: original distribution. Long tail occasionally wins.'
  };
}

const buttonClass =
  'rounded-full border border-ink-500/30 bg-clay-bg px-4 py-2 text-sm text-ink-700 transition-colors hover:border-accent-coral hover:text-accent-coral';
const buttonClassActive = 'rounded-full bg-accent-coral px-4 py-2 text-sm font-medium text-white';

export function DecodingDemo() {
  const [result, setResult] = useState<DecodingResult>({
    mode: 'idle',
    candidates: [],
    picked: null,
    label: 'Pick a strategy. Top-p and temperature sampling are randomized, so click again to see variance.'
  });

  const sortedRows = useMemo(() => [...decodingTokens].sort((a, b) => b.prob - a.prob), []);

  function handleClick(mode: DecodingMode) {
    setResult(runDecoding(mode));
  }

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Decoding Strategy Visualizer</p>
      <p className="mb-4 text-sm text-ink-700">
        Distribution after the prefix <em>"The capital of France is"</em>. Hand-tuned to match what a real model would produce on a near-trivia prompt.
      </p>

      <div className="space-y-2">
        {sortedRows.map((row) => {
          const inSet = result.candidates.includes(row.token);
          const isPicked = result.picked === row.token;
          const barWidth = `${Math.max(row.prob * 100, 1)}%`;
          return (
            <div
              key={row.token}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                isPicked
                  ? 'bg-clay-mint'
                  : inSet
                    ? 'bg-clay-cream'
                    : 'bg-white/40'
              }`}
            >
              <span className={`w-28 font-mono text-sm ${isPicked ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                {row.token}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-white/70">
                <div
                  className={`h-3 rounded-full transition-[width] ${
                    isPicked ? 'bg-accent-coral' : inSet ? 'bg-clay-sky' : 'bg-ink-500/30'
                  }`}
                  style={{ width: barWidth }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs text-ink-700">{row.prob.toFixed(2)}</span>
              <span className="w-16 text-right text-xs text-ink-500">
                {isPicked ? 'picked' : inSet ? 'in set' : ''}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className={result.mode === 'greedy' ? buttonClassActive : buttonClass}
          onClick={() => handleClick('greedy')}
        >
          Greedy
        </button>
        <button
          type="button"
          className={result.mode === 'temp-0.2' ? buttonClassActive : buttonClass}
          onClick={() => handleClick('temp-0.2')}
        >
          Temp 0.2
        </button>
        <button
          type="button"
          className={result.mode === 'temp-1.0' ? buttonClassActive : buttonClass}
          onClick={() => handleClick('temp-1.0')}
        >
          Temp 1.0
        </button>
        <button
          type="button"
          className={result.mode === 'top-p-0.9' ? buttonClassActive : buttonClass}
          onClick={() => handleClick('top-p-0.9')}
        >
          Top-p 0.9
        </button>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.label}</p>
    </section>
  );
}

export function ProviderComparison() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Provider Comparison</p>
        <p className="text-sm text-ink-700">
          Six provider archetypes. Numbers are order-of-magnitude as of 2026 and shift constantly. Treat them as ranges, not promises.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'frontier',
            title: 'Anthropic',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5. The frontier-quality default for agent work.</p>
                <p className="mb-2"><strong>TTFT:</strong> sub-second on Sonnet and Haiku, around 1 to 2 seconds on Opus for short inputs. Climbs with input length.</p>
                <p className="mb-2"><strong>Throughput:</strong> tens of tokens per second on Opus, faster on Sonnet, fastest on Haiku.</p>
                <p className="mb-2"><strong>Pricing:</strong> tiered. Opus is the premium tier; Haiku is the cheap-and-fast tier; Sonnet sits in between. Prompt caching cuts repeated-prefix costs by roughly 80 to 90 percent.</p>
                <p><strong>Use when:</strong> the task benefits from frontier reasoning and tool-use quality, which is most production agent work.</p>
              </>
            )
          },
          {
            actor: 'frontier',
            title: 'OpenAI',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> GPT-5.x family, o-series reasoning models. Comparable frontier tier; different quirks on tool use and output format.</p>
                <p className="mb-2"><strong>TTFT and throughput:</strong> similar order of magnitude to Anthropic. Reasoning models add seconds to tens of seconds of hidden thinking time before the first user-visible token.</p>
                <p className="mb-2"><strong>Pricing:</strong> per-token, prompt and completion priced separately, batch tier roughly half price.</p>
                <p><strong>Use when:</strong> you are already on the OpenAI stack, when image generation through gpt-image-2 fits the workflow, or when o-series reasoning is a better match than Claude extended thinking.</p>
              </>
            )
          },
          {
            actor: 'oss-host',
            title: 'Together AI',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> a wide catalog of open-weights models (Llama, Qwen, DeepSeek, Mistral, plus quantized variants).</p>
                <p className="mb-2"><strong>TTFT and throughput:</strong> varies by model. Smaller open-weights models often beat frontier APIs on raw tok/s and TTFT.</p>
                <p className="mb-2"><strong>Pricing:</strong> per-million-tokens, often a fraction of frontier pricing for comparable open-weights models.</p>
                <p><strong>Use when:</strong> you want open-weights inference without running it yourself, are price-sensitive, or want a specific model the frontier vendors do not host.</p>
              </>
            )
          },
          {
            actor: 'oss-host',
            title: 'Fireworks AI',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> open-weights catalog plus a managed-fine-tuning surface.</p>
                <p className="mb-2"><strong>TTFT and throughput:</strong> aggressive on latency and throughput, especially on smaller fine-tuned models.</p>
                <p className="mb-2"><strong>Pricing:</strong> competitive with Together; per-model variation.</p>
                <p><strong>Use when:</strong> you want fine-tuning on open-weights models without standing up your own training stack, or when latency on a smaller model matters more than frontier quality.</p>
              </>
            )
          },
          {
            actor: 'low-latency',
            title: 'Groq',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> open-weights models running on custom LPU hardware.</p>
                <p className="mb-2"><strong>TTFT and throughput:</strong> the latency-first option. Hundreds of tok/s on supported models, with TTFT often well under 200ms. Verify current numbers on their status page; LPU performance is the marketing pitch.</p>
                <p className="mb-2"><strong>Pricing:</strong> per-token, similar order to other open-weights hosts.</p>
                <p><strong>Use when:</strong> latency is the dominant requirement. Voice agents, fast UI streaming, real-time decision loops.</p>
              </>
            )
          },
          {
            actor: 'self-hosted',
            title: 'Self-hosted (vLLM, llama.cpp)',
            body: (
              <>
                <p className="mb-2"><strong>Models:</strong> any open-weights model you can fit on your hardware.</p>
                <p className="mb-2"><strong>TTFT and throughput:</strong> entirely up to you. vLLM is the production-grade serving stack; llama.cpp is the everywhere-it-fits laptop runtime.</p>
                <p className="mb-2"><strong>Pricing:</strong> hardware capex plus electricity. Works out cheaper at very high volume; almost always more expensive at low volume than a hosted API.</p>
                <p><strong>Use when:</strong> regulatory or privacy constraints forbid sending data to a third party, when you need a custom-quantized model nobody hosts, or when volume justifies the operational overhead.</p>
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testDecodeStrategies(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const obj = asRecord(result);
  if (!obj) return { passed: false, message: 'Return an object with pickTopP and pickGreedy.' };
  const bundle = obj as unknown as DecodeStrategiesBundle;
  if (typeof bundle.pickTopP !== 'function' || typeof bundle.pickGreedy !== 'function') {
    return {
      passed: false,
      message: 'Both pickTopP and pickGreedy must be functions on the returned object.'
    };
  }

  const peaked: Array<[string, number]> = [
    ['a', 0.6],
    ['b', 0.3],
    ['c', 0.1]
  ];
  const flat: Array<[string, number]> = [
    ['a', 0.4],
    ['b', 0.3],
    ['c', 0.2],
    ['d', 0.1]
  ];

  const greedyPicked = bundle.pickGreedy(peaked);
  if (greedyPicked !== 'a') {
    return {
      passed: false,
      message: 'pickGreedy([["a", 0.6], ["b", 0.3], ["c", 0.1]]) should return "a".',
      details: 'got ' + JSON.stringify(greedyPicked)
    };
  }

  const greedyEmpty = bundle.pickGreedy([]);
  if (greedyEmpty !== undefined && greedyEmpty !== null) {
    return {
      passed: false,
      message: 'pickGreedy([]) should return undefined or null. Do not throw on empty input.',
      details: 'got ' + JSON.stringify(greedyEmpty)
    };
  }

  const topPeaked = bundle.pickTopP(peaked, 0.5);
  const expectPeaked: Array<[string, number]> = [['a', 0.6]];
  if (!Array.isArray(topPeaked) || !arraysEqual(topPeaked, expectPeaked)) {
    return {
      passed: false,
      message:
        'pickTopP(peaked, 0.5) should return [["a", 0.6]]. The first token already crosses the 0.5 threshold.',
      details: 'got ' + JSON.stringify(topPeaked)
    };
  }

  const topFlat = bundle.pickTopP(flat, 0.9);
  const expectFlat: Array<[string, number]> = [
    ['a', 0.4],
    ['b', 0.3],
    ['c', 0.2]
  ];
  if (!Array.isArray(topFlat) || !arraysEqual(topFlat, expectFlat)) {
    return {
      passed: false,
      message:
        'pickTopP(flat, 0.9) should return [["a", 0.4], ["b", 0.3], ["c", 0.2]]. Cumulative reaches 0.9 at "c".',
      details: 'got ' + JSON.stringify(topFlat)
    };
  }

  const topEmpty = bundle.pickTopP([], 0.9);
  if (!Array.isArray(topEmpty) || topEmpty.length !== 0) {
    return {
      passed: false,
      message: 'pickTopP([], 0.9) should return []. Do not throw on empty input.',
      details: 'got ' + JSON.stringify(topEmpty)
    };
  }

  return {
    passed: true,
    message: 'Greedy and top-p both behave correctly. Truncation stops the moment cumulative probability hits the threshold.'
  };
}

export function testLatencyBudget(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as EstimateLatencyFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return estimateLatency.' };

  const cases: Array<{ opts: LatencyOpts; want: number; why: string }> = [
    {
      opts: { inputTokens: 1000, outputTokens: 500, ttftMsPerKToken: 200, decodeTokPerSec: 50 },
      want: 200 + (500 / 50) * 1000,
      why: '1K input * 200ms/K = 200ms TTFT plus 500 tokens / 50 tok/s = 10s decode.'
    },
    {
      opts: { inputTokens: 5000, outputTokens: 100, ttftMsPerKToken: 200, decodeTokPerSec: 50 },
      want: (5000 / 1000) * 200 + (100 / 50) * 1000,
      why: 'Long input dominates. TTFT scales with input length.'
    },
    {
      opts: { inputTokens: 0, outputTokens: 0, ttftMsPerKToken: 200, decodeTokPerSec: 50 },
      want: 0,
      why: 'Zero input and zero output is zero ms. No special-casing needed.'
    },
    {
      opts: { inputTokens: 10000, outputTokens: 1000, ttftMsPerKToken: 100, decodeTokPerSec: 100 },
      want: (10000 / 1000) * 100 + (1000 / 100) * 1000,
      why: 'Faster prefill and faster decode produce the bigger budget here.'
    }
  ];

  for (const c of cases) {
    let got: unknown;
    try {
      got = fn(c.opts);
    } catch (error) {
      return {
        passed: false,
        message: 'Threw on input ' + JSON.stringify(c.opts),
        details: error instanceof Error ? error.message : String(error)
      };
    }
    if (typeof got !== 'number' || Math.abs(got - c.want) > 0.5) {
      return {
        passed: false,
        message: 'Wrong total for ' + JSON.stringify(c.opts) + '. ' + c.why,
        details: 'expected ' + c.want + ', got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'TTFT plus decode composes correctly. Long inputs hurt TTFT; long outputs hurt total wall time.'
  };
}

export function testPickProvider(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickProviderFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickProvider.' };

  const cases = [
    { task: { kind: 'low-latency' }, want: 'groq', why: 'low-latency wants the LPU host' },
    { task: { kind: 'frontier-quality' }, want: 'anthropic', why: 'frontier quality is the Anthropic default for this course' },
    { task: { kind: 'high-throughput-batch' }, want: 'anthropic-batch', why: 'batch tier trades latency for cost' },
    { task: { kind: 'self-hosted-required' }, want: 'vllm', why: 'self-hosted production serving is vLLM' },
    { task: { kind: 'open-weights-cheap' }, want: 'together', why: 'cheap open-weights inference points to Together' },
    { task: { kind: 'something-else' }, want: 'anthropic', why: 'unknown kind falls back to anthropic, the safe default' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong provider for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'Provider routing is correct. Latency, frontier quality, cost, and self-hosted constraints each pick a different home.'
  };
}
