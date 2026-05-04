import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  groupByLetter,
  loadGlossaryEntries,
  type GlossaryEntry
} from '../data/glossary';

export function GlossaryPage(): React.JSX.Element {
  const [entries, setEntries] = useState<GlossaryEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGlossaryEntries()
      .then((all) => {
        if (!cancelled) setEntries(all);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { byLetter, letters } = useMemo(() => {
    if (!entries) return { byLetter: new Map<string, GlossaryEntry[]>(), letters: [] as string[] };
    const grouped = groupByLetter(entries);
    return { byLetter: grouped, letters: Array.from(grouped.keys()).sort() };
  }, [entries]);

  return (
    <div className="space-y-10">
      <header className="rounded-2xl bg-clay-cream p-12 shadow-medium">
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">Glossary</p>
        <h1 className="mb-4 font-heading text-4xl text-ink-900">Every term in the course</h1>
        <p className="text-lg text-ink-700">
          {entries
            ? `${entries.length} terms across the 25 modules. Click any term to jump to where it is taught.`
            : 'Loading...'}
        </p>
      </header>

      {error ? (
        <p className="text-sm text-red-600">Failed to load glossary; refresh to retry</p>
      ) : entries ? (
        <>
          <nav
            aria-label="Glossary letters"
            className="sticky top-2 z-10 flex flex-wrap gap-2 rounded-2xl bg-white/80 p-3 shadow-soft backdrop-blur"
          >
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clay-bg font-heading text-sm text-ink-900 hover:bg-accent-coral hover:text-white"
              >
                {letter}
              </a>
            ))}
          </nav>

          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 space-y-4">
              <h2 className="font-heading text-3xl text-ink-900">{letter}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {byLetter.get(letter)!.map((entry) => (
                  <article
                    key={`${entry.moduleId}-${entry.id}`}
                    className="rounded-xl bg-clay-bg p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-heading text-lg text-ink-900">{entry.term}</p>
                      <Link
                        to={`/m/${entry.moduleSlug}#glossary-${entry.id}`}
                        className="shrink-0 rounded-full bg-clay-cream px-3 py-1 text-xs text-ink-700 transition-colors hover:text-accent-coral"
                      >
                        M{entry.moduleNum}
                      </Link>
                    </div>
                    <p className="mt-2 text-sm text-ink-700">{entry.definition}</p>
                    <Link
                      to={`/m/${entry.moduleSlug}`}
                      className="mt-3 inline-block text-xs text-ink-500 hover:text-accent-coral"
                    >
                      Taught in: {entry.moduleTitle}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <p className="text-sm text-ink-500">Loading glossary...</p>
      )}
    </div>
  );
}
