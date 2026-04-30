# AI Agent Engineering — Project Context

## What this is

A self-paced, open-source course on AI agent engineering. Built around the Claude API as the reference primitive, with Potter (Mihailo's own MCP server) as the running case study. Goal: ship a polished public repo people can clone and learn from, and a personal study tool that gets Mihailo to depth on the topics he hasn't yet mastered.

**Brand:** AI Agent Engineering. **Repo:** `ai-agent-engineering` (GitHub handle TBD). **License:** MIT.

**Distribution:** open source. Users clone the repo and run locally. **Not hosted anywhere.** No GitHub Pages, no Vercel, no Netlify. The course lives as files on disk that anyone can fork and browse offline.

**Architecture (active build target):** React SPA (Vite + React Router + MDX or similar). Module content lives as MDX or JSX components. A shared layout owns the head, progress strip, footer, and script wiring. Module data unifies into a single manifest. Existing static modules (M01-M03) port to the new shell during the design pass. M04 onward author directly into React.

**Distribution unchanged:** open source local-only, no hosting. The React build outputs static files that still open from disk or self-host trivially; the no-hosting decision is unaffected by the framework choice.

**Primary audience:** the user — Mihailo, GTM engineer going full-time April 1 2026, target placements at Kiln or Kiln clients. **Secondary audience:** other GTM engineers / Claude Code users / Clay graduates who want depth beyond vibe-coding.

## Locked decisions

These were worked through earlier — do not re-litigate without Mihailo's explicit say-so:

- 25 modules across 5 tracks. Build pace flexible: conceptual modules can batch 3-5 per session. The three GTM agent builds in Track 5 (M22 LinkedIn outbound via HeyReach, M23 weekly funding monitor, M24 meeting prep) are one session each because they involve real working agents against Mihailo's actual stack (Potter, HeyReach, Anthropic API, calendar webhooks).
- **Design system: Clay-inspired (locked 2026-04-30).** Reference mockup at `~/Desktop/aiae-design-pass/aiae-home-a-clay.png`. Pastel multi-hue palette, rounded XL panels, soft drop shadows, friendly robot mascot, per-track pastel grouping. Dark Terminal aesthetic is fully retired; old M01-M03 visual styling will be replaced during the React port. Do not propose alternative aesthetic directions without explicit ask.
- localStorage-based progress + badges. Minimum-viable gamification: progress bar, completion checkmarks, light badges. Skip XP, levels, streaks.
- Real CodeMirror 6 sandboxes for hands-on exercises. Two execution modes:
  - In-browser JS for structural exercises (build a tool definition, parse content blocks, write a stop_reason switch)
  - BYOK Anthropic API for "build a real agent loop" exercises. User's key in localStorage, sent with `anthropic-dangerous-direct-browser-access: true`
- Diagrams stay Mermaid + hand-written SVG. Visual chrome (badges, hero graphics, illustrative imagery) IS generated via GPT image 2 through Codex. Image generation is for design assets, not for technical diagrams.
- Public push to GitHub deferred until the course is content-complete. Local-only until then.
- MIT license matching Potter convention.
- **No hosting.** Open source repo for local clone-and-run. Don't suggest GitHub Pages, Vercel, or any other host.

## Curriculum (25 modules, 5 tracks)

The course expanded from 13 to 25 modules to give inference, multimodal, structured output, voice agents, async agents, open-source models, and applied GTM work each their own dedicated treatment.

```
Track 1 — Foundations (5)
  M01  Primitives — LLM call, loop, tools, stop reasons, context, streaming
  M02  Inference — forward pass, decoding, sampling at the mechanism level; providers; latency vs cost
  M03  Agent patterns — workflow vs agent, subagents, orchestrator-worker, parallel, routing
  M04  Prompt engineering for agents — system design, ReAct, persona, temperature strategy
  M05  Multimodal & reasoning models — vision, image gen, audio, extended-thinking blocks, image-to-code

Track 2 — Interfaces (4)
  M06  API · SDK · CLI · MCP — the four interface shapes, how they nest
  M07  Harnesses — Claude Code, Codex, Cursor, n8n, raw SDK loop
  M08  Claude Code extension surface — skills, plugins, hooks, slash commands, settings.json
  M09  Managed agent platforms — Claude Agent SDK, OpenAI Agent Builder, Google Agentspace

Track 3 — Building (6)
  M10  Tool design at scale — descriptions as prompts, schemas, errors, gating, 50+ tools
  M11  Memory and retrieval — short / long-term, RAG, vector stores, summarization
  M12  Structured output — JSON mode, schemas, when tool use beats structured output
  M13  Browser & web automation — Stagehand, primitives vs LLM-driven act, Browserbase
  M14  Voice & realtime agents — Realtime API, Vapi, Retell, ASR/TTS pipelines, phone agents
  M15  Background & async agents — Inngest, Trigger.dev, cron-driven, long-running state

Track 4 — Production (4)
  M16  Evaluation & testing — golden sets, LLM-as-judge, regression, red-team
  M17  Cost economics — token math, model routing, batch API, durable products on inference
  M18  Security & adversarial — prompt injection, jailbreaks, output validation, PII
  M19  Observability & deployment — logging, alerts, latency SLOs, agent rollouts

Track 5 — Applied (6)
  M20  Open source models & Hugging Face — HF Hub, subscription, Ollama, LM Studio, quantization
  M21  Coding agents in depth — Claude Code internals, Codex, Cursor, Aider, SWE-bench
  M22  GTM agent: LinkedIn outbound via HeyReach (research + persona-matched message + dry-run + enroll)
  M23  GTM agent: weekly funding monitor (cron + ICP filter + Potter research + Slack digest)
  M24  GTM agent: meeting prep (calendar webhook + per-attendee Potter research + Slack DM brief 30 min before)
  M25  Potter case study — three runtimes, design decisions, MCP architecture
```

Old → new mapping for the existing M01-M03 content: M01 stays M01; old M02 (Agent patterns) becomes new M03; old M03 (Prompt engineering) becomes new M04. The old M12 (Cost, security, observability) splits into new M17, M18, M19. The old M13 (Potter) becomes new M25. Everything else is new authoring.

## Hard rules — apply without re-asking

- **Never reference Chillrep, Chillmax, or that company in any course content, README, or page.** That conversation was the spark for the project; it is not the topic. No mention by name, no "the kind of role that pays for this", no oblique reference. The course stands on its own as a learning artifact for AI agent engineering broadly.
- **No em dashes anywhere.** Not in body prose, not in code comments, not in titles, not in alt text. Use commas, colons, semicolons, or split sentences. Inherited from global rules; called out here because em dashes feel natural in instructional prose and need active resistance.
- **No competitor mentions in the course content.** Same rule as Potter spec. Discuss platforms by their own names (Claude Agent SDK, OpenAI Agent Builder, Stagehand) — do not frame them as superior or inferior to anything Mihailo has built.
- **Diagrams stay text-first.** Mermaid or hand-written SVG only; no AI-generated diagrams. Visual chrome (badges, hero graphics, decorative imagery) MAY use AI-generated images via GPT image 2 through Codex. Generated images are part of the design system, not part of teaching content.
- **Single-source content.** Every module is one HTML file at the project root. No content lives in CSS, JS, or anywhere except the page it teaches on (and shared snippets in `/js`).

## File layout

```
/
├── CLAUDE.md
├── README.md
├── LICENSE                     # MIT
├── .gitignore
├── package.json                # metadata only, no deps
├── index.html                  # course hub: progress, badges, module list
├── module-01.html              # one HTML file per module
├── module-02.html              # ...
├── module-13.html
├── css/
│   └── style.css               # design 3 (dark terminal), single shared stylesheet
└── js/
    ├── progress.js             # localStorage progress + completion tracking
    ├── badges.js               # badge unlock + display
    ├── sandbox.js              # CodeMirror 6 init, JS exec, Anthropic BYOK
    └── mermaid-init.js         # Mermaid.js bootstrap
```

File naming is kebab-case throughout. CSS and JS are vanilla. Mermaid is loaded from CDN. CodeMirror 6 is loaded from CDN (no bundler). No Node runtime needed for the course itself.

## Module authoring template

Every module HTML file follows this structure:

1. `<head>` — standard, links to `/css/style.css` and `/js/progress.js`, `/js/badges.js`, `/js/sandbox.js`, `/js/mermaid-init.js`
2. **Hero** — kicker, h1, lead paragraph, progress bar
3. **Table of contents** — anchor links to sections
4. **Sections** — h2 numbered, prose, code blocks, callouts, mermaid diagrams, sandboxes
5. **Sandboxes** — at least 2 per module, real exercises with hidden test verification
6. **Glossary** — 8 to 12 key terms
7. **Check yourself** — 6 to 10 click-to-reveal questions
8. **Module complete** — button that unlocks the next module + awards a badge
9. **Footer** — module N / 13, link to course hub, link to next module

Sessions for Modules 02 to 13 are filling in content against this template, not rebuilding infrastructure. If you find yourself re-architecting JS or CSS during a content module, stop and flag it.

## Code standards (inherited from global CLAUDE.md)

- JavaScript / vanilla browser. No TypeScript, no bundler, no build step.
- kebab-case file names throughout
- No silent failures — log full error context to console
- Single responsibility per JS file
- Prefer editing existing files over creating new ones
- Don't add features the task did not request

## When in doubt

- Re-read this file before reopening a locked decision
- Err toward less scope, not more
- Content over chrome — every line of prose, every sandbox, every mermaid diagram should teach something
- Trust the curriculum — do not invent new modules mid-build
