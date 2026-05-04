import { useMemo, useState } from 'react';
import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';

interface ModelConstraints {
  qualityRequired: 'production' | 'volume' | 'privacy' | 'research';
}

type PickModelFn = (constraints: ModelConstraints) => unknown;

interface QuantInput {
  ramGB: number;
  modelParams: number;
}

type QuantFn = (input: QuantInput) => string;

const GB_PER_B: Record<string, number> = {
  Q4_K_M: 0.6,
  Q5_K_M: 0.75,
  Q8_0: 1.0,
  fp16: 2.0
};

function recommendQuant(ramGB: number, modelParams: number): string {
  const usable = Math.max(0, ramGB - 4);
  const order: Array<keyof typeof GB_PER_B> = ['fp16', 'Q8_0', 'Q5_K_M', 'Q4_K_M'];
  for (const q of order) {
    const need = modelParams * GB_PER_B[q];
    if (need <= usable) return q;
  }
  return 'Q4_K_M';
}

export function HubTourDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Hugging Face Hub tour</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each section to see what lives there and what you actually do with it.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'models',
            label: 'Models',
            body: 'Hosts open-weights model files (PyTorch checkpoints, GGUF, ONNX). Each model card describes architecture, training data, license, intended use, eval scores. You browse, compare, download. The "Open LLM Leaderboard" and the "Open ASR Leaderboard" are the standard ways to compare. For agent work, look at function-calling specifically (Llama 3.x, Qwen 2.5+, gemma family); raw quality scores do not always predict tool-use reliability.'
          },
          {
            id: 'datasets',
            label: 'Datasets',
            body: 'Public and curated datasets for training, fine-tuning, and evaluation. C4, RedPajama, FineWeb for pretraining; Open Assistant, UltraChat for instruction tuning; SWE-bench, MMLU, GSM8K for eval. Used most often when fine-tuning open-weights models or when bootstrapping an eval suite. Always check the license; "open" varies.'
          },
          {
            id: 'spaces',
            label: 'Spaces',
            body: 'Hosted demos. Gradio and Streamlit apps that anyone can run in the browser. Useful for trying a model before downloading; common starting point for new model releases. Spaces can run on free CPU or paid GPU upgrades. Not production infrastructure; treat as a sandbox.'
          },
          {
            id: 'endpoints',
            label: 'Inference Endpoints',
            body: 'Hosted production-ready inference. Pick a model, pick hardware, get an API endpoint. Useful when you want open-weights without operating GPUs yourself. Pricing scales with hardware and uptime. Verify current capabilities and pricing when you commit; the offering evolves quickly.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="models">Models</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="datasets">Datasets</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="spaces">Spaces</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="endpoints">Inference Endpoints</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function QuantizationDemo() {
  const [ramGB, setRamGB] = useState(16);
  const [modelB, setModelB] = useState(7);

  const quant = useMemo(() => recommendQuant(ramGB, modelB), [ramGB, modelB]);
  const sizeGB = useMemo(() => modelB * GB_PER_B[quant], [modelB, quant]);
  const usable = Math.max(0, ramGB - 4);
  const fits = sizeGB <= usable;

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Pick a quantization</p>
      <p className="mb-4 text-sm text-ink-700">
        Move the sliders. The recommendation picks the highest quality that fits with 4 GB of headroom.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Hardware RAM: <span className="font-mono">{ramGB} GB</span>
            </label>
            <input
              type="range"
              min={8}
              max={128}
              step={4}
              value={ramGB}
              onChange={(e) => setRamGB(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-700">
              Model size: <span className="font-mono">{modelB} B params</span>
            </label>
            <input
              type="range"
              min={1}
              max={70}
              step={1}
              value={modelB}
              onChange={(e) => setModelB(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <div className="rounded-xl bg-clay-cream p-5">
          <p className="mb-2 text-sm text-ink-700">Recommended quant</p>
          <p className="mb-4 font-heading text-3xl text-ink-900">{quant}</p>
          <p className="mb-2 text-sm text-ink-700">Approx model size on disk</p>
          <p className="mb-4 font-heading text-2xl text-ink-900">{sizeGB.toFixed(1)} GB</p>
          <p className="mb-2 text-sm text-ink-700">Usable RAM (after 4 GB headroom)</p>
          <p className="mb-4 font-heading text-2xl text-ink-900">{usable} GB</p>
          <p className={`text-sm ${fits ? 'text-state-success' : 'text-accent-coral'}`}>
            {fits ? 'Fits comfortably' : 'Tight fit; expect swap or reduced context length'}
          </p>
        </div>
      </div>
    </section>
  );
}

export function testPickModelTier(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickModelFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickModelTier.' };

  const cases: Array<{ ctx: ModelConstraints; want: string; why: string }> = [
    { ctx: { qualityRequired: 'production' }, want: 'frontier', why: 'Production-quality agents go to frontier' },
    { ctx: { qualityRequired: 'volume' }, want: 'oss-hosted', why: 'High-volume cheap calls go to OSS hosted (Together, Fireworks)' },
    { ctx: { qualityRequired: 'privacy' }, want: 'oss-local', why: 'Privacy-required workloads go local' },
    { ctx: { qualityRequired: 'research' }, want: 'oss-local', why: 'Research and fine-tuning belong local' }
  ];

  for (const c of cases) {
    const got = fn(c.ctx);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong model tier for ' + JSON.stringify(c.ctx) + '. ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ qualityRequired: 'production' });
  if (fallback !== 'frontier') {
    return { passed: false, message: 'Production should reliably return "frontier".' };
  }

  return {
    passed: true,
    message: 'Model tier routing matches: production -> frontier, high-volume -> oss-hosted, privacy or research -> oss-local.'
  };
}

export function testQuantFit(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as QuantFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickQuantization.' };

  const cases: Array<{ input: QuantInput; want: string }> = [
    { input: { ramGB: 32, modelParams: 7 }, want: 'fp16' },
    { input: { ramGB: 16, modelParams: 7 }, want: 'Q8_0' },
    { input: { ramGB: 16, modelParams: 13 }, want: 'Q5_K_M' },
    { input: { ramGB: 8, modelParams: 7 }, want: 'Q4_K_M' }
  ];

  for (const c of cases) {
    const got = fn(c.input);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong quant for ' + JSON.stringify(c.input) + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'Quant picker matches the rule: pick the highest quality that fits in (RAM - 4) GB; floor to Q4_K_M when nothing fits cleanly.'
  };
}
