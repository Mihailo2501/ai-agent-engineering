# contributing

AI Agent Engineering is an open-source course by Mihailo Skendzic. Maintained by one person in spare time. PRs and issues are welcome when they improve the course, fix bugs, improve the sandbox, or clean up docs. Larger curriculum direction changes get a discussion first so the surface stays coherent.

## repo layout

```text
react-scaffold/
  src/
    components/              # shared React components
    content/                 # module content
      m{NN}-{slug}.mdx       # module prose and lesson content
      m{NN}-{slug}.tsx       # module-specific interactive content
    data/
      modules.ts             # module manifest and ordering
```

`react-scaffold/` is the SPA. Course modules live in `react-scaffold/src/content/` as `m{NN}-{slug}.mdx` and `m{NN}-{slug}.tsx` pairs. Shared components live in `react-scaffold/src/components/`. The module manifest is `react-scaffold/src/data/modules.ts`.

## adding or editing a module

1. Create or edit the `m{NN}-{slug}.mdx` and `m{NN}-{slug}.tsx` pair in `react-scaffold/src/content/`.
2. Add or update the module entry in `react-scaffold/src/data/modules.ts`.
3. Keep module content in its own MDX and TSX pair. Do not spread module-specific content across shared files.
4. Do not use em dashes anywhere in content. Use commas, colons, or split the sentence.
5. Do not reference unrelated prior projects.
6. Do not frame course material around competitors.
7. MDX gotcha: bare `{...}` expressions trigger JSX evaluation. Wrap literal braces in backticks or use code blocks.

## local dev

```bash
cd react-scaffold
npm install
npm run dev
```

## typecheck

```bash
cd react-scaffold
npx tsc --noEmit
```

## build

```bash
cd react-scaffold
npm run build
```

## conventions

- kebab-case file names.
- Single-source-per-module: all module content belongs in its own MDX and TSX pair, not spread across shared files.
- No em dashes.
- No competitor framing.
- Keep shared components generic. Module-specific UI belongs in the module TSX file unless it is reused by multiple modules.
- Write direct prose. Prefer concrete examples over broad claims.
- Keep TypeScript changes typed and local to the feature.

## what PRs are welcome

**Always welcome:**

- New module content that follows the existing structure.
- Bug fixes with a clear reproduction.
- Sandbox improvements.
- Typo fixes and prose cleanup.

**Discussion first:**

- Restructuring the curriculum.
- Adding new tracks.
- Changing the design system.
- Moving content ownership out of the module MDX and TSX pair.

## code review expectations

PRs are reviewed on a best-effort basis. Expect feedback on prose quality as well as code. Course material should be technically accurate, specific, and easy to follow in the local app.

Small PRs are easier to review. If a change touches both curriculum structure and implementation, split it when possible.

## filing issues

Use GitHub Issues on this repo. Include:

```text
- Page or module:
- Expected:
- Got:
- Repro steps:
- Browser and OS, if UI-related:
```

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).

## conduct

This project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## license

MIT license.
