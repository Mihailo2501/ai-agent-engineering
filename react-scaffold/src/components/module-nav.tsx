import { Link } from 'react-router';

interface ModuleNavProps {
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

export default function ModuleNav({
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle
}: ModuleNavProps) {
  return (
    <nav className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="Module navigation">
      {prevSlug ? (
        <Link
          to={`/m/${prevSlug}`}
          className="rounded-xl bg-clay-bg p-6 text-left shadow-soft transition-colors hover:text-accent-coral"
        >
          <p className="mb-2 text-sm text-ink-500">Previous</p>
          <p className="font-heading text-xl text-ink-900">
            <span aria-hidden="true">‹ </span>
            {prevTitle}
          </p>
        </Link>
      ) : null}
      {nextSlug ? (
        <Link
          to={`/m/${nextSlug}`}
          className="rounded-xl bg-clay-bg p-6 text-right shadow-soft transition-colors hover:text-accent-coral md:col-start-2"
        >
          <p className="mb-2 text-sm text-ink-500">Next</p>
          <p className="font-heading text-xl text-ink-900">
            {nextTitle}
            <span aria-hidden="true"> ›</span>
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
