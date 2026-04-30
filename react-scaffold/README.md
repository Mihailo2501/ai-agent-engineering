# AI Agent Engineering — React scaffold

Pre-staged React SPA scaffold. Not yet wired up to actual content. This directory is the target shell for the migration from static HTML modules to a single-page React app.

## Stack (locked in CLAUDE.md)
- React 19 + Vite 5 + React Router 7
- TypeScript everywhere
- MDX for module content (mix prose with `<Sandbox>`, `<Stepper>`, `<KeyExplainer>`, `<PotterAngle>` components)
- Tailwind 4 (via `@tailwindcss/vite`)
- Framer Motion for page transitions and sandbox-pass animations
- CodeMirror 6 for sandbox editors

## Status (checkpoint)
- Configs: package.json, vite.config.ts, tsconfig, tailwind.config — drafted
- Data manifests: modules.ts (all 25), tracks.ts, badges.ts — drafted
- Progress library: ported from js/progress.js to TS, scoped to 25 modules
- Layout shell: app.tsx + routes.tsx — drafted, components are placeholders
- Components: TODO. Real implementation waits on locked design system.
- Module content (MDX): TODO. Waits on Batch 1-4 specs being signed off and design lock.

## To activate later
```bash
cd react-scaffold
npm install
npm run dev
```

You will get a blank shell on http://localhost:5173 with the routes wired, no styling yet, no module content yet.

## Move into project root after design lock
Once design is locked and Batch 1 specs are signed off, the move plan is:
1. Move static modules to `static/` subdir or delete after porting
2. Promote react-scaffold/* to project root
3. Update `package.json` scripts to be the canonical run instructions
4. Update CLAUDE.md "File layout" to reflect React structure
