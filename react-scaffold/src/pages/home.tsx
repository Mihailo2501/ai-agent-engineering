import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import BadgesShelf from '../components/badges-shelf';
import { MODULES, type Module } from '../data/modules';
import { TRACKS, type TrackId } from '../data/tracks';
import { getOverall, type OverallProgress } from '../lib/progress';

const trackBackgrounds: Record<TrackId, string> = {
  foundations: 'bg-clay-mint',
  interfaces: 'bg-clay-lavender',
  building: 'bg-clay-sky',
  production: 'bg-clay-cream',
  applied: 'bg-clay-peach'
};

function ModuleArt({ module }: { module: Module }): React.JSX.Element {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-clay-cream font-heading text-sm text-ink-700">
        {module.num}
      </div>
    );
  }

  return (
    <img
      src={`/illustrations/${module.id}.png`}
      alt=""
      className="h-16 w-16 object-contain"
      onError={() => setImgFailed(true)}
    />
  );
}

function ModuleCard({ module }: { module: Module }): React.JSX.Element {
  const cardClass = `block h-full rounded-xl bg-white/80 p-5 transition hover:shadow-lift ${
    module.available ? '' : 'opacity-60'
  }`;
  const body = (
    <>
      <ModuleArt module={module} />
      <div className="mt-4">
        <p className="text-xs text-ink-500">Module {module.num}</p>
        <h3 className="mt-1 font-heading text-base text-ink-900">{module.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-700">{module.lead}</p>
        {!module.available ? (
          <p className="mt-3 text-xs text-ink-500">Coming soon</p>
        ) : null}
      </div>
    </>
  );

  return module.available ? (
    <Link to={`/m/${module.slug}`} className={cardClass}>
      {body}
    </Link>
  ) : (
    <article className={cardClass}>{body}</article>
  );
}

export function HomePage(): React.JSX.Element {
  const [overall, setOverall] = useState<OverallProgress>(() => getOverall());
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const updateOverall = () => setOverall(getOverall());
    window.addEventListener('aiae:progress-changed', updateOverall);
    return () => window.removeEventListener('aiae:progress-changed', updateOverall);
  }, []);

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 gap-8 rounded-2xl bg-clay-cream p-12 shadow-medium md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-accent-coral">
            AI Agent Engineering
          </p>
          <h1 className="mb-4 font-heading text-4xl text-ink-900 md:text-5xl">
            Build real AI agents, the engineer&apos;s way.
          </h1>
          <p className="mb-8 text-lg text-ink-700">
            25 modules across 5 tracks. Hands-on sandboxes against the Anthropic
            API. Open source, runs locally.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/m/primitives"
              className="rounded-full bg-accent-coral px-6 py-3 text-sm font-semibold text-white"
            >
              Start Module 01
            </Link>
            <Link
              to="/#about"
              className="rounded-full border border-ink-500/30 px-6 py-3 text-sm text-ink-700"
            >
              What is this?
            </Link>
          </div>
        </div>
        {!imgFailed ? (
          <img
            src="/illustrations/mascot-hero.png"
            alt=""
            className="mx-auto h-full max-h-80 w-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-clay-bg p-6 shadow-soft">
          <p className="font-heading text-3xl text-ink-900">
            {overall.modulesCompleted} / {overall.totalModules}
          </p>
          <p className="text-xs text-ink-700">modules done</p>
        </article>
        <article className="rounded-xl bg-clay-bg p-6 shadow-soft">
          <p className="font-heading text-3xl text-ink-900">
            {overall.sandboxesPassed}
          </p>
          <p className="text-xs text-ink-700">sandboxes passed</p>
        </article>
        <article className="rounded-xl bg-clay-bg p-6 shadow-soft">
          <p className="font-heading text-3xl text-ink-900">
            {overall.modulePercentage}%
          </p>
          <p className="text-xs text-ink-700">complete</p>
        </article>
      </section>

      <div className="space-y-8">
        {TRACKS.map((track) => {
          const modules = MODULES.filter((module) => module.track === track.id);

          return (
            <section
              key={track.id}
              className={`rounded-2xl p-8 shadow-soft ${trackBackgrounds[track.id]}`}
            >
              <div className="mb-6">
                <p className="text-xs uppercase text-ink-700">Track {track.num}</p>
                <h2 className="mt-1 font-heading text-2xl text-ink-900">
                  {track.name}
                </h2>
                <p className="mt-2 text-sm text-ink-700">{track.blurb}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {modules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section>
        <h2 className="mb-4 font-heading text-2xl text-ink-900">Badges</h2>
        <BadgesShelf />
      </section>
    </div>
  );
}
