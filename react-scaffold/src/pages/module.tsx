import { useParams, Link } from 'react-router';
import { getModuleBySlug } from '../data/modules';

// Placeholder module page. MDX-based content modules will mount here
// (one MDX file per module under src/content/, lazy-loaded by slug).

export function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const mod = slug ? getModuleBySlug(slug) : undefined;

  if (!mod) {
    return (
      <div>
        <p>Module not found.</p>
        <Link to="/" className="underline">course hub</Link>
      </div>
    );
  }

  return (
    <article>
      <Link to="/" className="text-sm font-mono text-neutral-500 hover:text-neutral-900">
        ← course hub
      </Link>
      <header className="mt-6 mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Module {mod.num} · Track {mod.track}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{mod.title}</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">{mod.lead}</p>
      </header>
      <div className="prose prose-neutral">
        <p>
          Content not yet ported. Once Batch 1-4 specs are signed off and the design is locked,
          MDX content lands here.
        </p>
      </div>
    </article>
  );
}
