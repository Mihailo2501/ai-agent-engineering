// demo-helpers.js
// Reusable interactive demo patterns for course modules.
// Each module declares the data; this file owns the rendering machinery.
// Globals: window.Demo

window.Demo = (function () {

  // --------------------------------------------------------------
  // Demo.stepper(mountEl, opts)
  //
  // Sequence walkthrough demo. Builds a complete .demo container at
  // mountEl with stage list, step / reset buttons, and a progress
  // counter. Class names match the existing CSS (.loop-stage, etc.)
  // so visual treatment is unchanged from M01's original implementation.
  //
  // opts:
  //   title     : string, demo title (escaped)
  //   scenario  : string|null, displayed under the stage list (escaped)
  //   stages    : array of stage objects, each:
  //     - actor       : string|null      (escaped)
  //     - actorClass  : string|null      (raw class name, validated chars)
  //     - title       : string           (escaped, plain text)
  //     - titleHtml   : string           (raw HTML, opt-in for markup like <code>)
  //     - desc        : string           (escaped, plain text)
  //     - descHtml    : string           (raw HTML, opt-in for markup like <code>)
  //   startLabel : string, label of step button when idx === 0 (default 'start ▸')
  //   stepLabel  : string, label of step button while advancing (default 'step ▸')
  // --------------------------------------------------------------
  function stepper(mount, opts) {
    if (!mount) throw new Error('Demo.stepper: mount element is required');
    const stages = (opts && opts.stages) || [];
    const title = (opts && opts.title) || 'Stepper';
    const scenario = (opts && opts.scenario) || null;
    const startLabel = (opts && opts.startLabel) || 'start ▸';
    const stepLabel = (opts && opts.stepLabel) || 'step ▸';

    mount.innerHTML =
      '<div class="demo">' +
        '<div class="demo-head">' +
          '<div class="demo-title">Demo · ' + escapeHtml(title) + '</div>' +
          '<div class="btn-row">' +
            '<button class="btn ghost" data-act="reset">reset</button>' +
            '<button class="btn primary" data-act="step">' + escapeHtml(startLabel) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="demo-body">' +
          '<div class="stepper-stages"></div>' +
          '<div class="stepper-meta">' +
            '<span class="stepper-progress">0 / ' + stages.length + '</span>' +
            (scenario ? ' · scenario: <em>' + escapeHtml(scenario) + '</em>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    const stagesEl = mount.querySelector('.stepper-stages');
    const progressEl = mount.querySelector('.stepper-progress');
    const stepBtn = mount.querySelector('[data-act="step"]');
    const resetBtn = mount.querySelector('[data-act="reset"]');

    let idx = 0;

    function render() {
      stagesEl.innerHTML = stages.map((s, i) => {
        let cls = '';
        if (i < idx) cls = 'done';
        if (i === idx - 1) cls = 'active';
        const titleHtml = s.titleHtml !== undefined ? s.titleHtml : escapeHtml(s.title || '');
        const descHtml = s.descHtml !== undefined ? s.descHtml : escapeHtml(s.desc || '');
        const actorTag = s.actor
          ? '<span class="loop-stage-actor ' + sanitizeClass(s.actorClass || '') + '">' + escapeHtml(s.actor) + '</span>'
          : '';
        return '<div class="loop-stage ' + cls + '">' +
                 '<div class="loop-stage-num">' + (i + 1) + '</div>' +
                 '<div>' +
                   '<div class="loop-stage-title">' + titleHtml + actorTag + '</div>' +
                   '<div class="loop-stage-desc">' + descHtml + '</div>' +
                 '</div>' +
               '</div>';
      }).join('');
      progressEl.textContent = idx + ' / ' + stages.length;
      if (idx >= stages.length) {
        stepBtn.textContent = 'done ✓';
        stepBtn.disabled = true;
      } else {
        stepBtn.textContent = idx === 0 ? startLabel : stepLabel;
        stepBtn.disabled = false;
      }
    }

    stepBtn.addEventListener('click', () => {
      if (idx < stages.length) idx++;
      render();
    });
    resetBtn.addEventListener('click', () => {
      idx = 0;
      render();
    });

    render();
  }

  // --------------------------------------------------------------
  // Demo.keyExplainer(opts)
  //
  // Click-to-explain for annotated JSON / config blocks. Author marks
  // clickable keys in HTML with:
  //   <span class="tooldef-key" data-key="foo">"foo"</span>
  // and passes a map of key -> { label, text }.
  //
  // Adds tabindex + keyboard activation (Enter / Space) so screen-
  // reader and keyboard users get the same affordance as mouse users.
  //
  // opts:
  //   rootEl      : selector or element containing the marked-up display
  //   targetEl    : selector or element where explanations render
  //   keys        : { [key]: { label, text } }
  //   keySelector : selector for clickable keys (default '.tooldef-key')
  // --------------------------------------------------------------
  function keyExplainer(opts) {
    const root = typeof opts.rootEl === 'string'
      ? document.querySelector(opts.rootEl) : opts.rootEl;
    const target = typeof opts.targetEl === 'string'
      ? document.querySelector(opts.targetEl) : opts.targetEl;
    const keys = opts.keys || {};
    const keySelector = opts.keySelector || '.tooldef-key';

    if (!root || !target) {
      console.warn('Demo.keyExplainer: rootEl or targetEl not found', opts);
      return;
    }

    const items = root.querySelectorAll(keySelector);
    items.forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');

      function activate() {
        items.forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        const ex = keys[el.dataset.key];
        if (!ex) {
          console.warn('Demo.keyExplainer: no entry for key "' + el.dataset.key + '"');
          return;
        }
        target.innerHTML = '<span class="label">' + escapeHtml(ex.label) + '</span>' + ex.text;
      }

      el.addEventListener('click', activate);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Strip anything that is not a safe class-name character.
  function sanitizeClass(s) {
    return String(s).replace(/[^A-Za-z0-9_\- ]/g, '');
  }

  return { stepper, keyExplainer };
})();
