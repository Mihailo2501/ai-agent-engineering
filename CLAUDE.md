# AI Agent Engineering — Project Context

## What this is

A self-paced, open-source course on AI agent engineering. Built around the Claude API as the reference primitive, with Potter (Mihailo's own MCP server) as the running case study. Goal: ship a polished public repo people can clone and learn from, and a personal study tool that gets Mihailo to depth on the topics he hasn't yet mastered.

**Brand:** AI Agent Engineering. **Repo:** `ai-agent-engineering` (GitHub handle TBD). **License:** MIT.

**Distribution:** open source. Users clone the repo and run locally. **Not hosted anywhere.** No GitHub Pages, no Vercel, no Netlify. The course lives as files on disk that anyone can fork and browse offline.

**Architecture today (interim):** pure HTML / CSS / vanilla JS, no build step. One HTML file per module. Optimized for AI-authoring: one file = one module = one Claude session.

**Architecture after content-complete:** once all 13 modules are written and reviewed, refactor the static shell to a modern React SPA (Vite + React Router + MDX or similar). Keep all content; replace duplicated head / progress strip / footer / scripts with a shared layout. Module data unifies into a single manifest. Deploy story does not change (still local-only or self-hosted, never GitHub Pages).

**Primary audience:** the user — Mihailo, GTM engineer going full-time April 1 2026, target placements at Kiln or Kiln clients. **Secondary audience:** other GTM engineers / Claude Code users / Clay graduates who want depth beyond vibe-coding.

## Locked decisions

These were worked through earlier — do not re-litigate without Mihailo's explicit say-so:

- 13 modules, one session per module
- Design 3 (Dark Terminal — black bg, neon-orange accent, JetBrains Mono headings) is the locked aesthetic. Other 3 designs are exploration artifacts only.
- localStorage-based progress + badges. Minimum-viable gamification: progress bar, completion checkmarks, light badges. Skip XP, levels, streaks.
- Real CodeMirror 6 sandboxes for hands-on exercises. Two execution modes:
  - In-browser JS for structural exercises (build a tool definition, parse content blocks, write a stop_reason switch)
  - BYOK Anthropic API for "build a real agent loop" exercises. User's key in localStorage, sent with `anthropic-dangerous-direct-browser-access: true`
- Mermaid.js for technical diagrams; hand-written SVG for anything Mermaid can't do. **No image generation.** Codex is not used for diagram creation.
- Public push to GitHub deferred until the course is content-complete. Local-only until then.
- MIT license matching Potter convention.
- **No hosting.** Open source repo for local clone-and-run. Don't suggest GitHub Pages, Vercel, or any other host.
- **React SPA migration is planned after M01-M13 are content-complete**, not before. Static HTML is the interim authoring format because it is AI-authoring friendly. Do not migrate or partially refactor mid-course.

## Curriculum (13 modules)

```
Foundations
  M01  Primitives — LLM call, loop, tools, stop reasons, context, streaming
  M02  Agent patterns — workflow vs agent, subagents, orchestrator-worker, parallel
  M03  Prompt engineering for agents — system design, ReAct, persona, temp strategy

Interfaces & harnesses
  M04  API · SDK · CLI · MCP — the four interface shapes
  M05  Harnesses — Claude Code, Codex, Cursor, n8n, raw SDK loop
  M06  Claude Code extension surface — skills, plugins, hooks, slash commands, settings.json
  M07  Managed agent platforms — Claude Agent SDK, OpenAI Agent Builder, Google Agentspace

Tools, memory, automation
  M08  Tool design at scale — descriptions as prompts, schemas, errors, gating, 50+ tools
  M09  Memory and retrieval — short / long-term, RAG, vector stores, summarization
  M10  Browser & web automation — Stagehand, primitives vs LLM-driven act, Browserbase

Production
  M11  Evaluation & testing — golden sets, LLM-as-judge, regression, red-team
  M12  Cost, security, observability — token economics, prompt injection, audit, deployment

Case study
  M13  Potter through this lens — three runtimes, design decisions, MCP architecture
```

## Hard rules — apply without re-asking

- **Never reference Chillrep, Chillmax, or that company in any course content, README, or page.** That conversation was the spark for the project; it is not the topic. No mention by name, no "the kind of role that pays for this", no oblique reference. The course stands on its own as a learning artifact for AI agent engineering broadly.
- **No em dashes anywhere.** Not in body prose, not in code comments, not in titles, not in alt text. Use commas, colons, semicolons, or split sentences. Inherited from global rules; called out here because em dashes feel natural in instructional prose and need active resistance.
- **No competitor mentions in the course content.** Same rule as Potter spec. Discuss platforms by their own names (Claude Agent SDK, OpenAI Agent Builder, Stagehand) — do not frame them as superior or inferior to anything Mihailo has built.
- **No images, illustrations, or generated artwork.** Diagrams are Mermaid syntax or hand-written SVG. Keep it text-first.
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
