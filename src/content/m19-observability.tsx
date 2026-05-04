import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface AlertInput {
  name: string;
  current: number;
  baseline: number;
  threshold: number;
}

interface CorrelateEvent {
  run_id: string;
  timestamp: number;
  [key: string]: unknown;
}

type PickSignalsFn = (layer: string) => unknown;
type ShouldAlertFn = (metric: AlertInput) => boolean;
type CorrelateFn = (events: CorrelateEvent[]) => Record<string, CorrelateEvent[]>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function arrayEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const sorted1 = [...a].sort();
  const sorted2 = [...b].sort();
  return sorted1.every((v, i) => v === sorted2[i]);
}

export function SignalLayerDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Signal layers for an agent service</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each layer to see the signals, the alerts that matter, and the dashboard widgets that go with them.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'cost',
            label: 'Cost · tokens, dollars, cache',
            body: 'Signals: tokens_used per call and per session, cost_usd cumulative, cache hit rate, model split (Haiku/Sonnet/Opus). Alerts: monthly burn rate exceeding budget; cache hit rate dropping below threshold; per-user spend cap hit. Dashboard: spend by feature, top 10 highest-cost users, model-mix over time. Owner: typically the platform team plus finance.'
          },
          {
            id: 'quality',
            label: 'Quality · judged scores, hallucinations',
            body: 'Signals: judged_quality from production sampling (Module 16), hallucination rate, response factuality vs grounding source. Alerts: rolling-window quality score dropping more than X%; hallucination drift after a model change; specific case-categories regressing. Dashboard: median and p95 judged score over time, by use case and by model version.'
          },
          {
            id: 'reliability',
            label: 'Reliability · latency, errors, retries',
            body: 'Signals: p50 and p99 latency per turn, tool_success_rate per tool, retries per session, stop_reason distribution, escalations to human. Alerts: latency p99 exceeding SLO; tool error rate spiking; escalation rate climbing. Dashboard: latency percentiles, error rate by tool, retry heatmap.'
          },
          {
            id: 'security',
            label: 'Security · gates, audit, anomalies',
            body: 'Signals: gate_denials by category, prompt-injection match counts, output-validator rejections, anomalous spend or tool-call patterns per user. Alerts: gate-denial spike (potential attack or regression), audit-log gaps, sudden change in tool mix per user. Dashboard: gate decisions over time, top denied categories, audit completeness checks.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="cost">Cost layer</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="quality">Quality layer</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="reliability">Reliability layer</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="security">Security layer</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function IncidentReplayStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Incident replay walkthrough</p>
        <p className="text-sm text-ink-700">
          Trace one production incident from alert to fix to permanent monitor.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'tool',
            title: '1. Alert fires',
            body: '"Tool error rate on research_company exceeded 5% in the last 10 minutes." The alert routes to the on-call channel with a link to the dashboard. Time-to-acknowledge clock starts.'
          },
          {
            actor: 'team',
            title: '2. On-call opens runbook',
            body: 'The runbook for "tool error spike" is open. First step: identify the failing tool, the error class (network, auth, rate limit, validation), and the affected users. The runbook has standard query templates that the on-call runs without thinking.'
          },
          {
            actor: 'team',
            title: '3. Failing run replayed',
            body: 'Pick a representative failed run by run_id. The persisted state lets you replay the agent loop deterministically (modulo sampling variance). Replay reveals the tool was returning 502 errors from a third-party provider.'
          },
          {
            actor: 'team',
            title: '4. Root cause isolated',
            body: 'The provider had a brief outage. The tool was retrying but not falling back. Two issues: provider availability (out of our hands) and missing fallback (in our hands). The incident scope expands to "fix the missing fallback" and "decide if multi-provider is needed".'
          },
          {
            actor: 'team',
            title: '5. Fix shipped',
            body: 'A small change: when the provider returns 5xx, the tool falls back to a secondary provider for the same data shape. Deploy via canary; watch the error rate drop.'
          },
          {
            actor: 'team',
            title: '6. Eval added',
            body: 'A new behavioral eval case (Module 16) covers "tool returns 5xx, agent should fall back". Future regressions are caught in CI before they hit production.'
          },
          {
            actor: 'team',
            title: '7. Monitor adjusted',
            body: 'The original alert was good but lacked context. Updated to include "and provider is X% degraded" so the on-call knows whether the issue is internal or upstream. Postmortem closes; the runbook is updated; the team moves on.'
          }
        ]}
      />
    </div>
  );
}

export function testPickSignals(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickSignalsFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickSignals.' };

  const cases: Array<{ layer: string; want: string[] }> = [
    { layer: 'cost', want: ['tokens_used', 'cost_usd'] },
    { layer: 'quality', want: ['judged_quality'] },
    {
      layer: 'reliability',
      want: ['p50_latency', 'p99_latency', 'tool_success_rate', 'retries', 'stop_reason_distribution', 'escalations']
    },
    { layer: 'security', want: ['gate_denials'] }
  ];

  for (const c of cases) {
    const got = fn(c.layer);
    if (!Array.isArray(got)) {
      return {
        passed: false,
        message: 'Layer "' + c.layer + '" should return an array.',
        details: 'got ' + JSON.stringify(got)
      };
    }
    if (!arrayEqual(got as string[], c.want)) {
      return {
        passed: false,
        message: 'Layer "' + c.layer + '" should return ' + JSON.stringify(c.want) + '.',
        details: 'got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'Signal-layer routing matches: cost has tokens and dollars, quality has the judge score, reliability has latency and tool success and retries, security has gate denials.'
  };
}

export function testShouldAlert(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ShouldAlertFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return shouldAlert.' };

  // Latency below baseline: no alert
  if (fn({ name: 'latency_p99', current: 800, baseline: 1000, threshold: 0.2 }) !== false) {
    return { passed: false, message: 'latency below baseline should not alert.' };
  }

  // At threshold edge: 1000 * 1.2 = 1200; current = 1200 -> not strictly greater, no alert
  if (fn({ name: 'latency_p99', current: 1200, baseline: 1000, threshold: 0.2 }) !== false) {
    return {
      passed: false,
      message: 'current equal to baseline * (1 + threshold) should not alert (strict greater-than).'
    };
  }

  // Above threshold: alert
  if (fn({ name: 'latency_p99', current: 1300, baseline: 1000, threshold: 0.2 }) !== true) {
    return { passed: false, message: 'current above baseline * (1 + threshold) should alert.' };
  }

  if (fn({ name: 'cost_usd', current: 130, baseline: 100, threshold: 0.2 }) !== true) {
    return { passed: false, message: 'cost above baseline * (1 + threshold) should alert.' };
  }

  // Quality drops alert on decrease, not increase.
  if (fn({ name: 'quality', current: 3.1, baseline: 4.0, threshold: 0.2 }) !== true) {
    return { passed: false, message: 'quality below baseline * (1 - threshold) should alert.' };
  }

  if (fn({ name: 'judged_quality', current: 3.2, baseline: 4.0, threshold: 0.2 }) !== false) {
    return { passed: false, message: 'quality equal to baseline * (1 - threshold) should not alert (strict less-than).' };
  }

  if (fn({ name: 'quality', current: 4.8, baseline: 4.0, threshold: 0.2 }) !== false) {
    return { passed: false, message: 'quality increases should not alert.' };
  }

  return {
    passed: true,
    message: 'Alert direction is metric-aware: latency and cost alert on increase; quality alerts on decrease.'
  };
}

export function testCorrelate(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as CorrelateFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return correlate.' };

  const events: CorrelateEvent[] = [
    { run_id: 'r1', timestamp: 200, kind: 'tool' },
    { run_id: 'r2', timestamp: 100, kind: 'start' },
    { run_id: 'r1', timestamp: 100, kind: 'start' },
    { run_id: 'r2', timestamp: 200, kind: 'tool' },
    { run_id: 'r1', timestamp: 300, kind: 'end' }
  ];

  const grouped = asRecord(fn(events));
  if (!grouped) {
    return { passed: false, message: 'Return an object keyed by run_id.' };
  }

  const r1 = grouped.r1 as CorrelateEvent[] | undefined;
  const r2 = grouped.r2 as CorrelateEvent[] | undefined;
  if (!Array.isArray(r1) || r1.length !== 3) {
    return { passed: false, message: 'r1 should have 3 events.', details: JSON.stringify(r1) };
  }
  if (!Array.isArray(r2) || r2.length !== 2) {
    return { passed: false, message: 'r2 should have 2 events.', details: JSON.stringify(r2) };
  }

  const r1Times = r1.map((e) => e.timestamp);
  if (r1Times[0] !== 100 || r1Times[1] !== 200 || r1Times[2] !== 300) {
    return {
      passed: false,
      message: 'r1 events should be sorted by timestamp ascending.',
      details: JSON.stringify(r1Times)
    };
  }

  const r2Times = r2.map((e) => e.timestamp);
  if (r2Times[0] !== 100 || r2Times[1] !== 200) {
    return {
      passed: false,
      message: 'r2 events should be sorted by timestamp ascending.',
      details: JSON.stringify(r2Times)
    };
  }

  return {
    passed: true,
    message: 'Correlation works: events grouped by run_id and sorted by timestamp within each group.'
  };
}
