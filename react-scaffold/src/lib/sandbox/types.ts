// Sandbox type definitions. The actual sandbox runtime (CodeMirror init,
// JS execution, Anthropic BYOK) lands in src/lib/sandbox/runtime.ts after
// the design system is locked.

export type SandboxMode = 'js' | 'anthropic';

export interface SandboxVerdict {
  passed: boolean;
  message?: string;
  details?: string;
}

export interface SandboxConfig {
  id: string;          // 'mNN-slug' format, validated at module load
  moduleId: string;    // 'mNN'
  mode: SandboxMode;
  prompt: string;      // HTML allowed; rendered as innerHTML
  starter: string;     // initial editor contents
  hint?: string;       // optional hint text, HTML allowed
  /** test takes the user's returned value and the captured stdout lines, returns a verdict. */
  test: (result: unknown, lines?: string[]) => SandboxVerdict | Promise<SandboxVerdict>;
}
