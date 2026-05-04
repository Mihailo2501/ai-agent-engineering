import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PromptOrderResult = Record<string, unknown>;
type PickTempFn = (task: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function SystemPromptAnatomy() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-4 font-heading text-lg text-ink-900">Demo · System Prompt Anatomy</p>
      <KeyExplainer
        entries={[
          {
            id: 'role',
            label: 'role',
            body: 'One or two sentences declaring who the model is. Frames register and judgement. Drop this and the model defaults to a generic helpful-assistant persona that often clashes with the rest of your prompt.'
          },
          {
            id: 'capabilities',
            label: 'capabilities',
            body: 'What the assistant does and does not do. Bounds the conversation early. Without it, users wander into territory you never intended to cover and the model improvises.'
          },
          {
            id: 'tools_section',
            label: 'tools',
            body: "Per-tool guidance the harness needs even though tool definitions are already provided in the tools array. This is where you write the 'use this when X, use that when Y' disambiguation that prevents wrong-tool selection."
          },
          {
            id: 'format',
            label: 'output_format',
            body: "Length, structure, and style rules for the assistant's text output. Specific is better than abstract: '80 to 120 words, plain text, no headers' is a contract; 'be concise' is a vibe."
          },
          {
            id: 'constraints',
            label: 'constraints',
            body: "Hard rules with consequences. 'Never invent quotes.' 'Quote sources verbatim.' These are the rules that, if violated, would break trust with the user. Keep them short, declarative, and unambiguous."
          },
          {
            id: 'refusals',
            label: 'refusals',
            body: 'What the assistant should decline. Specific to your application: PII handling, scope creep into legal advice, anything outside the product. Goes near the bottom of the system prompt so it sits closest to the conversation start.'
          }
        ]}
      >
        <pre className="overflow-x-auto rounded-xl bg-[#1A2530] p-6 font-mono text-sm text-white">
          <code>
            {'<'}
            <KeyExplainerKey id="role">role</KeyExplainerKey>
            {`>
  You are a sales research assistant.
</role>

<`}
            <KeyExplainerKey id="capabilities">capabilities</KeyExplainerKey>
            {`>
  You enrich companies and people from public data.
  You write briefings for sales calls.
</capabilities>

<`}
            <KeyExplainerKey id="tools_section">tools</KeyExplainerKey>
            {`>
  research_company: full enrichment, slow but thorough.
  linkedin_posts: pull recent posts from a profile URL.
  web_search: when the above two return nothing.
</tools>

<`}
            <KeyExplainerKey id="format">output_format</KeyExplainerKey>
            {`>
  Briefings are 80 to 120 words, plain text, no headers.
</output_format>

<`}
            <KeyExplainerKey id="constraints">constraints</KeyExplainerKey>
            {`>
  Never invent quotes, names, or numbers.
  When uncertain, say so. Do not paper over gaps.
</constraints>

<`}
            <KeyExplainerKey id="refusals">refusals</KeyExplainerKey>
            {`>
  Decline requests for personal contact info beyond
  what is publicly listed on the profile.
</refusals>`}
          </code>
        </pre>
      </KeyExplainer>
    </section>
  );
}

export function ReactTrace() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">ReAct Trace</p>
        <p className="text-sm text-ink-700">
          Scenario: "What is the population of the capital of France, in millions, rounded to one decimal?"
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'model',
            title: 'Thought 1',
            body: '"I need the capital of France first. That is Paris. Now I need its population. I should look that up rather than guess from training data."'
          },
          {
            actor: 'model',
            title: 'Action 1',
            body: (
              <>
                Emits <code>tool_use</code> for <code>web_search</code> with <code>{'{ q: "Paris population 2026" }'}</code>.
              </>
            )
          },
          {
            actor: 'harness',
            title: 'Observation 1',
            body: (
              <>
                Tool returns: <em>"Paris metropolitan area population: ~11.2M (2026 estimate). City proper: ~2.1M."</em> Wrapped in a <code>tool_result</code> block on the next user message.
              </>
            )
          },
          {
            actor: 'model',
            title: 'Thought 2',
            body: '"The metro figure is what people mean by \\"population of Paris\\" in casual usage. The user asked for one number rounded to one decimal: 11.2."'
          },
          {
            actor: 'model',
            title: 'Final answer',
            body: (
              <>
                "11.2 million." <code>stop_reason</code> is <code>end_turn</code>.
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testPromptOrder(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const obj = asRecord(result) as PromptOrderResult | null;
  if (!obj) return { passed: false, message: 'Return an object.' };
  if (obj.role !== 1) {
    return { passed: false, message: 'role should be 1 (top of prompt).', details: 'got ' + JSON.stringify(obj.role) };
  }
  if (obj.refusals !== 4) {
    return { passed: false, message: 'refusals should be 4 (bottom, nearest the conversation).', details: 'got ' + JSON.stringify(obj.refusals) };
  }
  const middle = [obj.tools, obj.format].sort();
  if (middle[0] !== 2 || middle[1] !== 3) {
    return {
      passed: false,
      message: 'tools and format should occupy positions 2 and 3 (either order).',
      details: 'tools=' + JSON.stringify(obj.tools) + ', format=' + JSON.stringify(obj.format)
    };
  }
  return {
    passed: true,
    message: 'Role frames the model first. Refusals sit closest to the conversation. Tool guidance and format both go in between.'
  };
}

export function testSystemSteer(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const obj = asRecord(result);
  if (!obj) {
    return {
      passed: false,
      message: 'Did not return a parsed object. Make sure the model produces strict JSON.',
      details: 'returned: ' + JSON.stringify(result)
    };
  }
  if (typeof obj.answer !== 'number') {
    return {
      passed: false,
      message: 'Object has no numeric "answer" field.',
      details: 'returned: ' + JSON.stringify(obj)
    };
  }
  if (obj.answer !== 289) {
    return {
      passed: false,
      message: 'answer should be 289 (17 squared).',
      details: 'returned: ' + JSON.stringify(obj)
    };
  }
  return { passed: true, message: 'Strict JSON, correct answer. The system prompt did the work.' };
}

export function testPickTemperature(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickTempFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickTemp.' };
  const det = ['tool_selection', 'json_extraction', 'rag_qa'];
  const cre = ['brainstorm', 'creative_writing', 'ideation'];
  for (const kind of det) {
    const t = fn({ kind });
    if (typeof t !== 'number' || t < 0 || t > 0.3) {
      return {
        passed: false,
        message: 'kind="' + kind + '" should return a number in [0, 0.3].',
        details: 'got ' + JSON.stringify(t)
      };
    }
  }
  for (const kind of cre) {
    const t = fn({ kind });
    if (typeof t !== 'number' || t < 0.7 || t > 1.0) {
      return {
        passed: false,
        message: 'kind="' + kind + '" should return a number in [0.7, 1.0].',
        details: 'got ' + JSON.stringify(t)
      };
    }
  }
  const fb = fn({ kind: 'unknown' });
  if (typeof fb !== 'number' || fb < 0.4 || fb > 0.6) {
    return {
      passed: false,
      message: 'Unknown kind should return a moderate default in [0.4, 0.6].',
      details: 'got ' + JSON.stringify(fb)
    };
  }
  return {
    passed: true,
    message: 'You picked the right buckets. Tool selection and structured output get low temperature; creative tasks get high; default in the middle.'
  };
}
