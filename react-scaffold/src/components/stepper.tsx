import { type ReactNode, useEffect, useState } from 'react';

interface StepperStage {
  actor?: string;
  title: string;
  body: ReactNode;
}

interface StepperProps {
  stages: StepperStage[];
}

export default function Stepper({ stages }: StepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(stages.length - 1, 0)));
  }, [stages.length]);

  if (stages.length === 0) return null;

  const currentStage = stages[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stages.length - 1;

  return (
    <section className="rounded-2xl bg-clay-bg p-8 shadow-soft">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          {currentStage.actor ? (
            <span className="inline-flex rounded-pill bg-clay-peach px-3 py-1 text-xs font-medium uppercase tracking-widest text-ink-700">
              {currentStage.actor}
            </span>
          ) : null}
        </div>
        <span className="text-sm text-ink-500">
          {currentIndex + 1} / {stages.length}
        </span>
      </div>

      <h3 className="mb-4 font-heading text-2xl text-ink-900">
        {currentStage.title}
      </h3>
      <div className="text-base text-ink-700">{currentStage.body}</div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          className="rounded-full bg-clay-cream px-5 py-2 text-sm font-medium text-ink-900 transition-colors hover:text-accent-coral disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirst}
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded-full bg-accent-coral px-5 py-2 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          disabled={isLast}
          onClick={() =>
            setCurrentIndex((index) => Math.min(stages.length - 1, index + 1))
          }
        >
          Next
        </button>
      </div>
    </section>
  );
}
