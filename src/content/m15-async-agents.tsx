import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickAsyncFn = (workload: { kind: string }) => unknown;

interface RetryInput {
  attempt: number;
  baseMs: number;
  maxMs: number;
  jitterRatio: number;
}

type RetryFn = (input: RetryInput) => number;

interface IdemInput {
  source: string;
  id: string;
  version: number;
}

type IdemFn = (input: IdemInput) => string;

export function AsyncPatternPickerDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Pick the async shape</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each shape to see the workload signal, common platforms, and the most common pitfall.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'cron',
            label: 'Cron-driven',
            body: 'Workload signal: time-bound (every minute, hour, day). Platforms: node-cron, system cron, GitHub Actions schedule, Vercel cron, Cloudflare Workers cron. Pitfall: re-running the same work when the previous run is still in flight; mitigate with idempotency keys plus a "skip if previous run still active" guard.'
          },
          {
            id: 'queue',
            label: 'Queue-fed',
            body: 'Workload signal: event-bound (a webhook, a user action, a CDC change). Platforms: SQS, Pub/Sub, Cloud Tasks, Redis streams. Pitfall: missing dead-letter handling; failures pile up silently. Always wire a DLQ and an alarm on its depth.'
          },
          {
            id: 'durable',
            label: 'Durable execution',
            body: 'Workload signal: long, multi-step, must survive crashes. Platforms: Inngest, Trigger.dev, Temporal, Restate. Pitfall: treating it like normal async/await; the durable runtime needs you to express steps explicitly so each one persists its result for replay. Forgetting the step boundary turns a 30-second flow into a single non-replayable function.'
          },
          {
            id: 'foreground',
            label: 'Foreground',
            body: 'Workload signal: a user is waiting; latency budget is in seconds (chat) or hundreds of ms (voice). Platforms: just your API server. Pitfall: hiding genuinely slow work behind a foreground call. If a step takes more than a few seconds, surface progress and move it to background.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="cron">Cron · time-bound</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="queue">Queue · event-bound</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="durable">Durable execution</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="foreground">Foreground · user is waiting</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function AsyncLifecycleStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Background agent lifecycle</p>
        <p className="text-sm text-ink-700">
          Trace a single work item through the seven stages of a durable background agent run, including the retry path and the dead-letter escalation.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'tool',
            title: '1. Cron tick or event arrives',
            body: 'The trigger fires. A scheduler emits a tick (cron) or an upstream system enqueues an event (webhook, user action, CDC). The runtime picks up the work item along with an idempotency key.'
          },
          {
            actor: 'team',
            title: '2. Agent picks up the work item',
            body: (
              <>
                Worker process pulls the item, checks the idempotency key against a dedupe store, and proceeds only if no completed run already covers this key. This is what stops retries from duplicating work.
              </>
            )
          },
          {
            actor: 'model',
            title: '3. Agent runs N tool calls',
            body: (
              <>
                The agent loop executes its work: tool calls, model decisions, structured output. Each step is small enough to retry independently if it fails. Every step's result is persisted (durable execution) or held in memory (cron-only) until the run completes.
              </>
            )
          },
          {
            actor: 'team',
            title: '4. On success, commit results',
            body: 'Final output is written to the destination (Slack, Postgres, S3, downstream API). Idempotency key marked complete. Structured event logged for observability. Done.'
          },
          {
            actor: 'team',
            title: '5. On failure, exponential backoff retry',
            body: (
              <>
                Failure is logged with classification (transient vs terminal). For transient (network, rate limit, 5xx), schedule a retry with exponential backoff plus jitter. For terminal (auth failed, validation), skip retry, move to step 7.
              </>
            )
          },
          {
            actor: 'team',
            title: '6. Max attempts exhausted',
            body: 'After the configured number of retries (typically 3 to 5 with exponential backoff), the runtime stops trying. The work item moves to a dead-letter store. An alert fires; observability sees the spike.'
          },
          {
            actor: 'user',
            title: '7. Escalation to human',
            body: 'A human triages dead-letter items. Common shapes: replay after fixing the upstream, manually complete the action, or accept the loss and document. Without escalation, the queue grows until something else breaks.'
          }
        ]}
      />
    </div>
  );
}

export function testPickAsyncShape(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickAsyncFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickAsync.' };

  const cases = [
    { task: { kind: 'nightly-enrichment-of-rows' }, want: 'cron', why: 'Nightly time-bound work is cron' },
    { task: { kind: 'user-event-triggered-analysis' }, want: 'queue', why: 'Event-driven work is queue-fed' },
    { task: { kind: 'long-workflow-with-retry-guarantees' }, want: 'durable', why: 'Multi-step with retry guarantees is durable execution' },
    { task: { kind: 'user-is-waiting-for-response' }, want: 'foreground', why: 'When a user is waiting, foreground is the right shape' },
    { task: { kind: 'hourly-funding-monitor' }, want: 'cron', why: 'Hourly time-bound is cron' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong async shape for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'foreground') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "foreground", the default when no async signal is present.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Async shape routing matches the workload signals: cron for time-bound, queue for event-bound, durable for long multi-step, foreground when a user is waiting.'
  };
}

export function testRetryPolicy(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as RetryFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return nextRetryDelay.' };

  // Attempt 0 with 100ms base, no jitter
  const base = 100;
  const max = 5000;
  const attempt0 = fn({ attempt: 0, baseMs: base, maxMs: max, jitterRatio: 0 });
  if (attempt0 !== 100) {
    return {
      passed: false,
      message: 'attempt=0 with baseMs=100 and zero jitter should return exactly 100 ms (base * 2^0).',
      details: 'got ' + JSON.stringify(attempt0)
    };
  }

  // Attempt 4: 100 * 16 = 1600ms
  const attempt4 = fn({ attempt: 4, baseMs: base, maxMs: max, jitterRatio: 0 });
  if (attempt4 !== 1600) {
    return {
      passed: false,
      message: 'attempt=4 with baseMs=100 and zero jitter should return 1600 ms (100 * 2^4).',
      details: 'got ' + JSON.stringify(attempt4)
    };
  }

  // Attempt that exceeds max should clamp
  const big = fn({ attempt: 20, baseMs: base, maxMs: max, jitterRatio: 0 });
  if (big !== max) {
    return {
      passed: false,
      message: 'Very large attempt should clamp to maxMs. Expected 5000.',
      details: 'got ' + JSON.stringify(big)
    };
  }

  // Jitter sample: with ratio 0.5 and base = 100, attempt 0, results should fall in [50, 150]
  const samples = [];
  for (let i = 0; i < 30; i++) {
    samples.push(fn({ attempt: 0, baseMs: base, maxMs: max, jitterRatio: 0.5 }));
  }
  for (const s of samples) {
    if (typeof s !== 'number' || s < 50 || s > 150) {
      return {
        passed: false,
        message: 'jitterRatio=0.5 at base=100 should produce samples in [50, 150].',
        details: 'got ' + JSON.stringify(s) + ' out of [50, 150]'
      };
    }
  }
  // Variance check: should not all be identical
  if (new Set(samples).size < 3) {
    return {
      passed: false,
      message: 'jitter should actually randomize; the sampled delays look identical.',
      details: 'samples ' + JSON.stringify(samples.slice(0, 5))
    };
  }

  return {
    passed: true,
    message: 'Retry policy matches: exponential up to maxMs, jitter as +/- ratio of the base delay.'
  };
}

export function testIdempotencyKey(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as IdemFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return idempotencyKey.' };

  const key = fn({ source: 'webhook', id: 'evt_123', version: 1 });
  if (key !== 'webhook:evt_123:v1') {
    return {
      passed: false,
      message: 'Format should be "${source}:${id}:v${version}".',
      details: 'got ' + JSON.stringify(key)
    };
  }

  // Stability: same input always returns same output
  const key2 = fn({ source: 'webhook', id: 'evt_123', version: 1 });
  if (key !== key2) {
    return {
      passed: false,
      message: 'Same input should always produce the same key (stable).',
      details: 'first ' + JSON.stringify(key) + ', second ' + JSON.stringify(key2)
    };
  }

  // Different version produces different key
  const keyV2 = fn({ source: 'webhook', id: 'evt_123', version: 2 });
  if (keyV2 === key) {
    return {
      passed: false,
      message: 'Different version should produce a different key.',
      details: 'both " ' + JSON.stringify(key) + '"'
    };
  }

  // Empty id should throw
  let threw = false;
  try {
    fn({ source: 'webhook', id: '', version: 1 });
  } catch {
    threw = true;
  }
  if (!threw) {
    return {
      passed: false,
      message: 'Empty id should throw (the dedupe key would not be uniquely identifiable).'
    };
  }

  return {
    passed: true,
    message: 'Idempotency keys are stable, deterministic, and reject empty ids.'
  };
}
