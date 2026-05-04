import type { TrackId } from './tracks';

export interface Module {
  id: string;          // 'm01' through 'm25'
  num: string;         // '01' through '25'
  slug: string;        // url slug, e.g. 'primitives'
  title: string;
  lead: string;
  track: TrackId;
  available: boolean;  // gates clickability on the home hub
  minutes: number;     // estimated reading + sandbox time
}

export const MODULES: Module[] = [
  // Track 1 · Foundations
  { id: 'm01', num: '01', slug: 'primitives', title: 'Primitives', lead: 'How an LLM call actually works. Stateless, probabilistic, bounded.', track: 'foundations', available: true, minutes: 35 },
  { id: 'm02', num: '02', slug: 'inference', title: 'Inference', lead: 'Forward pass, decoding, sampling at the mechanism level. Providers, latency, cost.', track: 'foundations', available: true, minutes: 35 },
  { id: 'm03', num: '03', slug: 'agent-patterns', title: 'Agent patterns', lead: 'Workflow vs agent vs chain. Subagents. Orchestrator-worker, evaluator-optimizer, parallel, routing.', track: 'foundations', available: true, minutes: 30 },
  { id: 'm04', num: '04', slug: 'prompt-engineering', title: 'Prompt engineering for agents', lead: 'System prompt design, instruction ordering, ReAct, persona, temperature strategy.', track: 'foundations', available: true, minutes: 30 },
  { id: 'm05', num: '05', slug: 'multimodal', title: 'Multimodal and reasoning models', lead: 'Vision, image gen, audio basics, extended-thinking blocks, image-to-code.', track: 'foundations', available: true, minutes: 30 },

  // Track 2 · Interfaces
  { id: 'm06', num: '06', slug: 'api-sdk-cli-mcp', title: 'API · SDK · CLI · MCP', lead: 'The four interface shapes. How they nest. When each one beats the others.', track: 'interfaces', available: true, minutes: 25 },
  { id: 'm07', num: '07', slug: 'harnesses', title: 'Harnesses', lead: 'Claude Code, Codex, Cursor, n8n, raw SDK loop. What a harness adds.', track: 'interfaces', available: true, minutes: 30 },
  { id: 'm08', num: '08', slug: 'claude-code-surface', title: 'Claude Code extension surface', lead: 'Skills, plugins, hooks, slash commands, settings.json, MCP integration.', track: 'interfaces', available: true, minutes: 40 },
  { id: 'm09', num: '09', slug: 'managed-platforms', title: 'Managed agent platforms', lead: 'Claude Agent SDK, OpenAI Agent Builder, Google Agentspace. When to reach for managed.', track: 'interfaces', available: true, minutes: 30 },

  // Track 3 · Building
  { id: 'm10', num: '10', slug: 'tool-design', title: 'Tool design at scale', lead: 'Descriptions as prompts, schemas, errors, gating, building over 50+ tools.', track: 'building', available: true, minutes: 35 },
  { id: 'm11', num: '11', slug: 'memory-retrieval', title: 'Memory and retrieval', lead: 'Short and long term, RAG, vector stores, summarization, embeddings.', track: 'building', available: true, minutes: 40 },
  { id: 'm12', num: '12', slug: 'structured-output', title: 'Structured output', lead: 'JSON mode, schemas, when tool use beats structured output.', track: 'building', available: true, minutes: 35 },
  { id: 'm13', num: '13', slug: 'browser-automation', title: 'Browser and web automation', lead: 'Stagehand, Browserbase, Playwright. Primitives vs LLM-driven act mode.', track: 'building', available: true, minutes: 35 },
  { id: 'm14', num: '14', slug: 'voice-realtime', title: 'Voice and realtime agents', lead: 'Realtime API, Vapi, Retell, ASR/TTS pipelines, phone agents.', track: 'building', available: true, minutes: 35 },
  { id: 'm15', num: '15', slug: 'async-agents', title: 'Background and async agents', lead: 'Inngest, Trigger.dev, cron-driven, long-running state.', track: 'building', available: true, minutes: 35 },

  // Track 4 · Production
  { id: 'm16', num: '16', slug: 'evaluation', title: 'Evaluation and testing', lead: 'Golden datasets, LLM-as-judge, regression tests, behavioral evals.', track: 'production', available: true, minutes: 35 },
  { id: 'm17', num: '17', slug: 'cost-economics', title: 'Cost economics', lead: 'Token math, model routing, batch API, building durable products on inference.', track: 'production', available: true, minutes: 35 },
  { id: 'm18', num: '18', slug: 'security-adversarial', title: 'Security and adversarial', lead: 'Prompt injection, jailbreaks, output validation, PII.', track: 'production', available: true, minutes: 35 },
  { id: 'm19', num: '19', slug: 'observability', title: 'Observability and deployment', lead: 'Logging, alerts, latency SLOs, agent rollouts.', track: 'production', available: true, minutes: 35 },

  // Track 5 · Applied
  { id: 'm20', num: '20', slug: 'open-source-models', title: 'Open source models and Hugging Face', lead: 'HF Hub, subscription, Ollama, LM Studio, quantization.', track: 'applied', available: true, minutes: 30 },
  { id: 'm21', num: '21', slug: 'coding-agents', title: 'Coding agents in depth', lead: 'Claude Code internals, Codex, Cursor, Aider, SWE-bench.', track: 'applied', available: true, minutes: 30 },
  { id: 'm22', num: '22', slug: 'gtm-agent-1', title: 'GTM agent: personalized cold email drafter', lead: 'Per-lead Potter research, persona-matched email composition, dry-run before Gmail draft creation. No paid SaaS required.', track: 'applied', available: true, minutes: 45 },
  { id: 'm23', num: '23', slug: 'gtm-agent-2', title: 'GTM agent: weekly funding monitor', lead: 'Cron-driven scan, ICP filter, per-company deep research, Monday Slack digest.', track: 'applied', available: true, minutes: 45 },
  { id: 'm24', num: '24', slug: 'gtm-agent-3', title: 'GTM agent: meeting prep', lead: 'Calendar webhook, per-attendee Potter research, Slack DM 30 minutes before meeting.', track: 'applied', available: true, minutes: 45 },
  { id: 'm25', num: '25', slug: 'potter-case-study', title: 'Potter case study', lead: 'Three runtimes, design decisions, MCP architecture.', track: 'applied', available: true, minutes: 35 }
];

export const TOTAL_MODULES = MODULES.length;
export const MODULE_IDS = MODULES.map((m) => m.id);
export const TOTAL_MINUTES = MODULES.reduce((sum, m) => sum + m.minutes, 0);

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}
