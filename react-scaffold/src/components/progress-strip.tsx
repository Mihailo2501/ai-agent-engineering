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

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-clay-bg px-6 py-3 shadow-soft">
      <Link
        to="/"
        className="text-sm text-ink-700 transition-colors hover:text-accent-coral"
      >
        <span aria-hidden="true">← </span>course hub
      </Link>
      <div className="text-sm text-ink-700">
        {currentModule ? `module ${currentModule.num} / 25` : null}
      </div>
      <div
        className="h-2 w-32 rounded-pill bg-ink-500/20"
        role="progressbar"
        aria-label="Overall completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-pill bg-accent-coral transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
