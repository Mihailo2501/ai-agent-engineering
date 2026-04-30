import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  num?: number;
  title: string;
  children: ReactNode;
}

export default function Section({ id, num, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 space-y-4">
      <h2 className="font-heading text-2xl text-ink-900">
        {num !== undefined ? `${num} · ` : null}
        {title}
      </h2>
      {children}
    </section>
  );
}
