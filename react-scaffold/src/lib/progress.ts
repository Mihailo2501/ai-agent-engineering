// Progress tracking via localStorage. No backend, no telemetry.
// Single JSON blob at key `aiae:progress`.
// Ported from js/progress.js (static version) to TypeScript and scoped
// to 25 modules.

import { MODULE_IDS, TOTAL_MODULES } from '../data/modules';

const KEY = 'aiae:progress';
const VERSION = 2; // bumped from 1 (the static version) because module count changed

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type SandboxStatus = 'not_started' | 'attempted' | 'passed';

interface ModuleRecord {
  status: ModuleStatus;
  startedAt?: string;
  completedAt?: string;
  lastVisitedAt?: string;
}

interface SandboxRecord {
  status: SandboxStatus;
  attempts: number;
  passedAt?: string;
}

interface QuizRecord {
  revealed: boolean;
}

interface ProgressState {
  version: number;
  modules: Record<string, ModuleRecord>;
  sandboxes: Record<string, SandboxRecord>;
  quizzes: Record<string, QuizRecord>;
  lastVisitedModule: string | null;
}

function defaultState(): ProgressState {
  return {
    version: VERSION,
    modules: {},
    sandboxes: {},
    quizzes: {},
    lastVisitedModule: null
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== VERSION) return defaultState();
    return parsed;
  } catch (err) {
    console.warn('[progress] load failed, resetting:', err);
    return defaultState();
  }
}

function save(state: ProgressState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('aiae:progress-changed', { detail: state }));
  } catch (err) {
    console.error('[progress] save failed:', err);
  }
}

export function markModule(moduleId: string, status: ModuleStatus): void {
  const state = load();
  const now = new Date().toISOString();
  const existing = state.modules[moduleId] || { status: 'not_started' };
  state.modules[moduleId] = {
    ...existing,
    status,
    startedAt: existing.startedAt || now,
    lastVisitedAt: now,
    completedAt: status === 'completed' ? now : existing.completedAt
  };
  state.lastVisitedModule = moduleId;
  save(state);
}

export function getModule(moduleId: string): ModuleRecord {
  return load().modules[moduleId] || { status: 'not_started' };
}

export function markSandbox(sandboxId: string, status: SandboxStatus): void {
  const state = load();
  const now = new Date().toISOString();
  const existing = state.sandboxes[sandboxId] || { status: 'not_started', attempts: 0 };
  state.sandboxes[sandboxId] = {
    ...existing,
    status,
    attempts: existing.attempts + 1,
    passedAt: status === 'passed' ? (existing.passedAt || now) : existing.passedAt
  };
  save(state);
}

export function getSandbox(sandboxId: string): SandboxRecord {
  return load().sandboxes[sandboxId] || { status: 'not_started', attempts: 0 };
}

export function markQuizRevealed(quizId: string): void {
  const state = load();
  state.quizzes[quizId] = { revealed: true };
  save(state);
}

export interface OverallProgress {
  modulesCompleted: number;
  modulesInProgress: number;
  totalModules: number;
  modulePercentage: number;
  sandboxesPassed: number;
  sandboxesAttempted: number;
  lastVisitedModule: string | null;
}

export function getOverall(): OverallProgress {
  const state = load();
  const moduleStatuses = MODULE_IDS.map(
    (id) => state.modules[id]?.status || 'not_started'
  );
  const completed = moduleStatuses.filter((s) => s === 'completed').length;
  const inProgress = moduleStatuses.filter((s) => s === 'in_progress').length;
  const sandboxValues = Object.values(state.sandboxes);
  const sandboxesPassed = sandboxValues.filter((s) => s.status === 'passed').length;
  const sandboxesAttempted = sandboxValues.length;
  return {
    modulesCompleted: completed,
    modulesInProgress: inProgress,
    totalModules: TOTAL_MODULES,
    modulePercentage: Math.round((completed / TOTAL_MODULES) * 100),
    sandboxesPassed,
    sandboxesAttempted,
    lastVisitedModule: state.lastVisitedModule
  };
}

export function reset(): void {
  if (
    !confirm(
      'Reset all progress? This clears module completions, sandbox state, and badges. It cannot be undone.'
    )
  )
    return;
  localStorage.removeItem(KEY);
  localStorage.removeItem('aiae:badges');
  window.dispatchEvent(new CustomEvent('aiae:progress-changed', { detail: defaultState() }));
  location.reload();
}

export function exportJson(): string {
  return JSON.stringify(
    {
      progress: load(),
      badges: JSON.parse(localStorage.getItem('aiae:badges') || 'null')
    },
    null,
    2
  );
}

export function importJson(json: string): void {
  try {
    const parsed = JSON.parse(json);
    if (parsed.progress) localStorage.setItem(KEY, JSON.stringify(parsed.progress));
    if (parsed.badges) localStorage.setItem('aiae:badges', JSON.stringify(parsed.badges));
    window.dispatchEvent(
      new CustomEvent('aiae:progress-changed', { detail: parsed.progress })
    );
  } catch (err) {
    console.error('[progress] import failed:', err);
    alert('Could not import progress, JSON did not parse.');
  }
}
