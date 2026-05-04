import { useMemo, useState } from 'react';
import type { RunLine, Verdict } from '../lib/sandbox/types';

type TextRole = 'system' | 'user' | 'assistant';
type SpecialRole = 'tool_use' | 'tool_result';
type MessageRole = TextRole | SpecialRole;

interface TextMessage {
  role: TextRole;
  content: string;
}

interface ToolUseMessage {
  role: 'tool_use';
  content: {
    name: string;
    input: {
      city: string;
    };
    id: string;
  };
}

interface ToolResultMessage {
  role: 'tool_result';
  content: {
    tool_use_id: string;
    output: string;
  };
}

type Message = TextMessage | ToolUseMessage | ToolResultMessage;

const roleButtons: MessageRole[] = [
  'system',
  'user',
  'assistant',
  'tool_use',
  'tool_result'
];

const roleClasses: Record<MessageRole, string> = {
  system: 'border-accent-coral bg-clay-peach',
  user: 'border-ink-500/20 bg-clay-mint',
  assistant: 'border-ink-500/20 bg-clay-sky',
  tool_use: 'border-accent-coral bg-clay-cream',
  tool_result: 'border-accent-coral bg-clay-lavender'
};

function sampleFor(role: MessageRole): Message {
  if (role === 'system') {
    return { role, content: 'You are a helpful research assistant.' };
  }
  if (role === 'user') {
    return { role, content: "What's the weather in Paris?" };
  }
  if (role === 'assistant') {
    return { role, content: 'Sure, let me check the current conditions.' };
  }
  if (role === 'tool_use') {
    return {
      role,
      content: { name: 'get_weather', input: { city: 'Paris' }, id: 'tu_01' }
    };
  }
  return {
    role,
    content: { tool_use_id: 'tu_01', output: '18°C, partly cloudy' }
  };
}

function roleLabel(role: MessageRole): string {
  return role.replace('_', ' ');
}

function MessageBody({ message }: { message: Message }) {
  if (typeof message.content === 'string') {
    return <>{`"${message.content}"`}</>;
  }

  if (message.role === 'tool_use') {
    return (
      <>
        <em>tool_use block:</em>
        <br />
        {`{ name: "${message.content.name}", input: ${JSON.stringify(
          message.content.input
        )} }`}
      </>
    );
  }

  return (
    <>
      <em>tool_result block:</em>
      <br />
      {`{ tool_use_id: "${message.content.tool_use_id}", output: "${message.content.output}" }`}
    </>
  );
}

function buildRequestBody(messages: Message[]) {
  const sysMsg = messages.find((message): message is TextMessage => message.role === 'system');
  const conv = messages.filter((message) => message.role !== 'system');

  return {
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    ...(sysMsg ? { system: sysMsg.content } : {}),
    messages: conv.map((message) => {
      if (message.role === 'tool_use') {
        return {
          role: 'assistant',
          content: [
            {
              type: 'tool_use',
              id: message.content.id,
              name: message.content.name,
              input: message.content.input
            }
          ]
        };
      }
      if (message.role === 'tool_result') {
        return {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: message.content.tool_use_id,
              content: message.content.output
            }
          ]
        };
      }
      return { role: message.role, content: message.content };
    })
  };
}

const buttonClass =
  'rounded-full bg-accent-coral px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5';
const ghostButtonClass =
  'rounded-full border border-ink-500/30 bg-white/70 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-accent-coral';

export default function MessageStackBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showJson, setShowJson] = useState(false);
  const requestJson = useMemo(
    () => JSON.stringify(buildRequestBody(messages), null, 2),
    [messages]
  );

  function addMessage(role: MessageRole) {
    setMessages((current) => [...current, sampleFor(role)]);
  }

  function resetMessages() {
    setMessages([]);
    setShowJson(false);
  }

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-lg text-ink-900">Demo · Message Stack Builder</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostButtonClass} onClick={resetMessages}>
            reset
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setShowJson((visible) => !visible)}
          >
            {showJson ? 'hide JSON' : 'show JSON'}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {roleButtons.map((role) => (
          <button
            key={role}
            type="button"
            className={buttonClass}
            onClick={() => addMessage(role)}
          >
            + {role}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-xl bg-white/70 p-4 text-sm text-ink-700">
            No messages yet. Click a button above to start building your conversation.
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`rounded-xl border p-4 ${roleClasses[message.role]}`}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-700">
                {roleLabel(message.role)}
              </p>
              <p className="font-mono text-sm text-ink-900">
                <MessageBody message={message} />
              </p>
            </article>
          ))
        )}
      </div>

      {showJson ? (
        <pre className="mt-5 overflow-x-auto rounded-xl bg-[#1A2530] p-5 font-mono text-sm text-white">
          {requestJson}
        </pre>
      ) : null}
    </section>
  );
}

interface ContentBlock {
  type: string;
  id?: string;
  name?: string;
  input?: unknown;
  text?: string;
}

interface ResponseWithContent {
  content: ContentBlock[];
}

type ExtractToolUses = (response: ResponseWithContent) => unknown;

export function testExtractToolUses(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const extractFn = result as ExtractToolUses;
  if (typeof extractFn !== 'function') {
    return { passed: false, message: 'Return your function. Last line should be: return extractToolUses;' };
  }
  const cases = [
    {
      name: 'all text, no tool_use',
      input: { content: [{ type: 'text', text: 'Hello.' }] },
      expected: []
    },
    {
      name: 'one tool_use',
      input: { content: [
        { type: 'text', text: 'Looking up.' },
        { type: 'tool_use', id: 'tu_1', name: 'get_weather', input: { city: 'Paris' } }
      ]},
      expected: [{ id: 'tu_1', name: 'get_weather', input: { city: 'Paris' } }]
    },
    {
      name: 'two tool_use blocks, parallel call',
      input: { content: [
        { type: 'tool_use', id: 'tu_a', name: 'lookup', input: { q: 'a' } },
        { type: 'tool_use', id: 'tu_b', name: 'lookup', input: { q: 'b' } }
      ]},
      expected: [
        { id: 'tu_a', name: 'lookup', input: { q: 'a' } },
        { id: 'tu_b', name: 'lookup', input: { q: 'b' } }
      ]
    },
    {
      name: 'mixed content with text in between',
      input: { content: [
        { type: 'text', text: 'I need two things.' },
        { type: 'tool_use', id: 'tu_x', name: 'one', input: {} },
        { type: 'text', text: 'And then:' },
        { type: 'tool_use', id: 'tu_y', name: 'two', input: { v: 1 } }
      ]},
      expected: [
        { id: 'tu_x', name: 'one', input: {} },
        { id: 'tu_y', name: 'two', input: { v: 1 } }
      ]
    }
  ];
  for (const c of cases) {
    let actual;
    try { actual = extractFn(c.input); }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { passed: false, message: 'Threw on case "' + c.name + '": ' + message };
    }
    if (JSON.stringify(actual) !== JSON.stringify(c.expected)) {
      return {
        passed: false,
        message: 'Case "' + c.name + '" failed.',
        details: 'expected: ' + JSON.stringify(c.expected) + '\n  actual: ' + JSON.stringify(actual)
      };
    }
  }
  return { passed: true, message: 'All four cases pass. You parsed text-only, single tool_use, parallel tool_use, and mixed content correctly.' };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function testToolDefinition(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const tool = asRecord(result);
  if (!tool) return { passed: false, message: 'Return an object.' };
  if (tool.name !== 'lookup_company') return { passed: false, message: 'name should be exactly "lookup_company".' };
  if (typeof tool.description !== 'string' || tool.description.length < 30) {
    return { passed: false, message: 'description should be a clear, non-trivial string (30+ chars).' };
  }
  const inputSchema = asRecord(tool.input_schema);
  if (!inputSchema || inputSchema.type !== 'object') {
    return { passed: false, message: 'input_schema.type should be "object".' };
  }
  const props = asRecord(inputSchema.properties);
  const domain = props ? asRecord(props.domain) : null;
  if (!props || !domain) return { passed: false, message: 'input_schema.properties.domain is missing.' };
  if (domain.type !== 'string') return { passed: false, message: 'properties.domain.type should be "string".' };
  if (typeof domain.description !== 'string' || domain.description.length < 5) {
    return { passed: false, message: 'properties.domain needs its own description string.' };
  }
  const required = inputSchema.required;
  if (!Array.isArray(required) || !required.includes('domain')) {
    return { passed: false, message: 'input_schema.required should be ["domain"].' };
  }
  return { passed: true, message: 'Solid. Name, description, schema, required field, and a per-property description.' };
}

type DecideNext = (response: { stop_reason?: string | null }) => unknown;

export function testDecideNext(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as DecideNext;
  if (typeof fn !== 'function') return { passed: false, message: 'Return decideNext.' };
  const cases = [
    { input: { stop_reason: 'end_turn' }, want: 'show_user' },
    { input: { stop_reason: 'tool_use' }, want: 'run_tools' },
    { input: { stop_reason: 'max_tokens' }, want: 'cap_hit' },
    { input: { stop_reason: 'stop_sequence' }, want: 'unknown' },
    { input: { stop_reason: 'refusal' }, want: 'unknown' },
    { input: {}, want: 'unknown' },
    { input: { stop_reason: null }, want: 'unknown' }
  ];
  for (const c of cases) {
    const got = fn(c.input);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong return for stop_reason=' + JSON.stringify(c.input.stop_reason ?? null),
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }
  return { passed: true, message: 'Switch handles all five known stop reasons plus the unknown / missing case.' };
}

export function testRealCall(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const text = result;
  if (typeof text !== 'string') return { passed: false, message: 'Return the text string from the response.' };
  if (!/289/.test(text)) {
    return {
      passed: false,
      message: 'The text does not contain "289".',
      details: 'returned: ' + text.slice(0, 200)
    };
  }
  return { passed: true, message: 'Live API call succeeded and the model returned the correct answer (289). Your BYOK badge is unlocked.' };
}
