import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface PlatformConstraints {
  team: 'solo' | 'small' | 'enterprise';
  needsHostedState: boolean;
  primaryModel: 'anthropic' | 'openai' | 'google';
  deploymentTarget: 'self' | 'vercel' | 'gcp' | 'aws' | 'azure';
  customFlow: boolean;
}

type PickPlatformFn = (constraints: PlatformConstraints) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const cellClass = 'rounded-xl bg-clay-cream px-3 py-3 text-center text-sm';

export function PlatformMatrix() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Platform comparison matrix</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each cell to see how the platform handles that capability.
      </p>
      <KeyExplainer
        entries={[
          { id: 'casdk-state', label: 'Claude Agent SDK · hosted state', body: 'First-party persistence primitives (sessions, memory) backed by Anthropic-managed storage. Saves you from rolling your own session table; locks you to the Anthropic surface.' },
          { id: 'casdk-evals', label: 'Claude Agent SDK · evals', body: 'Built-in eval primitives for golden tests and regression checks. Module 16 covers eval design; the SDK gives you the runtime.' },
          { id: 'casdk-multi', label: 'Claude Agent SDK · multi-agent', body: 'Subagent and orchestrator-worker patterns supported through the SDK API. Scoped child agents with their own context windows.' },
          { id: 'casdk-vis', label: 'Claude Agent SDK · visual builder', body: 'No first-party visual graph builder as of 2026. SDK is code-first; build UIs on top yourself if needed.' },
          { id: 'casdk-deploy', label: 'Claude Agent SDK · deployment', body: 'Run anywhere Node runs (your service, Lambda, Cloudflare Worker, dedicated VM). No mandatory hosted runtime; Anthropic-managed state is opt-in.' },
          { id: 'casdk-lockin', label: 'Claude Agent SDK · provider lock-in', body: 'Anthropic-only by design. Switching providers means rewriting on a different SDK. Acceptable trade-off when you want first-party Claude features.' },
          { id: 'oab-state', label: 'OpenAI Agent Builder · hosted state', body: 'Hosted sessions, threads, and assistant memory primitives on OpenAI infrastructure. Less work for you to operate.' },
          { id: 'oab-evals', label: 'OpenAI Agent Builder · evals', body: 'Eval framework for golden tests, scoring, and regression catches; integrated into the platform UI.' },
          { id: 'oab-multi', label: 'OpenAI Agent Builder · multi-agent', body: 'Multi-agent orchestration through Agent Builder primitives plus the visual graph editor for hand-off flows.' },
          { id: 'oab-vis', label: 'OpenAI Agent Builder · visual builder', body: 'First-party visual graph editor for composing agents. Lowers the bar for non-engineers; raises the bar for migrating off later.' },
          { id: 'oab-deploy', label: 'OpenAI Agent Builder · deployment', body: 'Hosted on OpenAI infrastructure. Limited self-hosting options; export paths exist but vary by feature.' },
          { id: 'oab-lockin', label: 'OpenAI Agent Builder · provider lock-in', body: 'OpenAI-only. Visual builder artifacts especially do not port; SDK code is more portable but still tied to OpenAI APIs.' },
          { id: 'gas-state', label: 'Google Agentspace · hosted state', body: 'Enterprise-grade hosted state on GCP with VPC controls, IAM integration, audit logging.' },
          { id: 'gas-evals', label: 'Google Agentspace · evals', body: 'Eval and observability tooling integrated with Vertex AI. Strong on enterprise compliance reporting.' },
          { id: 'gas-multi', label: 'Google Agentspace · multi-agent', body: 'Multi-agent orchestration positioned for enterprise workflows: cross-team agents, role-scoped permissions, Workspace integration.' },
          { id: 'gas-vis', label: 'Google Agentspace · visual builder', body: 'Visual flow editor for agent orchestration plus deep integrations with Google Workspace (Gmail, Drive, Calendar).' },
          { id: 'gas-deploy', label: 'Google Agentspace · deployment', body: 'GCP-native. Vertex AI underneath; runs in your GCP project with VPC and IAM controls.' },
          { id: 'gas-lockin', label: 'Google Agentspace · provider lock-in', body: 'Multi-provider on the model side (Vertex hosts third-party models too) but GCP-locked on infrastructure. Enterprise teams already on GCP welcome this; others should think carefully.' },
          { id: 'vsdk-state', label: 'Vercel AI SDK · hosted state', body: 'No first-party hosted state. You bring your own database; the SDK provides streaming primitives, not persistence.' },
          { id: 'vsdk-evals', label: 'Vercel AI SDK · evals', body: 'No first-party eval framework. Integrate your own (Promptfoo, custom test harness, etc).' },
          { id: 'vsdk-multi', label: 'Vercel AI SDK · multi-agent', body: 'Multi-agent and tool-using flows supported through the SDK API. Less opinionated than Agent Builder; more code to write.' },
          { id: 'vsdk-vis', label: 'Vercel AI SDK · visual builder', body: 'No visual builder. Code-first; pairs well with React for streaming UIs.' },
          { id: 'vsdk-deploy', label: 'Vercel AI SDK · deployment', body: 'Vercel-friendly but provider-agnostic on the runtime side. Streaming-first React helpers for Next.js apps; works on any Node target.' },
          { id: 'vsdk-lockin', label: 'Vercel AI SDK · provider lock-in', body: 'Provider-agnostic on the model side: swap Anthropic, OpenAI, Google, open-weights with a one-line provider change. Lowest provider lock-in of any platform here.' }
        ]}
      >
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-2 text-center">
          <div></div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Claude Agent SDK</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">OpenAI Agent Builder</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Google Agentspace</div>
          <div className="text-xs uppercase tracking-widest text-ink-700">Vercel AI SDK</div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">hosted state</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-state">opt-in</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-state">first-party</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-state">enterprise</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-state">none</KeyExplainerKey></div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">built-in evals</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-evals">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-evals">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-evals">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-evals">no</KeyExplainerKey></div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">multi-agent</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-multi">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-multi">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-multi">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-multi">code-only</KeyExplainerKey></div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">visual builder</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-vis">no</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-vis">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-vis">yes</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-vis">no</KeyExplainerKey></div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">deployment</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-deploy">your stack</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-deploy">hosted</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-deploy">GCP</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-deploy">portable</KeyExplainerKey></div>

          <div className="self-center text-xs uppercase tracking-widest text-ink-700">provider lock-in</div>
          <div className={cellClass}><KeyExplainerKey id="casdk-lockin">Anthropic</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="oab-lockin">OpenAI</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="gas-lockin">GCP infra</KeyExplainerKey></div>
          <div className={cellClass}><KeyExplainerKey id="vsdk-lockin">none</KeyExplainerKey></div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function MigrationStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Migration cost simulator</p>
        <p className="text-sm text-ink-700">
          Step through what migrating off a managed platform actually involves. Numbers are illustrative; real engagements vary.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'team',
            title: '1. Catalog what the platform owned',
            body: (
              <>
                List every primitive you used: hosted state (sessions, memory), evals, observability dashboards, secrets management, deployment, IAM. The work scope equals the sum of "we have to rebuild this" items. Skipping primitives you do not actually use is the first cost saver.
              </>
            )
          },
          {
            actor: 'team',
            title: '2. Identify the seam',
            body: (
              <>
                The seam is the interface your application code talked to. If you abstracted "the agent loop" behind your own interface from day one, the seam is clean and the migration is mostly swapping implementations. If you peppered platform-specific calls throughout, the seam is the entire codebase.
              </>
            )
          },
          {
            actor: 'team',
            title: '3. Build the replacement',
            body: (
              <>
                For each owned primitive: pick the swap. Hosted state to your DB; built-in evals to Promptfoo or custom; observability to Datadog or OpenTelemetry; deployment to your existing CI/CD. Each is a few days to a few weeks; the depth depends on how much of the platform feature you actually used.
              </>
            )
          },
          {
            actor: 'team',
            title: '4. Run dual-stack',
            body: (
              <>
                Send a fraction of traffic through the new stack while the platform still serves production. Diff outputs; instrument both. Catch any platform behavior you did not realize you depended on (hidden retries, default timeouts, prompt-shape munging).
              </>
            )
          },
          {
            actor: 'team',
            title: '5. Cut over',
            body: (
              <>
                Switch all traffic to the new stack. Keep the platform around as a fallback for two to four weeks. Decommission once you are confident the new stack covers every edge case. Most "migration was easy" stories skip this dual-stack period; most "migration was a disaster" stories skipped it for real.
              </>
            )
          },
          {
            actor: 'team',
            title: '6. The hidden tax',
            body: (
              <>
                The platform shipped a UI for non-engineers, an eval reporter for stakeholders, an integration with your customer-data system. Replacing those takes more eng-weeks than the loop did. Realistic budget: 2 to 6 months of focused work for a small-to-mid system. Plan accordingly.
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testPickPlatform(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickPlatformFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickPlatform.' };

  const cases: Array<{ c: PlatformConstraints; want: string; why: string }> = [
    {
      c: { team: 'small', needsHostedState: true, primaryModel: 'anthropic', deploymentTarget: 'self', customFlow: false },
      want: 'claude-agent-sdk',
      why: 'Standard flow with hosted state on Anthropic stack'
    },
    {
      c: { team: 'small', needsHostedState: true, primaryModel: 'openai', deploymentTarget: 'self', customFlow: false },
      want: 'openai-agent-builder',
      why: 'Standard flow with hosted state on OpenAI stack'
    },
    {
      c: { team: 'enterprise', needsHostedState: true, primaryModel: 'google', deploymentTarget: 'gcp', customFlow: false },
      want: 'google-agentspace',
      why: 'Enterprise on GCP with Google models lands at Agentspace'
    },
    {
      c: { team: 'small', needsHostedState: false, primaryModel: 'anthropic', deploymentTarget: 'vercel', customFlow: false },
      want: 'vercel-ai-sdk',
      why: 'No hosted state needed and Vercel deployment target points to Vercel AI SDK'
    },
    {
      c: { team: 'solo', needsHostedState: false, primaryModel: 'anthropic', deploymentTarget: 'self', customFlow: true },
      want: 'raw',
      why: 'Custom flow needs the raw SDK; managed platforms get in the way'
    },
    {
      c: { team: 'enterprise', needsHostedState: false, primaryModel: 'anthropic', deploymentTarget: 'aws', customFlow: true },
      want: 'raw',
      why: 'Custom flow always points to raw SDK regardless of team size'
    }
  ];

  for (const c of cases) {
    const got = fn(c.c);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong platform for ' + JSON.stringify(c.c) + '. ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'Platform routing matches the constraint hierarchy: customFlow first, then provider + hosted state, then deployment target, then raw default.'
  };
}

export function testFeatureMatrix(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const matrix = asRecord(result);
  if (!matrix) return { passed: false, message: 'Return the feature matrix object.' };

  const platforms = ['claude-agent-sdk', 'openai-agent-builder', 'google-agentspace', 'vercel-ai-sdk'];
  for (const platform of platforms) {
    const entry = asRecord(matrix[platform]);
    if (!entry) {
      return {
        passed: false,
        message: 'Missing or malformed entry for "' + platform + '".'
      };
    }
    const required = ['hostedState', 'builtInEvals', 'multiAgent', 'visualBuilder', 'customDeploy', 'providerLockIn'];
    for (const field of required) {
      if (typeof entry[field] !== 'boolean') {
        return {
          passed: false,
          message: '"' + platform + '"."' + field + '" must be a boolean.',
          details: 'got ' + JSON.stringify(entry[field])
        };
      }
    }
  }

  // Specific facts
  const claude = matrix['claude-agent-sdk'] as Record<string, unknown>;
  if (claude.providerLockIn !== true) {
    return {
      passed: false,
      message: 'Claude Agent SDK is Anthropic-only by design; providerLockIn should be true.'
    };
  }
  const openai = matrix['openai-agent-builder'] as Record<string, unknown>;
  if (openai.providerLockIn !== true || openai.visualBuilder !== true) {
    return {
      passed: false,
      message: 'OpenAI Agent Builder is OpenAI-only and ships a visual builder; both should be true.'
    };
  }
  const vercel = matrix['vercel-ai-sdk'] as Record<string, unknown>;
  if (vercel.providerLockIn !== false) {
    return {
      passed: false,
      message: 'Vercel AI SDK is provider-agnostic; providerLockIn should be false.'
    };
  }
  if (vercel.builtInEvals !== false) {
    return {
      passed: false,
      message: 'Vercel AI SDK does not ship a first-party eval framework; builtInEvals should be false.'
    };
  }
  const google = matrix['google-agentspace'] as Record<string, unknown>;
  if (google.hostedState !== true) {
    return {
      passed: false,
      message: 'Google Agentspace runs on hosted GCP infrastructure; hostedState should be true.'
    };
  }

  return {
    passed: true,
    message: 'Feature matrix shape and facts check out. Lock-in story is right: Anthropic and OpenAI for first-party stacks, Vercel for provider portability.'
  };
}
