import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface CalendarAttendee {
  email: string;
  name?: string;
}

interface CalendarEvent {
  attendees: CalendarAttendee[];
  organizer: { email: string };
}

type ExtractFn = (event: CalendarEvent, internalDomains: string[]) => CalendarAttendee[];
type ScheduleFn = (meetingStart: string, leadMinutes?: number) => string;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function BriefBrowserDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Anatomy of a meeting brief</p>
      <p className="mb-4 text-sm text-ink-700">
        Click each section to see what the agent fills in and why it is there.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'who',
            label: 'Attendee · who they are',
            body: 'Name, role, current tenure at the company, prior background. Pulled from potter_research_person. The agent prefers tenure ("Head of Growth at Acme since 2024") over titles alone because tenure tells you whether they are still ramping or established.'
          },
          {
            id: 'company-status',
            label: 'Company status · what is happening',
            body: 'Stage, recent funding, headcount, hiring trajectory, recent product launches. Pulled from potter_research_company plus potter_web_search for last-week news. The "what is happening" framing matters: stale data ("they raised in 2022") is less useful than current motion ("they posted a hiring spike last month").'
          },
          {
            id: 'recent-posts',
            label: 'Recent LinkedIn posts · personality and topics',
            body: 'Last 5 posts from potter_summarize_linkedin_posts. The summary captures personality, topics they care about, and any specific things they are advocating for or skeptical of. Often the single most useful section for opening the conversation naturally.'
          },
          {
            id: 'recent-news',
            label: 'Recent news · last-week coverage',
            body: 'Press hits, product announcements, partnership news. Pulled from potter_web_search filtered to the last 7-14 days. Useful when the news is fresh enough to mention without sounding rehearsed.'
          },
          {
            id: 'hooks',
            label: 'Conversation hooks · specific things to mention',
            body: 'Two to three concrete facts that work as openers. "I saw your team just shipped X" or "Congrats on the Series B last month". The agent extracts these from the research blob; the salesperson picks one based on rapport read in the moment.'
          },
          {
            id: 'questions',
            label: 'Suggested questions · 3 to 5 open-ended',
            body: 'Tied to the attendee\'s recent activity, not generic ("what brings you here today"). Examples: "I saw the team is hiring three product engineers; what is the priority shape for that?" Specific questions show preparation; generic ones signal you skipped the prep.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="who">Attendee · who they are</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="company-status">Company status</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="recent-posts">Recent LinkedIn posts</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="recent-news">Recent news</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="hooks">Conversation hooks</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="questions">Suggested questions</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function WebhookLifecycleStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Webhook lifecycle</p>
        <p className="text-sm text-ink-700">
          Trace one calendar event from booking to Slack DM, with the timing alignment that gets the brief in front of you 30 minutes before the call.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'tool',
            title: '1. Calendly webhook fires',
            body: 'A new event hits Calendly: someone booked a 30-minute call. Calendly POSTs the event payload to the agent\'s webhook endpoint within seconds. The payload contains organizer, attendees, event time, calendar timezone.'
          },
          {
            actor: 'team',
            title: '2. Event ingested',
            body: 'Inngest receives the webhook, deduplicates by event id (so a re-delivered webhook does not re-trigger the agent), and creates an event record. Subsequent steps are durable.'
          },
          {
            actor: 'team',
            title: '3. Attendees parsed',
            body: 'The attendees array is read from the payload. Each attendee has an email plus an optional display name. The organizer is identified separately and excluded from the research target list.'
          },
          {
            actor: 'team',
            title: '4. External filter applied',
            body: 'Internal-domain check: skip anyone whose email domain matches the user\'s internal domains. Multi-domain orgs need the list maintained explicitly. The remainder is the research target list (typically 1-3 attendees).'
          },
          {
            actor: 'tool',
            title: '5. Per-attendee Potter research',
            body: 'Parallel calls per attendee: potter_research_person, potter_research_company (using the email domain), potter_summarize_linkedin_posts, potter_web_search. Cached per attendee for 30 days; recent caches are reused with a freshness note.'
          },
          {
            actor: 'model',
            title: '6. Brief composed',
            body: 'Tool-use extraction (Module 12) produces the structured brief: attendee_name, role, company_status, recent_posts, recent_news, conversation_hooks, suggested_questions. One brief per external attendee; aggregated into a single Slack DM body.'
          },
          {
            actor: 'team',
            title: '7. Delivery scheduled',
            body: 'Compute the delivery time: meeting_start minus 30 minutes, in the meeting\'s timezone. Inngest "step.sleepUntil" pauses the workflow until that exact time. No polling; no cron; just a durable wait.'
          },
          {
            actor: 'user',
            title: '8. Slack DM lands',
            body: 'Thirty minutes before the call, the brief lands in the user\'s Slack DM. They read on the way to the meeting. Optional: brief expires from Slack 24 hours after meeting end for ephemeral delivery.'
          }
        ]}
      />
    </div>
  );
}

export function testExtractExternalAttendees(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ExtractFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return extractExternalAttendees.' };

  // Mixed: one internal, one external, organizer is internal
  const e1: CalendarEvent = {
    organizer: { email: 'me@kiln.gtm' },
    attendees: [
      { email: 'alex@acme.com', name: 'Alex' },
      { email: 'colleague@kiln.gtm', name: 'Colleague' },
      { email: 'me@kiln.gtm', name: 'Me' }
    ]
  };
  const out1 = fn(e1, ['kiln.gtm']);
  if (!Array.isArray(out1) || out1.length !== 1 || out1[0].email !== 'alex@acme.com') {
    return {
      passed: false,
      message: 'Expected only the external attendee (alex@acme.com).',
      details: JSON.stringify(out1)
    };
  }

  // All internal
  const e2: CalendarEvent = {
    organizer: { email: 'me@kiln.gtm' },
    attendees: [
      { email: 'colleague@kiln.gtm', name: 'A' },
      { email: 'me@kiln.gtm', name: 'Me' }
    ]
  };
  const out2 = fn(e2, ['kiln.gtm']);
  if (!Array.isArray(out2) || out2.length !== 0) {
    return { passed: false, message: 'All-internal event should return [].' };
  }

  // Multi-domain internal
  const e3: CalendarEvent = {
    organizer: { email: 'me@kiln.gtm' },
    attendees: [
      { email: 'a@kiln.gtm', name: 'A' },
      { email: 'b@kiln.io', name: 'B' },
      { email: 'c@external.com', name: 'C' }
    ]
  };
  const out3 = fn(e3, ['kiln.gtm', 'kiln.io']);
  if (!Array.isArray(out3) || out3.length !== 1 || out3[0].email !== 'c@external.com') {
    return {
      passed: false,
      message: 'Multi-domain internal should filter all internal domains.',
      details: JSON.stringify(out3)
    };
  }

  // Empty attendees
  const e4: CalendarEvent = { organizer: { email: 'me@kiln.gtm' }, attendees: [] };
  const out4 = fn(e4, ['kiln.gtm']);
  if (!Array.isArray(out4) || out4.length !== 0) {
    return { passed: false, message: 'Empty attendees should return [].' };
  }

  // Case insensitive domain match
  const e5: CalendarEvent = {
    organizer: { email: 'me@kiln.gtm' },
    attendees: [
      { email: 'A@KILN.GTM', name: 'A' },
      { email: 'b@external.com', name: 'B' }
    ]
  };
  const out5 = fn(e5, ['kiln.gtm']);
  if (!Array.isArray(out5) || out5.length !== 1 || out5[0].email !== 'b@external.com') {
    return {
      passed: false,
      message: 'Domain match should be case-insensitive.',
      details: JSON.stringify(out5)
    };
  }

  return {
    passed: true,
    message: 'External-attendee filter works: skips organizer, filters internal domains case-insensitively, handles multi-domain orgs.'
  };
}

export async function testComposeBrief(result: unknown, lines: RunLine[]): Promise<Verdict> {
  void lines;
  const obj = asRecord(result);
  if (!obj) {
    return {
      passed: false,
      message: 'Return the brief object (the input from the tool_use block).',
      details: 'got ' + JSON.stringify(result)
    };
  }

  const required = [
    'attendee_name',
    'role',
    'company_name',
    'company_status',
    'conversation_hooks',
    'suggested_questions'
  ];

  for (const field of required) {
    if (!(field in obj)) {
      return {
        passed: false,
        message: 'Brief is missing required field "' + field + '".',
        details: JSON.stringify(obj)
      };
    }
  }

  const questions = obj.suggested_questions;
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 5) {
    return {
      passed: false,
      message: 'suggested_questions should be an array of 3 to 5 items.',
      details: JSON.stringify(questions)
    };
  }

  const hooks = obj.conversation_hooks;
  if (!Array.isArray(hooks) || hooks.length === 0) {
    return {
      passed: false,
      message: 'conversation_hooks should be a non-empty array.',
      details: JSON.stringify(hooks)
    };
  }

  // Check that questions are not all generic
  const generic = ['what brings you here today', 'tell me about yourself', 'what are your goals'];
  const allGeneric = questions.every((q: unknown) => {
    const text = typeof q === 'string' ? q.toLowerCase() : '';
    return generic.some((g) => text.includes(g));
  });
  if (allGeneric) {
    return {
      passed: false,
      message: 'Questions are all generic. The system prompt should constrain to specific, research-grounded questions.',
      details: JSON.stringify(questions)
    };
  }

  return {
    passed: true,
    message: 'Brief structure is correct: required fields present, suggested_questions in [3, 5], conversation_hooks non-empty, questions not all generic.'
  };
}

export function testScheduleDelivery(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ScheduleFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return scheduleDeliveryAt.' };

  // Default 30 minute lead
  const start1 = '2026-05-01T15:00:00.000Z';
  const out1 = fn(start1);
  if (typeof out1 !== 'string') {
    return { passed: false, message: 'Return an ISO timestamp string.' };
  }
  const expected1 = new Date('2026-05-01T14:30:00.000Z').toISOString();
  if (new Date(out1).toISOString() !== expected1) {
    return {
      passed: false,
      message: 'Default 30-minute lead should return meeting_start - 30 minutes.',
      details: 'expected ' + expected1 + ', got ' + out1
    };
  }

  // Explicit 15-minute lead
  const out2 = fn(start1, 15);
  const expected2 = new Date('2026-05-01T14:45:00.000Z').toISOString();
  if (new Date(out2).toISOString() !== expected2) {
    return {
      passed: false,
      message: '15-minute lead should return meeting_start - 15 minutes.',
      details: 'expected ' + expected2 + ', got ' + out2
    };
  }

  // Timezone-aware ISO input
  const start3 = '2026-05-01T17:00:00+02:00';
  const out3 = fn(start3, 30);
  const expected3 = new Date('2026-05-01T14:30:00.000Z').toISOString();
  if (new Date(out3).toISOString() !== expected3) {
    return {
      passed: false,
      message: 'TZ-aware input should be respected. 17:00 +02:00 is 15:00 UTC; minus 30 is 14:30 UTC.',
      details: 'expected ' + expected3 + ', got ' + out3
    };
  }

  return {
    passed: true,
    message: 'Delivery scheduling math holds: default 30-minute lead, explicit lead, and TZ-aware ISO inputs.'
  };
}
