import { useEffect, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      const mermaid = (await import('mermaid')).default;

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          themeVariables: {
            primaryColor: '#FDF1EF',
            primaryTextColor: '#20303C',
            primaryBorderColor: '#F78E6B',
            lineColor: '#58636B',
            secondaryColor: '#F2F7ED',
            tertiaryColor: '#F7F1FA',
            background: 'transparent'
          }
        });
        mermaidInitialized = true;
      }

      const container = containerRef.current;
      if (!container || cancelled) return;

      container.textContent = chart;
      container.removeAttribute('data-processed');
      await mermaid.run({ nodes: [container] });
    }

    void renderChart().catch((error: unknown) => {
      const container = containerRef.current;
      if (container) {
        container.textContent = 'Diagram failed to render';
      }
      if (import.meta.env.DEV) {
        console.error('[mermaid] render failed:', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className="overflow-x-auto rounded-xl bg-clay-bg p-6 shadow-soft">
      <div ref={containerRef} className="mermaid" />
    </div>
  );
}
