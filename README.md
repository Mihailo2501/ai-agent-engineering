# AI Agent Engineering

A self-paced, open-source course on building real AI agents with the Claude API. Thirteen modules, one HTML file each, full interactive sandboxes where you write code that runs against your own Anthropic API key. No build step, no auth, no backend. Open `index.html` and learn.

## What you will be able to do after this course

- Read a Claude API call and explain every field
- Implement a real agentic loop from scratch in twenty lines
- Tell the difference between an API, an SDK, a CLI, and an MCP server, and pick the right shape for a job
- Design tools that the model actually picks correctly
- Compose subagents and parallel patterns instead of one-shot prompts
- Wire Claude Code together with skills, plugins, hooks, slash commands, and MCP
- Build evaluations that catch regressions before users do
- Deploy an agent without leaking secrets, exhausting budgets, or trusting input from tools

## What is in the box

```
Foundations
  M01  Primitives                  Available
  M02  Agent patterns              Coming soon
  M03  Prompt engineering          Coming soon

Interfaces and harnesses
  M04  API · SDK · CLI · MCP       Coming soon
  M05  Harnesses                   Coming soon
  M06  Claude Code extensions      Coming soon
  M07  Managed agent platforms     Coming soon

Tools, memory, automation
  M08  Tool design at scale        Coming soon
  M09  Memory and retrieval        Coming soon
  M10  Browser and web automation  Coming soon

Production
  M11  Evaluation and testing      Coming soon
  M12  Cost, security, observability  Coming soon

Case study
  M13  Potter through this lens    Coming soon
```

Each module is a single HTML file with prose, code samples, mermaid diagrams, interactive demos, and runnable code sandboxes with hidden tests that verify your solution.

## Quick start

Clone, then open `index.html` in a browser. That is the whole setup.

```bash
git clone https://github.com/<your-github>/ai-agent-engineering.git
cd ai-agent-engineering
open index.html
```

If you want to run it from a local web server instead of `file://`, the bundled npm script uses Python's built-in HTTP server:

```bash
npm run serve
# then open http://localhost:8080
```

The repo has zero npm dependencies. The `package.json` is metadata plus the convenience script.

## Sandboxes

Most modules contain runnable code sandboxes. Two execution modes:

1. **In-browser JavaScript.** Structural exercises (build a tool definition, parse content blocks, write a stop_reason switch). Code runs in a sandboxed scope in your browser. No data leaves the page.
2. **BYOK Anthropic API.** "Build a real agent loop" exercises that hit the actual `/v1/messages` endpoint. You paste your own Anthropic API key once, it lives in your browser's localStorage, and requests go directly from your browser to Anthropic with the `anthropic-dangerous-direct-browser-access` header.

Hidden tests verify your solution. Pass = green, fail = explanation of what is off.

## What this course is not

- Not a tutorial on prompt-only LLM use. We assume you have written prompts before. The first hour you can already build a chatbot. This course starts where that ends.
- Not an introduction to programming. Reading and writing JavaScript is a prerequisite.
- Not a vendor pitch. Specific platforms get covered when they teach something useful, not because they are sponsoring anything.

## Progress and badges

Your completion state is stored in your browser's localStorage. The course hub shows which modules are done, which sandboxes you have passed, and badges you have earned. Clear localStorage to reset.

Nothing is uploaded anywhere. There is no account, no telemetry, no leaderboard. This is a single-player learning tool.

## Stack

- Vanilla HTML, CSS, and JavaScript. No bundler, no framework.
- [CodeMirror 6](https://codemirror.net) for the code editor, loaded from a CDN.
- [Mermaid.js](https://mermaid.js.org) for diagrams, loaded from a CDN.
- The Anthropic SDK is not used at runtime. Sandboxes call the API directly via `fetch`.

## Contributing

The course is being authored module-by-module. Issues and pull requests welcome once the v1 curriculum is content-complete. For now, the safest contribution is reading a module, finding something wrong, and opening an issue with the page name and the line that confused you.

## License

MIT. See [LICENSE](LICENSE).

## Author

Built by [Mihailo Skenzic](https://github.com/<your-github>) as a study aid for his own transition into AI agent engineering full-time. If you find it useful, that is a happy externality. If you find it wrong, please tell him.
