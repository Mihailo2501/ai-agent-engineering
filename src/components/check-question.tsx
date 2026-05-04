import type { ReactNode, SyntheticEvent } from 'react';
import { markQuizRevealed } from '../lib/progress';

interface CheckQuestionProps {
  id: string;
  question: string;
  children: ReactNode;
}

export default function CheckQuestion({
  id,
  question,
  children
}: CheckQuestionProps) {
  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) markQuizRevealed(id);
  }

  return (
    <details
      className="rounded-xl bg-clay-bg p-6 shadow-soft"
      onToggle={handleToggle}
    >
      <summary className="cursor-pointer font-heading text-lg text-ink-900">
        {question}
      </summary>
      <div className="mt-4 text-sm text-ink-700">{children}</div>
    </details>
  );
}
