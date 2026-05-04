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

- 25 modules across 5 tracks. Build pace flexible: conceptual modules can batch 3-5 per session. The three GTM agent builds in Track 5 (M22 personalized cold email drafter via Gmail drafts, M23 weekly funding monitor, M24 meeting prep) are one session each because they involve real working agents against Mihailo's actual stack (Potter, Gmail API, Anthropic API, calendar webhooks). M22 originally targeted HeyReach but was rewritten to drop paid SaaS dependencies; the loop patterns survived.
- **Design system: Clay-inspired (locked 2026-04-30).** Reference mockup at `docs/design/aiae-home-clay.png` (gitignored, local-only). Pastel multi-hue palette, rounded XL panels, soft drop shadows, friendly robot mascot, per-track pastel grouping. Dark Terminal aesthetic is fully retired; old M01-M03 visual styling will be replaced during the React port. Do not propose alternative aesthetic directions without explicit ask.
- localStorage-based progress + badges. Minimum-viable gamification: progress bar, completion checkmarks, light badges. Skip XP, levels, streaks.
- **Badge taxonomy: 14 total** (5 track-complete + 5 milestones + 4 themed module badges). No per-module badges for the other 21. Renders as a 2x7 grid on the home page badges shelf. Full list and rationale in memory at `project_badges_locked.md`. The starter 7-badge set in `react-scaffold/src/data/badges.ts` will be replaced when artwork is generated.
- Real CodeMirror 6 sandboxes for hands-on exercises. Two execution modes:
  - In-browser JS for structural exercises (build a tool definition, parse content blocks, write a stop_reason switch)
  - BYOK Anthropic API for "build a real agent loop" exercises. User's key lives in `sessionStorage` by default (clears on tab close); a "remember on this device" toggle opts into `localStorage`. Sent with `anthropic-dangerous-direct-browser-access: true`.
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
  M22  GTM agent: cold email drafter via Gmail drafts (research + persona-matched message + dry-run + create draft)
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
├── LICENSE                          # MIT
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── .gitignore
├── .github/workflows/ci.yml         # typecheck + build on push/PR
├── docs/design/                     # design references (gitignored mockups)
└── react-scaffold/                  # the app
    ├── package.json
    ├── vite.config.ts
    ├── index.html                   # SPA shell (head, OG, favicon)
    ├── public/
    │   └── illustrations/           # PNGs for modules, tracks, stats, badges
    └── src/
        ├── routes.tsx               # all routes
        ├── pages/                   # home, module pages, glossary
        ├── components/              # layout, sandbox, mermaid, footer, etc
        ├── content/                 # one .mdx + one .tsx per module
        ├── data/                    # modules.ts manifest, badges.ts, glossary
        └── lib/                     # progress, badges, sandbox/anthropic-client
```

File naming is kebab-case throughout. The React app is the only runtime; everything ships through Vite. No vanilla HTML at the project root.

## Module authoring template

Every module is one `.mdx` file plus one matching `.tsx` in `react-scaffold/src/content/`. The MDX owns prose, callouts, code blocks, mermaid diagrams, and sandbox embeds. The TSX owns interactive demo components, custom widgets, and any per-module React logic the MDX imports. Modules are listed in `src/data/modules.ts` and routed via `src/routes.tsx`.

Module body structure:

1. **Hero** (handled by shared `ModuleHero` component): kicker, title, lead paragraph, time estimate, progress strip
2. **Sections**: numbered `<Section>` blocks, prose, code, callouts, mermaid, sandboxes
3. **Sandboxes**: at least 2 per module, real exercises with hidden test verification (`<Sandbox>`)
4. **Glossary terms**: declared inline so the global glossary can index them
5. **Check yourself**: click-to-reveal questions (`<CheckYourself>`)
6. **Module complete**: `<CompleteBanner>` that marks completion and awards any badges
7. **ModuleNav**: prev/next module links

If you find yourself re-architecting layout, sandbox, or progress code during a content module, stop and flag it.

## Code standards (inherited from global CLAUDE.md)

- TypeScript + React 19 + Vite 7. MDX for content. Tailwind 4 for styling.
- kebab-case file names throughout
- No silent failures: log full error context to console
- Single responsibility per file
- Prefer editing existing files over creating new ones
- Don't add features the task did not request
- Mermaid is lazy-loaded; CodeMirror 6 backs the sandboxes

## When in doubt

- Re-read this file before reopening a locked decision
- Err toward less scope, not more
- Content over chrome — every line of prose, every sandbox, every mermaid diagram should teach something
- Trust the curriculum — do not invent new modules mid-build
