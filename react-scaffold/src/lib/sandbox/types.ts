import type React from 'react';

export interface RunLine {
  level: 'log' | 'warn' | 'error' | 'info';
  text: string;
}

export interface RunResult {
  result?: unknown;
  error?: Error;
  lines: RunLine[];
}

export interface Verdict {
  passed: boolean;
  message?: string;
  details?: string;
}

export interface SandboxConfig {
  id: string;
  mode: 'js' | 'anthropic';
  prompt?: React.ReactNode;
  starter: string;
  hint?: React.ReactNode;
  test: (result: unknown, lines: RunLine[]) => Verdict | Promise<Verdict>;
}
