import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';

interface SchemaShape {
  [field: string]: { type: 'string' | 'number' | 'boolean'; required: boolean };
}

interface ValidationResult {
  ok: boolean;
  errors: string[];
}

type ValidateFn = (obj: unknown, schema: SchemaShape) => ValidationResult;
type PickOutputModeFn = (task: { kind: string }) => unknown;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function ThreeModesDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Three ways to ask for structured output</p>
      <p className="mb-4 text-sm text-ink-700">
        Same extraction task, three different mechanisms. Reliability climbs left to right; complexity does too.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-clay-peach/40 p-4">
          <p className="mb-2 font-heading text-base text-ink-900">1. Prompt-only</p>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">"Output JSON. Schema: ..."</p>
          <p className="mb-2 text-xs text-ink-700">What you ask:</p>
          <pre className="mb-3 overflow-x-auto rounded-lg bg-white/60 p-2 font-mono text-xs">{`User: Output JSON
{ amount, currency, vendor }
"Paid $1,250 USD to Acme."`}</pre>
          <p className="text-xs text-ink-700"><strong>Reliability:</strong> medium. Works for simple shapes. Breaks under stress (long context, deep schemas, max_tokens cuts). Markdown code fences are a frequent failure mode.</p>
        </div>
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">2. response_format / JSON mode</p>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">API-enforced schema</p>
          <p className="mb-2 text-xs text-ink-700">What you ask:</p>
          <pre className="mb-3 overflow-x-auto rounded-lg bg-white/60 p-2 font-mono text-xs">{`response_format: {
  type: "json_schema",
  schema: { ... }
}`}</pre>
          <p className="text-xs text-ink-700"><strong>Reliability:</strong> high for the cases the API supports. Schema validation server-side; no markdown wrap. Provider implementations vary (OpenAI strict, Anthropic via tool-use commonly).</p>
        </div>
        <div className="rounded-xl bg-clay-mint p-4">
          <p className="mb-2 font-heading text-base text-ink-900">3. Tool-use as extraction</p>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">Force a "submit_x" tool</p>
          <p className="mb-2 text-xs text-ink-700">What you ask:</p>
          <pre className="mb-3 overflow-x-auto rounded-lg bg-white/60 p-2 font-mono text-xs">{`tools: [{ name: "submit_invoice", input_schema: ... }]
tool_choice: { type: "tool", name: "submit_invoice" }`}</pre>
          <p className="text-xs text-ink-700"><strong>Reliability:</strong> highest. Universal across models that support tools. The model also gets to "explain its reasoning" via a text block before the tool_use, which often improves extraction quality.</p>
        </div>
      </div>
    </section>
  );
}

export function SchemaBuilder() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Anatomy of an extraction schema</p>
      <p className="mb-4 text-sm text-ink-700">Click each field to see its purpose, validation, and common mistake.</p>
      <KeyExplainer
        entries={[
          {
            id: 'type',
            label: 'type',
            body: 'Top-level type for the schema. For extraction, almost always "object". The model fills the named fields; arrays and primitives belong inside properties, not at the top level.'
          },
          {
            id: 'properties',
            label: 'properties',
            body: 'The named fields. Each gets its own type and description. Per-field descriptions are read by the model when filling values; treat each one like a tool description for that field.'
          },
          {
            id: 'amount',
            label: 'amount (number)',
            body: 'Numeric field. Type: "number". Description: "The total amount on the invoice, as a number without currency symbols." Specifying without-currency-symbols matters: models otherwise paste "$1,250" as a string.'
          },
          {
            id: 'currency',
            label: 'currency (enum)',
            body: 'Closed-set field. Type: "string", enum: ["USD", "EUR", "GBP", "..."]. Enum is more reliable than free-form "must be ISO 4217" because the model attends to enums explicitly.'
          },
          {
            id: 'vendor',
            label: 'vendor (string)',
            body: 'Free-form string. Type: "string". Description specifies trim and capitalization expectations: "Vendor or supplier name, trimmed, in title case." The model honors description constraints reliably for short strings.'
          },
          {
            id: 'required',
            label: 'required',
            body: 'Array of field names the model must fill. Validated server-side by the API on most providers. The model may still skip required fields under stress; client-side validation (Zod, Pydantic) is defense in depth.'
          }
        ]}
      >
        <pre className="overflow-x-auto rounded-xl bg-[#1A2530] p-4 font-mono text-xs text-white">
          <code>
            {`{
  "`}
            <KeyExplainerKey id="type">type</KeyExplainerKey>
            {`": "object",
  "`}
            <KeyExplainerKey id="properties">properties</KeyExplainerKey>
            {`": {
    "`}
            <KeyExplainerKey id="amount">amount</KeyExplainerKey>
            {`": { "type": "number", "description": "Invoice total, no currency symbols" },
    "`}
            <KeyExplainerKey id="currency">currency</KeyExplainerKey>
            {`": { "type": "string", "enum": ["USD", "EUR", "GBP"] },
    "`}
            <KeyExplainerKey id="vendor">vendor</KeyExplainerKey>
            {`": { "type": "string", "description": "Vendor name, trimmed, title case" }
  },
  "`}
            <KeyExplainerKey id="required">required</KeyExplainerKey>
            {`": ["amount", "currency", "vendor"]
}`}
          </code>
        </pre>
      </KeyExplainer>
    </section>
  );
}

export function testExtractWithTool(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const obj = asRecord(result);
  if (!obj) {
    return { passed: false, message: 'Return the extracted invoice object (the input from the tool_use block).', details: 'got ' + JSON.stringify(result) };
  }
  const amount = obj.amount;
  if (typeof amount !== 'number' || Math.round(amount) !== 1250) {
    return {
      passed: false,
      message: 'amount should be 1250 (the model should ignore the comma and currency symbol).',
      details: 'got ' + JSON.stringify(amount)
    };
  }
  const currency = typeof obj.currency === 'string' ? obj.currency.toUpperCase() : '';
  if (currency !== 'USD') {
    return {
      passed: false,
      message: 'currency should be "USD".',
      details: 'got ' + JSON.stringify(obj.currency)
    };
  }
  const vendor = typeof obj.vendor === 'string' ? obj.vendor.toLowerCase() : '';
  if (!vendor.includes('acme')) {
    return {
      passed: false,
      message: 'vendor should contain "Acme" (the prompt mentioned "Acme Corp").',
      details: 'got ' + JSON.stringify(obj.vendor)
    };
  }
  return {
    passed: true,
    message: 'Tool-use extraction works. Forcing tool_choice gave you a typed object instead of a parsed string.'
  };
}

export function testValidate(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ValidateFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return validate.' };

  const schema: SchemaShape = {
    name: { type: 'string', required: true },
    age: { type: 'number', required: true },
    active: { type: 'boolean', required: false }
  };

  // Valid object
  const okResult = fn({ name: 'Mihailo', age: 28, active: true }, schema);
  if (!okResult || okResult.ok !== true || !Array.isArray(okResult.errors) || okResult.errors.length !== 0) {
    return {
      passed: false,
      message: 'Valid object should return { ok: true, errors: [] }.',
      details: 'got ' + JSON.stringify(okResult)
    };
  }

  // Missing required
  const missing = fn({ name: 'X' }, schema);
  if (!missing || missing.ok !== false || !Array.isArray(missing.errors) || missing.errors.length === 0) {
    return {
      passed: false,
      message: 'Missing required field should return { ok: false, errors: [...] } with at least one error mentioning the missing field.',
      details: 'got ' + JSON.stringify(missing)
    };
  }
  if (!missing.errors.some((e) => /age/i.test(e))) {
    return {
      passed: false,
      message: 'Error message should mention the missing field name (age).',
      details: 'got errors ' + JSON.stringify(missing.errors)
    };
  }

  // Type mismatch
  const wrongType = fn({ name: 'X', age: 'twenty' }, schema);
  if (!wrongType || wrongType.ok !== false || !Array.isArray(wrongType.errors) || wrongType.errors.length === 0) {
    return {
      passed: false,
      message: 'Type mismatch should return { ok: false, errors: [...] }.',
      details: 'got ' + JSON.stringify(wrongType)
    };
  }
  if (!wrongType.errors.some((e) => /age/i.test(e) && /(number|type)/i.test(e))) {
    return {
      passed: false,
      message: 'Error should mention the field and the type expectation.',
      details: 'got errors ' + JSON.stringify(wrongType.errors)
    };
  }

  // Optional field missing is allowed
  const okMissingOptional = fn({ name: 'X', age: 5 }, schema);
  if (!okMissingOptional || okMissingOptional.ok !== true) {
    return {
      passed: false,
      message: 'Optional field (active) missing should be allowed; ok should be true.',
      details: 'got ' + JSON.stringify(okMissingOptional)
    };
  }

  // Extra fields allowed by default
  const extra = fn({ name: 'X', age: 5, surplus: 'whatever' }, schema);
  if (!extra || extra.ok !== true) {
    return {
      passed: false,
      message: 'Extra unknown fields should be allowed by default; ok should still be true.',
      details: 'got ' + JSON.stringify(extra)
    };
  }

  return {
    passed: true,
    message: 'Validator handles required, type checks, optional fields, and extras correctly.'
  };
}

export function testPickOutputMode(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickOutputModeFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickOutputMode.' };

  const cases = [
    { task: { kind: 'simple-keyvalue-extraction' }, want: 'response-format', why: 'Simple extraction with a flat schema is response_format territory' },
    { task: { kind: 'extract-or-take-other-action' }, want: 'tool-use', why: 'When the model decides between extraction and another action, tool-use is the right shape' },
    { task: { kind: 'quick-prototype-no-sla' }, want: 'prompt-only', why: 'Quick prototype, no reliability SLA, prompt-only is fine' },
    { task: { kind: 'extract-from-long-document' }, want: 'response-format', why: 'Schema-constrained extraction at length is response_format' },
    { task: { kind: 'agent-mid-conversation-with-many-tools' }, want: 'tool-use', why: 'Mid-conversation extraction belongs in the tool-use loop' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong output mode for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'response-format') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "response-format", the safe default for production extraction.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Output mode routing matches the reliability-versus-flexibility trade: prompt-only for quick, response_format for production extraction, tool-use for in-loop work.'
  };
}
