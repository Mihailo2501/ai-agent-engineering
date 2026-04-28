// Progress tracking via localStorage. No backend, no telemetry.
// Single JSON blob at key `aiae:progress`.
// Schema:
// {
//   version: 1,
//   modules: { "m01": { status: "completed", startedAt, completedAt, lastVisitedAt } },
//   sandboxes: { "m01-tool-def": { status: "passed", attempts, passedAt } },
//   quizzes: { "m01-q1": { revealed: true } },
//   lastVisitedModule: "m01"
// }

(function () {
  const KEY = 'aiae:progress';
  const VERSION = 1;

  const TOTAL_MODULES = 13;
  const MODULE_IDS = Array.from({ length: TOTAL_MODULES }, (_, i) =>
    'm' + String(i + 1).padStart(2, '0')
  );

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (parsed.version !== VERSION) return defaultState();
      return parsed;
    } catch (err) {
      console.warn('[progress] load failed, resetting:', err);
      return defaultState();
    }
  }

  function defaultState() {
    return {
      version: VERSION,
      modules: {},
      sandboxes: {},
      quizzes: {},
      lastVisitedModule: null
    };
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('aiae:progress-changed', { detail: state }));
    } catch (err) {
      console.error('[progress] save failed:', err);
    }
  }

  function markModule(moduleId, status) {
    const state = load();
    const now = new Date().toISOString();
    const existing = state.modules[moduleId] || {};
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

  function getModule(moduleId) {
    return load().modules[moduleId] || { status: 'not_started' };
  }

  function markSandbox(sandboxId, status) {
    const state = load();
    const now = new Date().toISOString();
    const existing = state.sandboxes[sandboxId] || { attempts: 0 };
    state.sandboxes[sandboxId] = {
      ...existing,
      status,
      attempts: existing.attempts + 1,
      passedAt: status === 'passed' ? (existing.passedAt || now) : existing.passedAt
    };
    save(state);
  }

  function getSandbox(sandboxId) {
    return load().sandboxes[sandboxId] || { status: 'not_started', attempts: 0 };
  }

  function markQuizRevealed(quizId) {
    const state = load();
    state.quizzes[quizId] = { revealed: true };
    save(state);
  }

  function getOverall() {
    const state = load();
    const moduleStatuses = MODULE_IDS.map(id => state.modules[id]?.status || 'not_started');
    const completed = moduleStatuses.filter(s => s === 'completed').length;
    const inProgress = moduleStatuses.filter(s => s === 'in_progress').length;
    const sandboxValues = Object.values(state.sandboxes);
    const sandboxesPassed = sandboxValues.filter(s => s.status === 'passed').length;
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

  function reset() {
    if (!confirm('Reset all progress? This clears module completions, sandbox state, and badges. It cannot be undone.')) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem('aiae:badges');
    window.dispatchEvent(new CustomEvent('aiae:progress-changed', { detail: defaultState() }));
    location.reload();
  }

  function exportJson() {
    return JSON.stringify({ progress: load(), badges: JSON.parse(localStorage.getItem('aiae:badges') || 'null') }, null, 2);
  }

  function importJson(json) {
    try {
      const parsed = JSON.parse(json);
      if (parsed.progress) localStorage.setItem(KEY, JSON.stringify(parsed.progress));
      if (parsed.badges) localStorage.setItem('aiae:badges', JSON.stringify(parsed.badges));
      window.dispatchEvent(new CustomEvent('aiae:progress-changed', { detail: parsed.progress }));
    } catch (err) {
      console.error('[progress] import failed:', err);
      alert('Could not import progress, JSON did not parse.');
    }
  }

  window.Progress = {
    markModule,
    getModule,
    markSandbox,
    getSandbox,
    markQuizRevealed,
    getOverall,
    reset,
    exportJson,
    importJson,
    MODULE_IDS,
    TOTAL_MODULES
  };
})();
