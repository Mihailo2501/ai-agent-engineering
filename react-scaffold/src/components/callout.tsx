import type { ReactNode } from 'react';

type CalloutKind = 'info' | 'warn' | 'note';

interface CalloutProps {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}

const kindClasses: Record<CalloutKind, string> = {
  info: 'bg-clay-sky border-l-4 border-accent-coral',
  warn: 'bg-clay-peach border-l-4 border-accent-coral',
  note: 'bg-clay-cream border-l-4 border-ink-500'
};

export default function Callout({ kind = 'info', title, children }: CalloutProps) {
  return (
    <aside className={`rounded-xl p-5 ${kindClasses[kind]}`}>
      {title ? <p className="mb-1 font-bold text-ink-900">{title}</p> : null}
      <div className="text-sm text-ink-900">{children}</div>
    </aside>
  );
}
