import type { ReactNode } from 'react';

interface PotterAngleProps {
  children: ReactNode;
}

export default function PotterAngle({ children }: PotterAngleProps) {
  return (
    <aside className="rounded-2xl bg-clay-lavender p-8 shadow-medium">
      <p className="mb-4 font-heading text-sm uppercase tracking-widest text-accent-coral">
        POTTER ANGLE
      </p>
      <div className="text-base text-ink-900">{children}</div>
    </aside>
  );
}
