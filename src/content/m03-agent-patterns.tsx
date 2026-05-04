import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface Rule {
  name: string;
  keywords: string[];
}

interface Subtask {
  name: string;
  input: string;
}

type RouteFn = (input: string, rules: Rule[]) => unknown;
type OrchestrateFn = (
  plan: Subtask[],
  runWorker: (subtask: Subtask) => Promise<string>
) => Promise<unknown>;
type PickPatternFn = (task: { shape: string }) => unknown;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AugmentedLlmExplorer() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-4 font-heading text-lg text-ink-900">Demo · Augmented LLM Explorer</p>
      <KeyExplainer
        entries={[
          {
            id: 'llm',
            label: 'llm',
            body: 'The model itself. Stateless, called once per turn. Everything else in this list extends what a single call can do without changing the underlying primitive.'
          },
          {
            id: 'retrieval',
            label: 'retrieval',
            body: 'Read-only lookup the model can request: vector similarity, BM25 keyword match, structured query against a document store. Lives outside the context window so the model can ask for relevant chunks instead of carrying the whole corpus. Module 09 covers this in depth.'
          },
          {
            id: 'tools',
            label: 'tools',
            body: 'Functions the model can invoke to read or write the world. The model emits a tool_use block, your code runs the function, you return the result as a tool_result. Module 01 introduced the loop; Module 08 covers tool design at scale.'
          },
          {
            id: 'memory',
            label: 'memory',
            body: 'Durable state across turns or sessions. Distinct from conversation history (which is just messages). Memory is what lets an agent remember facts about the user, prior decisions, or learned constraints. Module 09 again.'
          }
        ]}
      >
        <pre className="overflow-x-auto rounded-xl bg-[#1A2530] p-6 font-mono text-sm text-white">
          <code>
            {`{
  `}
            <KeyExplainerKey id="llm">"llm"</KeyExplainerKey>
            {`: "the model itself, stateless, called per turn",
  `}
            <KeyExplainerKey id="retrieval">"retrieval"</KeyExplainerKey>
            {`: "vector store, BM25, or any read-only lookup the model can ask for",
  `}
            <KeyExplainerKey id="tools">"tools"</KeyExplainerKey>
            {`: "functions the model can invoke to read or write the world",
  `}
            <KeyExplainerKey id="memory">"memory"</KeyExplainerKey>
            {`: "durable state across turns or sessions, not the conversation history"
}`}
          </code>
        </pre>
      </KeyExplainer>
    </section>
  );
}

export function OrchestratorWorkerWalkthrough() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Orchestrator-Worker Walkthrough</p>
        <p className="text-sm text-ink-700">
          Scenario: "Brief me on the company at acme.com before my 3pm call."
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: 'User submits a task',
            body: 'A single sentence with a goal. The orchestrator has not seen it yet.'
          },
          {
            actor: 'model',
            title: 'Orchestrator plans',
            body: (
              <>
                The orchestrator LLM reads the task and emits a plan: <em>scrape acme.com homepage, pull recent LinkedIn posts, search news for "Acme" funding/launches</em>. It also writes the synthesis prompt that will combine the results.
              </>
            )
          },
          {
            actor: 'harness',
            title: 'Harness spawns three workers in parallel',
            body: 'Each subtask becomes a worker LLM call with its own scoped prompt and tools. Workers run concurrently, not sequentially.'
          },
          {
            actor: 'model',
            title: 'Workers report back',
            body: 'Worker 1 returns a homepage summary. Worker 2 returns three relevant posts. Worker 3 returns one news item. Each result is independent and bounded.'
          },
          {
            actor: 'model',
            title: 'Synthesizer produces the briefing',
            body: 'A final LLM call (often the orchestrator itself with a different prompt) takes the three worker outputs and writes the one-paragraph briefing the user asked for.'
          },
          {
            actor: 'harness',
            title: 'Harness returns to user',
            body: 'The user sees the briefing. They never see the worker outputs unless your harness chooses to surface them.'
          }
        ]}
      />
    </div>
  );
}

export function testRoute(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as RouteFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return route.' };
  const rules = [
    { name: 'refund', keywords: ['refund', 'money back', 'cancel charge'] },
    { name: 'billing', keywords: ['invoice', 'billing', 'charge'] },
    { name: 'product', keywords: ['feature', 'how do i', 'where is'] }
  ];
  const cases = [
    { input: 'I want a refund please', want: 'refund' },
    { input: 'Where is the export feature?', want: 'product' },
    { input: 'My invoice is wrong', want: 'billing' },
    { input: 'CHARGE on my card', want: 'billing' },
    { input: 'I need help', want: 'fallback' },
    { input: 'I want my money back today', want: 'refund' }
  ];
  for (const c of cases) {
    const got = fn(c.input, rules);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong route for input: ' + JSON.stringify(c.input),
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }
  const order = fn('refund and invoice', rules);
  if (order !== 'refund') {
    return {
      passed: false,
      message: '"refund and invoice" should hit "refund" first because that rule comes first in the list.',
      details: 'got ' + JSON.stringify(order)
    };
  }
  return {
    passed: true,
    message: 'Routes correctly. Order matters, case-insensitive matching, fallback when nothing hits.'
  };
}

export async function testOrchestrator(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  const fn = result as OrchestrateFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return orchestrate.' };
  const plan = [
    { name: 'scrape', input: 'acme.com' },
    { name: 'posts', input: 'acme' },
    { name: 'news', input: 'Acme funding' }
  ];
  const log: string[] = [];
  const runWorker = async (sub: Subtask) => {
    log.push('start:' + sub.name);
    await new Promise((resolve) => setTimeout(resolve, 60));
    log.push('end:' + sub.name);
    return 'result-of-' + sub.name;
  };
  const t0 = performance.now();
  let resultMap: unknown;
  try {
    resultMap = await fn(plan, runWorker);
  } catch (error) {
    return { passed: false, message: 'Threw: ' + errorMessage(error) };
  }
  const elapsed = performance.now() - t0;

  if (!resultMap || typeof resultMap !== 'object' || Array.isArray(resultMap)) {
    return { passed: false, message: 'Return an object keyed by subtask name, not an array.' };
  }
  const actual = resultMap as Record<string, unknown>;
  const expected = {
    scrape: 'result-of-scrape',
    posts: 'result-of-posts',
    news: 'result-of-news'
  };
  for (const k of Object.keys(expected)) {
    if (actual[k] !== expected[k as keyof typeof expected]) {
      return {
        passed: false,
        message: 'Missing or wrong key: ' + k,
        details: 'got: ' + JSON.stringify(resultMap)
      };
    }
  }
  if (elapsed > 140) {
    return {
      passed: false,
      message: 'Workers ran sequentially. Three 60ms workers in parallel should finish in ~60ms, not ' + Math.round(elapsed) + 'ms.',
      details: 'log order: ' + log.join(', ')
    };
  }
  const startOrder = log.filter((line) => line.startsWith('start:'));
  const firstEnd = log.findIndex((line) => line.startsWith('end:'));
  const lastStart = log.lastIndexOf(startOrder[startOrder.length - 1]);
  if (lastStart > firstEnd) {
    return {
      passed: false,
      message: 'All workers should be started before any finishes. Use Promise.all over a map of starts.',
      details: 'log: ' + log.join(', ')
    };
  }
  return {
    passed: true,
    message: 'Three workers ran concurrently and the result map is correct. Finished in ' + Math.round(elapsed) + 'ms.'
  };
}

export function testPickPattern(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickPatternFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pick.' };
  const cases = [
    { task: { shape: 'fixed-order-multi-step' }, want: 'chaining', why: 'multiple steps in a fixed order is a chain' },
    { task: { shape: 'one-of-N-types' }, want: 'routing', why: 'classify-then-dispatch is routing' },
    { task: { shape: 'independent-chunks' }, want: 'parallel', why: 'independent chunks of the same job is sectioning, the parallel pattern' },
    { task: { shape: 'plan-unknown-up-front' }, want: 'orchestrator', why: 'a plan only the model can produce is orchestrator-workers' },
    { task: { shape: 'almost-right-needs-polish' }, want: 'evaluator', why: 'gen-then-critique loops are evaluator-optimizer' },
    { task: { shape: 'open-ended-environment-feedback' }, want: 'agent', why: 'open-ended, environment in the loop, is a true agent' }
  ];
  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong pattern for shape "' + c.task.shape + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }
  const fallback = fn({ shape: 'something-else' });
  if (fallback !== undefined && fallback !== null) {
    const names = ['chaining', 'routing', 'parallel', 'orchestrator', 'evaluator', 'agent'];
    if (names.includes(String(fallback))) {
      return {
        passed: false,
        message: 'Unknown shape should not return a real pattern name. Return null or undefined.',
        details: 'got "' + fallback + '"'
      };
    }
  }
  return {
    passed: true,
    message: 'You internalized the table. Six shapes, six patterns, plus a sane fallback.'
  };
}
