import { useState } from 'react';
import type { RunLine, Verdict } from '../lib/sandbox/types';
import Stepper from '../components/stepper';

interface Company {
  industry: string;
  stage: string;
  geography: string;
  headcount: number;
}

interface ICP {
  industries: string[];
  stages: string[];
  geographies: string[];
  headcountMin: number;
  headcountMax: number;
}

interface ScoreResult {
  score: number;
  rationale: string;
}

type ScoreFn = (input: { company: Company; icp: ICP }) => ScoreResult;

interface RawResearch {
  company_name: string;
  raise_amount?: string;
  round_type?: string;
  rationale?: string;
  founder?: { name: string; role: string };
  recent_post?: string;
  signals?: { hiring?: boolean; product_launch?: boolean };
}

interface Brief {
  company: string;
  raise_amount: string;
  round_type: string;
  why_relevant: string;
  decision_maker: string;
  hook_for_outbound: string;
  recommended_action: string;
}

type FormatFn = (raw: RawResearch) => Brief;

interface Raise {
  company_name: string;
  company_url: string;
  raise_amount: string;
  round_type: string;
}

type DedupeFn = (currentWeek: Raise[], lastWeek: Raise[]) => Raise[];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const ACME_AI: Company = {
  industry: 'B2B SaaS',
  stage: 'Series A',
  geography: 'US',
  headcount: 45
};

const SAMPLE_ICP: ICP = {
  industries: ['B2B SaaS', 'Developer Tools'],
  stages: ['Seed', 'Series A', 'Series B'],
  geographies: ['US', 'EU'],
  headcountMin: 20,
  headcountMax: 200
};

function scoreCompany(company: Company, icp: ICP): ScoreResult {
  let matches = 0;
  const reasons: string[] = [];
  if (icp.industries.includes(company.industry)) {
    matches++;
    reasons.push('industry match');
  }
  if (icp.stages.includes(company.stage)) {
    matches++;
    reasons.push('stage match');
  }
  if (icp.geographies.includes(company.geography)) {
    matches++;
    reasons.push('geography match');
  }
  if (company.headcount >= icp.headcountMin && company.headcount <= icp.headcountMax) {
    matches++;
    reasons.push('headcount in range');
  }
  const score = matches + 1;
  const rationale = matches === 0 ? 'No ICP fields match' : reasons.join(', ');
  return { score, rationale };
}

export function WeeklyRunStepper() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Weekly run lifecycle</p>
        <p className="text-sm text-ink-700">
          Trace one Monday morning from cron tick to Slack delivery, including the dedupe and ICP filter.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'tool',
            title: '1. Cron fires Monday 06:00',
            body: 'Inngest cron triggers the workflow. The week is computed from the previous Sunday 00:00 to this Sunday 23:59. The run gets a stable run_id like "funding-2026-W18".'
          },
          {
            actor: 'tool',
            title: '2. Fetch raises from sources',
            body: 'Apify scrapers pull TechCrunch funding news; RSS feeds aggregate from Crunchbase News, VentureBeat, and major outlets. The output is a flat list of raises with name, URL, amount, round, source URL, date.'
          },
          {
            actor: 'team',
            title: '3. Dedupe by canonical URL',
            body: 'Compare against last week\'s set (stored in Postgres or a flat JSON file). Canonical URL is lowercase, no www, no trailing slash. New raises survive; recurring entries drop.'
          },
          {
            actor: 'model',
            title: '4. ICP filter and relevance scoring',
            body: 'Each raise gets scored 1 to 5 against the ICP rubric (industry, stage, geography, headcount range). Cheap classifier turn (Haiku). Threshold of 4 advances to deep research.'
          },
          {
            actor: 'tool',
            title: '5. Per-company research fan-out',
            body: 'For each pass-filter company in parallel: potter_research_company (firmographic + recent news), potter_research_person on the founder(s), potter_web_scrape on the funding announcement, potter_summarize_linkedin_posts for personality and topics.'
          },
          {
            actor: 'model',
            title: '6. Brief generation',
            body: 'Tool-use extraction (Module 12). Output schema: company, raise_amount, round_type, why_relevant, decision_maker, hook_for_outbound, recommended_action. One brief per qualified raise.'
          },
          {
            actor: 'team',
            title: '7. Slack delivery + PDF artifact',
            body: 'Monday 09:00 (after the cron + research finishes). Slack message: ranked list, top 5 with brief snippets and PDF attachments rendered via Remotion + Cloudflare R2. The salesperson reads over coffee and picks the top 2 to chase.'
          }
        ]}
      />
    </div>
  );
}

export function ICPScoringDemo() {
  const [company, setCompany] = useState<Company>(ACME_AI);
  const [icp] = useState<ICP>(SAMPLE_ICP);
  const result = scoreCompany(company, icp);

  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · ICP relevance scoring</p>
      <p className="mb-4 text-sm text-ink-700">
        Edit the company fields. Watch the rubric score update against the ICP definition.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">Company under review</p>
          <div className="space-y-2 text-sm">
            <label className="block">
              <span className="text-ink-700">Industry: </span>
              <select
                className="rounded-md border border-ink-500/30 bg-white px-2 py-1"
                value={company.industry}
                onChange={(e) => setCompany((c) => ({ ...c, industry: e.target.value }))}
              >
                <option>B2B SaaS</option>
                <option>Developer Tools</option>
                <option>Consumer</option>
                <option>Healthcare</option>
              </select>
            </label>
            <label className="block">
              <span className="text-ink-700">Stage: </span>
              <select
                className="rounded-md border border-ink-500/30 bg-white px-2 py-1"
                value={company.stage}
                onChange={(e) => setCompany((c) => ({ ...c, stage: e.target.value }))}
              >
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
                <option>Series C</option>
              </select>
            </label>
            <label className="block">
              <span className="text-ink-700">Geography: </span>
              <select
                className="rounded-md border border-ink-500/30 bg-white px-2 py-1"
                value={company.geography}
                onChange={(e) => setCompany((c) => ({ ...c, geography: e.target.value }))}
              >
                <option>US</option>
                <option>EU</option>
                <option>APAC</option>
                <option>LATAM</option>
              </select>
            </label>
            <label className="block">
              <span className="text-ink-700">Headcount: </span>
              <input
                type="number"
                className="w-24 rounded-md border border-ink-500/30 bg-white px-2 py-1"
                value={company.headcount}
                onChange={(e) => setCompany((c) => ({ ...c, headcount: Number(e.target.value) }))}
              />
            </label>
          </div>
        </div>
        <div className="rounded-xl bg-clay-cream p-4">
          <p className="mb-2 font-heading text-base text-ink-900">ICP rubric</p>
          <ul className="text-sm text-ink-700">
            <li>Industries: {icp.industries.join(', ')}</li>
            <li>Stages: {icp.stages.join(', ')}</li>
            <li>Geographies: {icp.geographies.join(', ')}</li>
            <li>Headcount: {icp.headcountMin} to {icp.headcountMax}</li>
          </ul>
          <div className="mt-4 rounded-lg bg-accent-coral/15 p-4">
            <p className="text-sm text-ink-700">Score</p>
            <p className="mb-2 font-heading text-3xl text-ink-900">{result.score} / 5</p>
            <p className="text-sm text-ink-700">{result.rationale}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function testScoreICPFit(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ScoreFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return scoreICPFit.' };

  const icp: ICP = {
    industries: ['B2B SaaS'],
    stages: ['Series A'],
    geographies: ['US'],
    headcountMin: 20,
    headcountMax: 200
  };

  // Perfect
  const perfect = fn({
    company: { industry: 'B2B SaaS', stage: 'Series A', geography: 'US', headcount: 50 },
    icp
  });
  const p = asRecord(perfect);
  if (!p || p.score !== 5 || typeof p.rationale !== 'string' || p.rationale.length === 0) {
    return {
      passed: false,
      message: 'Perfect ICP match should score 5 with a non-empty rationale.',
      details: JSON.stringify(perfect)
    };
  }

  // None match
  const none = fn({
    company: { industry: 'Healthcare', stage: 'Series C', geography: 'APAC', headcount: 1000 },
    icp
  });
  const n = asRecord(none);
  if (!n || n.score !== 1 || typeof n.rationale !== 'string') {
    return {
      passed: false,
      message: 'No ICP fields matching should score 1.',
      details: JSON.stringify(none)
    };
  }

  // Partial: industry + stage = 2 matches -> score 3
  const partial = fn({
    company: { industry: 'B2B SaaS', stage: 'Series A', geography: 'APAC', headcount: 1000 },
    icp
  });
  const pa = asRecord(partial);
  if (!pa || pa.score !== 3) {
    return {
      passed: false,
      message: 'Two ICP fields matching should score 3.',
      details: JSON.stringify(partial)
    };
  }

  // Score is 1-5 inclusive
  if (typeof p.score !== 'number' || p.score < 1 || p.score > 5) {
    return { passed: false, message: 'Score must be in [1, 5].' };
  }

  return {
    passed: true,
    message: 'ICP scoring rewards each matching field; rationale string is present and non-empty.'
  };
}

export function testFormatBrief(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as FormatFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return formatBrief.' };

  const raw: RawResearch = {
    company_name: 'Acme AI',
    raise_amount: '$15M',
    round_type: 'Series A',
    rationale: 'Hiring across go-to-market; recent product launch around video personalization',
    founder: { name: 'Alex Doe', role: 'CEO' },
    recent_post: 'Posted about Remotion and personalized video at scale',
    signals: { hiring: true, product_launch: true }
  };

  const brief = asRecord(fn(raw));
  if (!brief) return { passed: false, message: 'Return a brief object.' };

  const required = [
    'company',
    'raise_amount',
    'round_type',
    'why_relevant',
    'decision_maker',
    'hook_for_outbound',
    'recommended_action'
  ] as const;
  for (const field of required) {
    if (typeof brief[field] !== 'string' || (brief[field] as string).length === 0) {
      return {
        passed: false,
        message: 'brief.' + field + ' should be a non-empty string.',
        details: JSON.stringify(brief)
      };
    }
  }

  if (brief.company !== 'Acme AI') {
    return { passed: false, message: 'brief.company should equal raw.company_name.' };
  }
  if (brief.raise_amount !== '$15M') {
    return { passed: false, message: 'brief.raise_amount should equal raw.raise_amount.' };
  }
  if (typeof brief.decision_maker !== 'string' || !(brief.decision_maker as string).includes('Alex Doe')) {
    return {
      passed: false,
      message: 'brief.decision_maker should reference the founder name.',
      details: JSON.stringify(brief.decision_maker)
    };
  }

  return {
    passed: true,
    message: 'Brief shape is correct: all 7 required fields are non-empty strings, decision_maker references the founder.'
  };
}

export function testDedupeByCanonical(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as DedupeFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return dedupeRaises.' };

  const lastWeek: Raise[] = [
    { company_name: 'Acme AI', company_url: 'https://www.acme.ai/', raise_amount: '$15M', round_type: 'Series A' }
  ];

  const currentWeek: Raise[] = [
    { company_name: 'Acme AI', company_url: 'https://acme.ai', raise_amount: '$15M', round_type: 'Series A' }, // dup
    { company_name: 'Beta Co', company_url: 'https://www.beta.co/', raise_amount: '$8M', round_type: 'Seed' },
    { company_name: 'ACME AI', company_url: 'HTTPS://WWW.ACME.AI/', raise_amount: '$15M', round_type: 'Series A' } // dup with case
  ];

  const out = fn(currentWeek, lastWeek);
  if (!Array.isArray(out)) {
    return { passed: false, message: 'Return an array of new raises.' };
  }
  if (out.length !== 1) {
    return {
      passed: false,
      message: 'Only Beta Co should remain after dedupe; got ' + out.length + ' items.',
      details: JSON.stringify(out)
    };
  }
  if (out[0].company_name !== 'Beta Co') {
    return { passed: false, message: 'The remaining raise should be Beta Co.' };
  }

  return {
    passed: true,
    message: 'Canonical-URL dedupe works: case-insensitive, www-stripped, trailing-slash-tolerant.'
  };
}
