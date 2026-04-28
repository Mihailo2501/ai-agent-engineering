// Mermaid bootstrap. Configured to match the dark terminal aesthetic.

(function () {
  'use strict';

  const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';

  const config = {
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    fontFamily: '"JetBrains Mono", "SF Mono", monospace',
    themeVariables: {
      background: '#0a0a0a',
      primaryColor: '#1c1c1c',
      primaryTextColor: '#e5e5e5',
      primaryBorderColor: '#ff7a45',
      lineColor: '#6b6b6b',
      secondaryColor: '#141414',
      tertiaryColor: '#262626',
      edgeLabelBackground: '#0a0a0a',
      nodeTextColor: '#e5e5e5',
      actorBkg: '#1c1c1c',
      actorBorder: '#ff7a45',
      actorTextColor: '#e5e5e5',
      actorLineColor: '#6b6b6b',
      signalColor: '#a3a3a3',
      signalTextColor: '#e5e5e5',
      labelBoxBkgColor: '#1c1c1c',
      labelBoxBorderColor: '#ff7a45',
      labelTextColor: '#e5e5e5',
      loopTextColor: '#a3a3a3',
      noteBkgColor: '#26201a',
      noteTextColor: '#ffd166',
      noteBorderColor: '#ffd166',
      activationBkgColor: '#262626',
      activationBorderColor: '#ff7a45',
      sequenceNumberColor: '#0a0a0a'
    },
    sequence: { mirrorActors: false, showSequenceNumbers: true },
    flowchart: { curve: 'basis', htmlLabels: true }
  };

  let initialized = false;

  function getMermaid() {
    return window.mermaid || window.Mermaid;
  }

  async function renderMermaid() {
    const mermaid = getMermaid();
    if (!mermaid) {
      console.error('[mermaid] library did not load');
      return;
    }
    try {
      if (!initialized) {
        mermaid.initialize(config);
        window.Mermaid = mermaid;
        initialized = true;
      }
      const nodes = Array.from(document.querySelectorAll('.mermaid'));
      nodes.forEach(node => node.removeAttribute('data-processed'));
      if (typeof mermaid.run === 'function') {
        await mermaid.run({ nodes });
      } else if (typeof mermaid.init === 'function') {
        mermaid.init(undefined, nodes);
      } else {
        console.error('[mermaid] no supported render API found');
      }
    } catch (err) {
      console.error('[mermaid] render failed:', err);
    }
  }

  function loadMermaid() {
    if (getMermaid()) {
      renderMermaid();
      return;
    }
    const script = document.createElement('script');
    script.src = MERMAID_URL;
    script.onload = renderMermaid;
    script.onerror = err => console.error('[mermaid] script load failed:', err);
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMermaid);
  } else {
    loadMermaid();
  }
})();
