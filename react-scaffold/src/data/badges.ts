// Badge definitions. Currently a small first set that mirrors what
// js/badges.js had in the static version. Real badge artwork will be
// generated via gpt-image-2 through Codex once the design is locked.

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;          // text/emoji fallback until generated artwork lands
  unlock: BadgeUnlock;
}

export type BadgeUnlock =
  | { kind: 'module'; moduleId: string }
  | { kind: 'sandbox'; sandboxId: string }
  | { kind: 'modules-completed'; count: number }
  | { kind: 'sandboxes-passed'; count: number };

export const BADGES: Badge[] = [
  { id: 'primitives', name: 'Primitives', desc: 'Completed Module 01', icon: '◆', unlock: { kind: 'module', moduleId: 'm01' } },
  { id: 'inference', name: 'Inference', desc: 'Completed Module 02', icon: '◆', unlock: { kind: 'module', moduleId: 'm02' } },
  { id: 'patterns', name: 'Patterns', desc: 'Completed Module 03', icon: '◆', unlock: { kind: 'module', moduleId: 'm03' } },
  { id: 'prompt-engineer', name: 'Prompt Engineer', desc: 'Completed Module 04', icon: '◆', unlock: { kind: 'module', moduleId: 'm04' } },
  { id: 'byok', name: 'BYOK', desc: 'Made a real Anthropic API call from a sandbox', icon: '◆', unlock: { kind: 'sandbox', sandboxId: 'm01-real-call' } },
  { id: 'sandbox-streak-3', name: 'Sandbox Streak', desc: 'Passed three sandboxes', icon: '◆', unlock: { kind: 'sandboxes-passed', count: 3 } },
  { id: 'foundations-track', name: 'Foundations', desc: 'Finished all of Track 1', icon: '◆', unlock: { kind: 'modules-completed', count: 5 } }
];
