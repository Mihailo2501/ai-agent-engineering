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

  return (
    <section className="rounded-2xl bg-clay-mint p-8 shadow-medium">
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
