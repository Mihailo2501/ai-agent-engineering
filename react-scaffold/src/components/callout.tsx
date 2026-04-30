import type { ReactNode } from 'react';

type CalloutKind = 'info' | 'warn' | 'note';

interface CalloutProps {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}

const kindClasses: Record<CalloutKind, string> = {
  info: 'bg-info-bg border border-accent-coral/30',
  warn: 'bg-warn-bg border border-accent-coral/50',
  note: 'bg-note-bg border border-ink-500/25'
};

export default function Callout({ kind = 'info', title, children }: CalloutProps) {
  return (
    <aside className={`rounded-xl p-5 ${kindClasses[kind]}`}>
      {title ? <p className="mb-1 font-bold text-ink-900">{title}</p> : null}
      <div className="text-sm text-ink-900">{children}</div>
    </aside>
  );
}
