import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getModule, markModule } from '../lib/progress';

interface CompleteBannerProps {
  moduleId: string;
  nextSlug?: string;
  nextTitle?: string;
}

export default function CompleteBanner({
  moduleId,
  nextSlug,
  nextTitle
}: CompleteBannerProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    function updateCompleted() {
      setCompleted(getModule(moduleId).status === 'completed');
    }

    updateCompleted();
    window.addEventListener('aiae:progress-changed', updateCompleted);
    return () => window.removeEventListener('aiae:progress-changed', updateCompleted);
  }, [moduleId]);

  function handleComplete() {
    markModule(moduleId, 'completed');
    setCompleted(true);
  }

  function handleUndo() {
    markModule(moduleId, 'in_progress');
    setCompleted(false);
  }

  return (
    <section
      className={`rounded-2xl p-8 shadow-medium ${
        completed
          ? 'bg-success-bg border border-state-success/40'
          : 'bg-clay-mint border border-state-success/25'
      }`}
    >
      {completed ? (
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-2xl text-ink-900">
              <span aria-hidden="true" className="mr-2 text-state-success">
                ✓
              </span>
              Module complete
            </p>
            <p className="mt-2 text-sm text-ink-700">Progress saved locally.</p>
            <button
              type="button"
              onClick={handleUndo}
              className="mt-3 text-xs text-ink-500 underline underline-offset-2 transition-colors hover:text-accent-coral"
            >
              Mark incomplete
            </button>
          </div>
          {nextSlug ? (
            <Link
              to={`/m/${nextSlug}`}
              className="inline-flex rounded-full bg-accent-coral px-5 py-2 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
            >
              {nextTitle ? `Next: ${nextTitle}` : 'Next module'}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-2xl text-ink-900">Ready to wrap?</p>
            <p className="mt-2 text-sm text-ink-700">
              Mark this module complete when you have finished the checks.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-accent-coral px-5 py-2 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
            onClick={handleComplete}
          >
            Mark complete
          </button>
        </div>
      )}
    </section>
  );
}
