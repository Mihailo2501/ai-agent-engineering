import { Link } from 'react-router';

interface ModuleNavProps {
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

const cardClass =
  'rounded-xl bg-clay-cream p-6 border border-accent-coral/20 shadow-medium transition-all hover:-translate-y-0.5 hover:shadow-lift hover:border-accent-coral/40';

export default function ModuleNav({
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle
}: ModuleNavProps) {
  return (
    <nav className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="Module navigation">
      {prevSlug ? (
        <Link to={`/m/${prevSlug}`} className={`${cardClass} text-left`}>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">Previous</p>
          <p className="font-heading text-xl text-ink-900">
            <span aria-hidden="true" className="text-accent-coral">‹ </span>
            {prevTitle}
          </p>
        </Link>
      ) : null}
      {nextSlug ? (
        <Link to={`/m/${nextSlug}`} className={`${cardClass} text-right md:col-start-2`}>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-700">Next</p>
          <p className="font-heading text-xl text-ink-900">
            {nextTitle}
            <span aria-hidden="true" className="text-accent-coral"> ›</span>
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
