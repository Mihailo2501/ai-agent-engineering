import type { TrackId } from './tracks';

export interface Module {
  id: string;          // 'm01' through 'm25'
  num: string;         // '01' through '25'
  slug: string;        // url slug, e.g. 'primitives'
  title: string;
  lead: string;
  track: TrackId;
  available: boolean;  // gates clickability on the home hub
}

export const MODULES: Module[] = [
  // Track 1 — Foundations
  { id: 'm01', num: '01', slug: 'primitives', title: 'Primitives', lead: 'How an LLM call actually works. Stateless, probabilistic, bounded.', track: 'foundations', available: true },
  { id: 'm02', num: '02', slug: 'inference', title: 'Inference', lead: 'Forward pass, decoding, sampling at the mechanism level. Providers, latency, cost.', track: 'foundations', available: false },
  { id: 'm03', num: '03', slug: 'agent-patterns', title: 'Agent patterns', lead: 'Workflow vs agent vs chain. Subagents. Orchestrator-worker, evaluator-optimizer, parallel, routing.', track: 'foundations', available: true },
  { id: 'm04', num: '04', slug: 'prompt-engineering', title: 'Prompt engineering for agents', lead: 'System prompt design, instruction ordering, ReAct, persona, temperature strategy.', track: 'foundations', available: true },
  { id: 'm05', num: '05', slug: 'multimodal', title: 'Multimodal and reasoning models', lead: 'Vision, image gen, audio basics, extended-thinking blocks, image-to-code.', track: 'foundations', available: false },

  // Track 2 — Interfaces
  { id: 'm06', num: '06', slug: 'api-sdk-cli-mcp', title: 'API · SDK · CLI · MCP', lead: 'The four interface shapes. How they nest. When each one beats the others.', track: 'interfaces', available: false },
  { id: 'm07', num: '07', slug: 'harnesses', title: 'Harnesses', lead: 'Claude Code, Codex, Cursor, n8n, raw SDK loop. What a harness adds.', track: 'interfaces', available: false },
  { id: 'm08', num: '08', slug: 'claude-code-surface', title: 'Claude Code extension surface', lead: 'Skills, plugins, hooks, slash commands, settings.json, MCP integration.', track: 'interfaces', available: false },
  { id: 'm09', num: '09', slug: 'managed-platforms', title: 'Managed agent platforms', lead: 'Claude Agent SDK, OpenAI Agent Builder, Google Agentspace. When to reach for managed.', track: 'interfaces', available: false },

  // Track 3 — Building
  { id: 'm10', num: '10', slug: 'tool-design', title: 'Tool design at scale', lead: 'Descriptions as prompts, schemas, errors, gating, building over 50+ tools.', track: 'building', available: false },
  { id: 'm11', num: '11', slug: 'memory-retrieval', title: 'Memory and retrieval', lead: 'Short and long term, RAG, vector stores, summarization, embeddings.', track: 'building', available: false },
  { id: 'm12', num: '12', slug: 'structured-output', title: 'Structured output', lead: 'JSON mode, schemas, when tool use beats structured output.', track: 'building', available: false },
  { id: 'm13', num: '13', slug: 'browser-automation', title: 'Browser and web automation', lead: 'Stagehand, Browserbase, Playwright. Primitives vs LLM-driven act mode.', track: 'building', available: false },
  { id: 'm14', num: '14', slug: 'voice-realtime', title: 'Voice and realtime agents', lead: 'Realtime API, Vapi, Retell, ASR/TTS pipelines, phone agents.', track: 'building', available: false },
  { id: 'm15', num: '15', slug: 'async-agents', title: 'Background and async agents', lead: 'Inngest, Trigger.dev, cron-driven, long-running state.', track: 'building', available: false },

  // Track 4 — Production
  { id: 'm16', num: '16', slug: 'evaluation', title: 'Evaluation and testing', lead: 'Golden datasets, LLM-as-judge, regression tests, behavioral evals.', track: 'production', available: false },
  { id: 'm17', num: '17', slug: 'cost-economics', title: 'Cost economics', lead: 'Token math, model routing, batch API, building durable products on inference.', track: 'production', available: false },
  { id: 'm18', num: '18', slug: 'security-adversarial', title: 'Security and adversarial', lead: 'Prompt injection, jailbreaks, output validation, PII.', track: 'production', available: false },
  { id: 'm19', num: '19', slug: 'observability', title: 'Observability and deployment', lead: 'Logging, alerts, latency SLOs, agent rollouts.', track: 'production', available: false },

  // Track 5 — Applied
  { id: 'm20', num: '20', slug: 'open-source-models', title: 'Open source models and Hugging Face', lead: 'HF Hub, subscription, Ollama, LM Studio, quantization.', track: 'applied', available: false },
  { id: 'm21', num: '21', slug: 'coding-agents', title: 'Coding agents in depth', lead: 'Claude Code internals, Codex, Cursor, Aider, SWE-bench.', track: 'applied', available: false },
  { id: 'm22', num: '22', slug: 'gtm-agent-1', title: 'GTM agent build #1', lead: 'Specific agent TBD.', track: 'applied', available: false },
  { id: 'm23', num: '23', slug: 'gtm-agent-2', title: 'GTM agent build #2', lead: 'Specific agent TBD.', track: 'applied', available: false },
  { id: 'm24', num: '24', slug: 'gtm-agent-3', title: 'GTM agent build #3', lead: 'Specific agent TBD.', track: 'applied', available: false },
  { id: 'm25', num: '25', slug: 'potter-case-study', title: 'Potter case study', lead: 'Three runtimes, design decisions, MCP architecture.', track: 'applied', available: false }
];

export const TOTAL_MODULES = MODULES.length;
export const MODULE_IDS = MODULES.map((m) => m.id);

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}
