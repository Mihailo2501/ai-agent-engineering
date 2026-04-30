import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getOverall } from '../lib/progress';
import { getModuleBySlug } from '../data/modules';

export default function ProgressStrip() {
  const { slug } = useParams<{ slug: string }>();
  const currentModule = slug ? getModuleBySlug(slug) : undefined;
  const [percentage, setPercentage] = useState(() => getOverall().modulePercentage);

  useEffect(() => {
    const updateProgress = () => setPercentage(getOverall().modulePercentage);
    window.addEventListener('aiae:progress-changed', updateProgress);
    return () => window.removeEventListener('aiae:progress-changed', updateProgress);
  }, []);

  const cleaned = Math.min(100, Math.max(0, percentage));
  const onModulePage = currentModule !== undefined;

  return (
    <div className="sticky top-0 z-50 flex h-10 items-center justify-between bg-clay-bg px-6 text-xs shadow-soft">
      {onModulePage ? (
        <Link
          to="/"
          className="text-ink-700 transition-colors hover:text-accent-coral"
        >
          <span aria-hidden="true">← </span>course hub
        </Link>
      ) : (
        <span className="text-ink-700">Course progress</span>
      )}
      <div className="mx-4 flex flex-1 items-center justify-center">
        <div
          className="h-1.5 w-40 rounded-pill bg-ink-500/20 sm:w-56"
          role="progressbar"
          aria-label="Overall completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={cleaned}
        >
          <div
            className="h-full rounded-pill bg-accent-coral transition-all"
            style={{ width: `${cleaned}%` }}
          />
        </div>
      </div>
      {onModulePage ? (
        <span className="text-ink-700">module {currentModule.num} / 25</span>
      ) : (
        <span className="text-ink-700">
          {cleaned}% Keep going! <span aria-hidden="true">🎉</span>
        </span>
      )}
    </div>
  );
}
