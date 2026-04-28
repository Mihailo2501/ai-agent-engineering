// Badges. Stored in localStorage at `aiae:badges`. Definitions live in code; unlocked
// state lives in storage. Badges are checked whenever progress changes.

(function () {
  const KEY = 'aiae:badges';

  const DEFINITIONS = {
    'm01-complete': { name: 'Primitives', desc: 'Finished Module 01.', icon: '◆' },
    'm02-complete': { name: 'Patterns', desc: 'Finished Module 02.', icon: '◆' },
    'm03-complete': { name: 'Prompt Engineer', desc: 'Finished Module 03.', icon: '◆' },
    'm04-complete': { name: 'Interfaces', desc: 'Finished Module 04.', icon: '◆' },
    'm05-complete': { name: 'Harnessed', desc: 'Finished Module 05.', icon: '◆' },
    'm06-complete': { name: 'Extender', desc: 'Finished Module 06.', icon: '◆' },
    'm07-complete': { name: 'Platform-Aware', desc: 'Finished Module 07.', icon: '◆' },
    'm08-complete': { name: 'Tool Designer', desc: 'Finished Module 08.', icon: '◆' },
    'm09-complete': { name: 'Memory Holder', desc: 'Finished Module 09.', icon: '◆' },
    'm10-complete': { name: 'Browser Wrangler', desc: 'Finished Module 10.', icon: '◆' },
    'm11-complete': { name: 'Evaluator', desc: 'Finished Module 11.', icon: '◆' },
    'm12-complete': { name: 'Production-Ready', desc: 'Finished Module 12.', icon: '◆' },
    'm13-complete': { name: 'Case Study Closed', desc: 'Finished Module 13.', icon: '◆' },

    'foundations-done':  { name: 'Foundations',         desc: 'Modules 01 to 03 complete.', icon: '▲' },
    'interfaces-done':   { name: 'Interfaces & Harnesses', desc: 'Modules 04 to 07 complete.', icon: '▲' },
    'tools-memory-done': { name: 'Tools & Memory',      desc: 'Modules 08 to 10 complete.', icon: '▲' },
    'production-done':   { name: 'Production',          desc: 'Modules 11 and 12 complete.', icon: '▲' },

    'first-sandbox':   { name: 'First Run',          desc: 'Passed your first sandbox.', icon: '●' },
    'ten-sandboxes':   { name: 'Ten Down',           desc: 'Passed ten sandboxes.', icon: '●' },
    'twenty-sandboxes':{ name: 'Twenty Down',        desc: 'Passed twenty sandboxes.', icon: '●' },
    'first-byok-call': { name: 'BYOK',               desc: 'Made your first real Anthropic API call.', icon: '◉' },

    'all-modules':     { name: 'Course Complete',    desc: 'All thirteen modules finished.', icon: '★' }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { unlocked: {}, version: 1 };
      const parsed = JSON.parse(raw);
      return parsed.unlocked ? parsed : { unlocked: {}, version: 1 };
    } catch (err) {
      console.warn('[badges] load failed, resetting:', err);
      return { unlocked: {}, version: 1 };
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[badges] save failed:', err);
    }
  }

  function unlock(badgeId) {
    if (!DEFINITIONS[badgeId]) {
      console.warn('[badges] unknown badge id:', badgeId);
      return false;
    }
    const state = load();
    if (state.unlocked[badgeId]) return false;
    state.unlocked[badgeId] = { unlockedAt: new Date().toISOString() };
    save(state);
    window.dispatchEvent(new CustomEvent('aiae:badge-unlocked', {
      detail: { id: badgeId, ...DEFINITIONS[badgeId] }
    }));
    return true;
  }

  function isUnlocked(badgeId) {
    return !!load().unlocked[badgeId];
  }

  function getAllUnlocked() {
    return Object.keys(load().unlocked);
  }

  function checkUnlocks() {
    if (!window.Progress) return [];
    const newly = [];
    const overall = window.Progress.getOverall();
    const progressState = JSON.parse(localStorage.getItem('aiae:progress') || '{}');
    const modules = progressState.modules || {};
    const sandboxes = progressState.sandboxes || {};

    // Per-module completion badges
    Object.keys(modules).forEach(mid => {
      if (modules[mid].status === 'completed') {
        if (unlock(mid + '-complete')) newly.push(mid + '-complete');
      }
    });

    // Section badges
    const isDone = mid => modules[mid]?.status === 'completed';
    if (['m01','m02','m03'].every(isDone)) {
      if (unlock('foundations-done')) newly.push('foundations-done');
    }
    if (['m04','m05','m06','m07'].every(isDone)) {
      if (unlock('interfaces-done')) newly.push('interfaces-done');
    }
    if (['m08','m09','m10'].every(isDone)) {
      if (unlock('tools-memory-done')) newly.push('tools-memory-done');
    }
    if (['m11','m12'].every(isDone)) {
      if (unlock('production-done')) newly.push('production-done');
    }

    // Sandbox badges
    const passedCount = Object.values(sandboxes).filter(s => s.status === 'passed').length;
    if (passedCount >= 1 && unlock('first-sandbox')) newly.push('first-sandbox');
    if (passedCount >= 10 && unlock('ten-sandboxes')) newly.push('ten-sandboxes');
    if (passedCount >= 20 && unlock('twenty-sandboxes')) newly.push('twenty-sandboxes');

    // Course complete
    if (overall.modulesCompleted === overall.totalModules) {
      if (unlock('all-modules')) newly.push('all-modules');
    }

    return newly;
  }

  function showToast(badgeId) {
    const def = DEFINITIONS[badgeId];
    if (!def) return;
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = `
      <div class="badge-toast-icon">${def.icon}</div>
      <div class="badge-toast-body">
        <div class="badge-toast-label">Badge unlocked</div>
        <div class="badge-toast-name">${def.name}</div>
        <div class="badge-toast-desc">${def.desc}</div>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  // Auto-show toasts on unlock events
  window.addEventListener('aiae:badge-unlocked', e => showToast(e.detail.id));

  // Auto-check whenever progress changes
  window.addEventListener('aiae:progress-changed', () => checkUnlocks());

  window.Badges = {
    DEFINITIONS,
    unlock,
    isUnlocked,
    getAllUnlocked,
    checkUnlocks,
    showToast
  };
})();
