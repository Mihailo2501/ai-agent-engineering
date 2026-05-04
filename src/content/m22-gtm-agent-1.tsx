import type { RunLine, Verdict } from '../lib/sandbox/types';
import Stepper from '../components/stepper';

interface EmailLead {
  email: string;
  first_name: string;
  last_name: string;
}

interface BuildEmailDraftInput {
  lead: EmailLead;
  subject: string;
  body: string;
}

type BuildEmailDraftFn = (input: BuildEmailDraftInput) => unknown;

interface PreFlightInput {
  message: string;
  subject: string;
}

interface PreFlightVerdict {
  ok: boolean;
  blockers: string[];
}

type PreFlightFn = (input: PreFlightInput) => PreFlightVerdict;

const BANNED_PHRASES = [
  'just wanted to',
  'i came across',
  'i hope this',
  'circling back',
  'reaching out to',
  'touching base'
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+(?:\s|$)/g);
  return matches ? matches.length : 1;
}

export function OutboundRunStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">End-to-end outbound run</p>
        <p className="text-sm text-ink-700">
          Trace one lead from a CSV row to an approved Gmail draft, with the dry-run gate before any external write.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'team',
            title: 'Read CSV',
            body: 'A row arrives: email, first_name, last_name, LinkedIn URL, optional company domain. The agent normalizes the email and assigns an idempotency key based on that address so reruns dedupe.'
          },
          {
            actor: 'tool',
            title: 'Potter research',
            body: 'Parallel calls gather person context, company context, and recent activity. The recent post hook is especially valuable because it gives the email a concrete first sentence.'
          },
          {
            actor: 'model',
            title: 'Claude composition',
            body: 'System prompt holds the voice rules: short sentences, no em dashes, no LLM-tells, subject under 80 characters, and a required hook reference. User content is the research blob plus the lead.'
          },
          {
            actor: 'team',
            title: 'Pre-flight check',
            body: 'Validate before writing a draft. Block if the subject is empty or too long, the body has more than 3 sentences, the body contains an em dash, or the body contains a banned phrase.'
          },
          {
            actor: 'team',
            title: 'Gmail draft built',
            body: 'Construct a local draft object with to, subject, body, and an X-Idempotency-Key header. This is still a dry object in memory, not a Gmail write.'
          },
          {
            actor: 'team',
            title: 'Dry-run logged to Slack',
            body: 'Mandatory dry-run logs the lead, subject, proposed body, and idempotency key to Slack. The batch thread gives reviewers one place to reject or approve.'
          },
          {
            actor: 'user',
            title: 'Human approves',
            body: 'You read the drafts. Reject anything off-tone or over-personalized. Approve in bulk or per lead. Approval flips the write gate.'
          },
          {
            actor: 'tool',
            title: 'Drafts created in Gmail',
            body: 'The Gmail API creates drafts only for approved leads. The human still owns final send, and per-lead audit logs keep run_id plus lead_id correlation.'
          }
        ]}
      />
    </div>
  );
}

export function CostBreakdownDemo() {
  const stages = [
    {
      label: 'Potter providers (per lead)',
      items: [
        { label: 'potter_research_person', cost: 0.04 },
        { label: 'potter_research_company', cost: 0.03 },
        { label: 'potter_summarize_linkedin_posts', cost: 0.03 }
      ]
    },
    {
      label: 'Claude email composition (per lead)',
      items: [
        { label: 'Sonnet, ~3K cached input + 200 output', cost: 0.04 }
      ]
    },
    {
      label: 'Gmail drafts',
      items: [
        { label: 'Gmail API: free at any normal volume.', cost: 0 }
      ]
    }
  ];

  const perLead =
    stages[0].items.reduce((s, i) => s + i.cost, 0) + stages[1].items.reduce((s, i) => s + i.cost, 0);
  const batch50 = perLead * 50;

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Cost-per-lead breakdown</p>
      <p className="mb-4 text-sm text-ink-700">
        Numbers are illustrative. Verify provider pricing on the day you commit; this gets you in the right ballpark.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-xl bg-clay-cream p-4">
            <p className="mb-2 font-heading text-base text-ink-900">{stage.label}</p>
            {stage.items.map((item) => (
              <div key={item.label} className="mb-1 flex items-center justify-between gap-3 text-sm text-ink-700">
                <span>{item.label}</span>
                <span className="font-mono">${item.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-accent-coral/15 p-4">
        <span className="font-heading text-base text-ink-900">Per lead (variable)</span>
        <span className="font-mono text-lg text-ink-900">${perLead.toFixed(2)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-clay-cream p-4">
        <span className="font-heading text-base text-ink-900">50-lead batch (variable)</span>
        <span className="font-mono text-lg text-ink-900">${batch50.toFixed(2)}</span>
      </div>
    </section>
  );
}

export async function testWritePersonalizedMessage(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  if (typeof result !== 'string' || !result.trim()) {
    return {
      passed: false,
      message: 'Return the assistant email body as a string.',
      details: 'got ' + JSON.stringify(result)
    };
  }
  const text = result;
  const lower = text.toLowerCase();

  if (/[\u2014\u2013]/.test(text)) {
    return {
      passed: false,
      message: 'Message contains an em dash or en dash. Banned token.',
      details: text
    };
  }

  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        passed: false,
        message: 'Message contains banned LLM-tell "' + phrase + '".',
        details: text
      };
    }
  }

  const sentences = countSentences(text);
  if (sentences > 3) {
    return {
      passed: false,
      message: 'Message is more than 3 sentences (got ' + sentences + ').',
      details: text
    };
  }

  if (!/(remotion|gtm movie|video)/i.test(text)) {
    return {
      passed: false,
      message: 'Message should reference the recent_post hook from the research blob: Remotion, GTM Movie, or video.',
      details: text
    };
  }

  return {
    passed: true,
    message: 'Email body is short, on-voice, and references something specific from the research blob.'
  };
}

export function testBuildEmailDraft(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as BuildEmailDraftFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return buildEmailDraft.' };

  const message =
    'Saw your Remotion post on video personalization. We are building GTM Movie for per-lead demos. Worth a quick look?';
  const input = {
    lead: { email: 'alex@example.com', first_name: 'Alex', last_name: 'Doe' },
    subject: 'Quick thought on GTM Movie',
    body: message
  };

  const draft = asRecord(fn(input));
  if (!draft) {
    return { passed: false, message: 'Return an object draft.' };
  }
  if (draft.to !== 'alex@example.com') {
    return { passed: false, message: 'Draft should include to: lead.email.', details: JSON.stringify(draft) };
  }
  if (draft.subject !== input.subject) {
    return { passed: false, message: 'Draft should preserve the subject.', details: JSON.stringify(draft) };
  }
  if (typeof draft.body !== 'string' || !draft.body.includes(message)) {
    return { passed: false, message: 'Draft body should contain the message text.', details: JSON.stringify(draft.body) };
  }
  const headers = asRecord(draft.headers);
  if (!headers || typeof headers['X-Idempotency-Key'] !== 'string' || !headers['X-Idempotency-Key']) {
    return {
      passed: false,
      message: 'Draft headers should include a non-empty X-Idempotency-Key.',
      details: JSON.stringify(draft.headers)
    };
  }

  const sameEmailDraft = asRecord(fn({
    lead: { email: 'alex@example.com', first_name: 'Alex', last_name: 'Doe' },
    subject: 'Different subject',
    body: 'Different body'
  }));
  const otherEmailDraft = asRecord(fn({
    lead: { email: 'sam@example.com', first_name: 'Sam', last_name: 'Roe' },
    subject: input.subject,
    body: input.body
  }));
  const key = headers['X-Idempotency-Key'];
  const sameHeaders = sameEmailDraft ? asRecord(sameEmailDraft.headers) : null;
  const otherHeaders = otherEmailDraft ? asRecord(otherEmailDraft.headers) : null;
  const sameKey = sameHeaders ? sameHeaders['X-Idempotency-Key'] : null;
  const otherKey = otherHeaders ? otherHeaders['X-Idempotency-Key'] : null;

  if (sameKey !== key) {
    return {
      passed: false,
      message: 'Idempotency key should be stable for the same email.',
      details: 'first ' + JSON.stringify(key) + ', second ' + JSON.stringify(sameKey)
    };
  }
  if (otherKey === key) {
    return {
      passed: false,
      message: 'Idempotency key should be derived from the email, so a different email should not reuse the same key.',
      details: 'key ' + JSON.stringify(key)
    };
  }

  return {
    passed: true,
    message: 'Gmail draft shape is correct: to, subject, body, and a stable per-email idempotency header.'
  };
}

export function testPreFlight(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PreFlightFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return preFlightCheck.' };

  const ok = fn({
    message: 'Saw your Remotion post. We are building GTM Movie. Worth a quick look?',
    subject: 'Quick thought on GTM Movie'
  });
  if (!ok || ok.ok !== true || !Array.isArray(ok.blockers) || ok.blockers.length !== 0) {
    return {
      passed: false,
      message: 'Clean message and subject should return { ok: true, blockers: [] }.',
      details: JSON.stringify(ok)
    };
  }

  const dashed = fn({
    message: 'Hey \u2014 saw your post.',
    subject: 'Quick thought'
  });
  if (!dashed || dashed.ok !== false || !dashed.blockers.some((b) => /dash/i.test(b))) {
    return {
      passed: false,
      message: 'Em dash should produce a blocker mentioning "dash".',
      details: JSON.stringify(dashed)
    };
  }

  const long = fn({
    message: 'Hey there. Saw your post. Wanted to chat. About a thing. We are building.',
    subject: 'Quick thought'
  });
  if (!long || long.ok !== false || !long.blockers.some((b) => /sentence/i.test(b))) {
    return {
      passed: false,
      message: 'More than 3 sentences should produce a blocker mentioning "sentence".',
      details: JSON.stringify(long)
    };
  }

  const banned = fn({
    message: 'Just wanted to say hi. Cool post.',
    subject: 'Quick thought'
  });
  if (!banned || banned.ok !== false || !banned.blockers.some((b) => /banned|phrase|tell/i.test(b))) {
    return {
      passed: false,
      message: 'A banned LLM-tell should produce a blocker mentioning "banned" or "phrase".',
      details: JSON.stringify(banned)
    };
  }

  const emptySubject = fn({
    message: 'Saw your post. Quick thought to share. Worth a chat?',
    subject: '   '
  });
  if (!emptySubject || emptySubject.ok !== false || !emptySubject.blockers.some((b) => /subject/i.test(b))) {
    return {
      passed: false,
      message: 'Empty subject should produce a blocker mentioning "subject".',
      details: JSON.stringify(emptySubject)
    };
  }

  const longSubject = fn({
    message: 'Saw your post. Quick thought to share. Worth a chat?',
    subject: 'This subject line is intentionally far too long for the pre-flight check because it exceeds eighty characters'
  });
  if (!longSubject || longSubject.ok !== false || !longSubject.blockers.some((b) => /subject/i.test(b))) {
    return {
      passed: false,
      message: 'Subject longer than 80 characters should produce a blocker mentioning "subject".',
      details: JSON.stringify(longSubject)
    };
  }

  return {
    passed: true,
    message: 'Pre-flight catches em dashes, more than 3 sentences, banned LLM-tells, and bad subject lines.'
  };
}
