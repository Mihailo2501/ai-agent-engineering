<p align="center">
  <img src="public/illustrations/mascot-hero.png" alt="AI Agent Engineering mascot" width="180" />
</p>

<p align="center">
  <h1 align="center">AI Agent Engineering</h1>
  <p align="center">A self-paced, open-source course on building real AI agents with the Claude API. 25 modules, runnable sandboxes, no hosting.</p>
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Modules" src="https://img.shields.io/badge/modules-25-FF8C66">
  <img alt="Tracks" src="https://img.shields.io/badge/tracks-5-A78BFA">
  <img alt="Stack" src="https://img.shields.io/badge/stack-React%20%2B%20MDX-22D3EE">
</p>

## what it is

A 25-module course covering the full stack of modern AI agent engineering: primitives, inference, tools, memory, structured output, browser and voice agents, async patterns, evaluation, cost, security, observability, open-source models, coding agents, and three concrete GTM agent builds. Every module ships with prose, mermaid diagrams, interactive demos, runnable code sandboxes, a glossary, and check questions.

Built around the Claude API as the reference primitive. BYOK only. Open source under MIT. No hosting, no telemetry, no leaderboard. Clone the repo and run it locally.

## quick start

```bash
git clone https://github.com/Mihailo2501/ai-agent-engineering.git
cd ai-agent-engineering
npm install
npm run dev
# open http://localhost:5173
```

The dev server live-reloads on edits. For a production build:

```bash
npm run build
npm run preview
```

The course runs entirely in the browser. The only external dependency at runtime is the Anthropic API itself, and only for the BYOK sandboxes.

## try it

- Open Module 01 to see how an LLM call actually works, then write your first 20-line agent.
- Open Module 11 to walk through a RAG pipeline stage by stage.
- Open Module 17 and play with the cost calculator (slider for input tokens, output tokens, cache ratio, model choice).
- Open the [Glossary](http://localhost:5173/glossary) for every term in the course, indexed alphabetically with backlinks.

## what is in the box

```
Track 1 · Foundations (5)
  M01  Primitives
  M02  Inference
  M03  Agent patterns
  M04  Prompt engineering for agents
  M05  Multimodal and reasoning models

Track 2 · Interfaces (4)
  M06  API · SDK · CLI · MCP
  M07  Harnesses
  M08  Claude Code extension surface
  M09  Managed agent platforms

Track 3 · Building (6)
  M10  Tool design at scale
  M11  Memory and retrieval
  M12  Structured output
  M13  Browser and web automation
  M14  Voice and realtime agents
  M15  Background and async agents

Track 4 · Production (4)
  M16  Evaluation and testing
  M17  Cost economics
  M18  Security and adversarial
  M19  Observability and deployment

Track 5 · Applied (6)
  M20  Open source models and Hugging Face
  M21  Coding agents in depth
  M22  GTM agent: cold email drafter via Gmail drafts
  M23  GTM agent: weekly funding monitor
  M24  GTM agent: meeting prep
  M25  Potter case study
```

Roughly 14 hours of reading + sandbox time end to end.

## sandbox modes

Most modules ship runnable code sandboxes. Two execution modes:

- **In-browser JavaScript.** Structural exercises (build a tool definition, parse content blocks, write a stop_reason switch, score tool selection). Code runs in a sandboxed scope in your browser. Nothing leaves the page.
- **BYOK Anthropic API.** "Build a real agent loop" exercises that hit the actual `/v1/messages` endpoint. You paste your Anthropic API key once; it stays in your browser's `sessionStorage` by default and clears when you close the tab. Opt into `localStorage` ("remember on this device") if you want it persistent. Requests go directly from your browser to Anthropic with the `anthropic-dangerous-direct-browser-access` header. No proxy, no logging server.

Sandbox code runs in this page's context. Do not paste code from sources you do not trust.

Hidden tests verify your solution. Pass = green; fail = an explanation of what is off.

## stack

- React 19 + Vite 7
- MDX for module content
- Tailwind CSS 4 for styling
- CodeMirror 6 for the code editor
- Mermaid for diagrams (lazy-loaded per module)
- Anthropic API directly via `fetch` (no SDK at runtime)

## progress and badges

Module completion state, sandbox passes, and earned badges live in your browser's `localStorage` under the `aiae:*` namespace. Clear those keys to reset. Nothing is uploaded anywhere; there is no account, no telemetry. Single-player learning tool.

## contributing

The course is content-complete at v1 (25 modules, all sandboxes, full glossary). Issues and pull requests welcome. The most useful contributions: reading a module, finding something wrong or stale, and opening an issue with the module slug and the line that confused you.

## security and data handling

BYOK only. Course code sends your Anthropic API key only to `api.anthropic.com`. Sandbox code runs in this page's context. Do not paste code from sources you do not trust. The repo has no analytics, no error reporting, no third-party scripts at runtime. Progress data is local-only in `localStorage`.

## acknowledgments

I built this to teach myself how AI agents actually work, end to end. The running case study throughout is [Potter](https://github.com/Mihailo2501/potter-mcp), my open-source MCP server.

Visual chrome (mascot, hero illustrations, module icons, track icons, badges) generated via [OpenAI Codex CLI](https://github.com/openai/codex) using GPT image 2. Module content authored with [Claude Code](https://github.com/anthropics/claude-code).

## license

MIT. See [LICENSE](LICENSE).
