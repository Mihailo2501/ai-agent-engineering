import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import BadgesShelf from '../components/badges-shelf';
import { BADGES, type Badge } from '../data/badges';
import { MODULES, type Module } from '../data/modules';
import { TRACKS, type TrackId } from '../data/tracks';
import {
  getModule,
  getOverall,
  getSandbox,
  type OverallProgress
} from '../lib/progress';

const trackBackgrounds: Record<TrackId, string> = {
  foundations: 'bg-clay-mint',
  interfaces: 'bg-clay-lavender',
  building: 'bg-clay-sky',
  production: 'bg-clay-cream',
  applied: 'bg-clay-peach'
};

function isBadgeUnlocked(badge: Badge): boolean {
  switch (badge.unlock.kind) {
    case 'module':
      return getModule(badge.unlock.moduleId).status === 'completed';
    case 'sandbox':
      return getSandbox(badge.unlock.sandboxId).status === 'passed';
    case 'modules-completed':
      return getOverall().modulesCompleted >= badge.unlock.count;
    case 'sandboxes-passed':
      return getOverall().sandboxesPassed >= badge.unlock.count;
  }
}

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

function StatIcon({ slug }: { slug: string }): React.JSX.Element | null {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) return null;
  return (
    <img
      src={`/illustrations/stat-${slug}.png`}
      alt=""
      className="h-10 w-10 object-contain"
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
  const [mascotFailed, setMascotFailed] = useState(false);
  const [compositionFailed, setCompositionFailed] = useState(false);

  useEffect(() => {
    const updateOverall = () => setOverall(getOverall());
    window.addEventListener('aiae:progress-changed', updateOverall);
    return () => window.removeEventListener('aiae:progress-changed', updateOverall);
  }, []);

  const badgesEarned = BADGES.filter(isBadgeUnlocked).length;

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 gap-8 rounded-2xl bg-clay-cream p-12 shadow-medium md:grid-cols-2">
        <div>
          <h1 className="mb-6 font-heading text-5xl leading-[1.05] text-ink-900 md:text-6xl">
            AI Agent
            <br />
            <span style={{ color: '#8B70C9' }}>Engineering</span>
          </h1>
          <p className="mb-8 text-lg text-ink-700">
            Go beyond vibe coding. Build real agents with the Claude API, MCP, and production tooling.
          </p>
          <Link
            to="/m/primitives"
            className="inline-flex rounded-full bg-accent-coral px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Start with Module 01
          </Link>
        </div>
        <div className="relative flex h-full min-h-[320px] items-center justify-center">
          {!compositionFailed ? (
            <img
              src="/illustrations/hero-composition.png"
              alt=""
              className="absolute right-0 top-1/2 h-[80%] w-auto -translate-y-1/2 object-contain"
              onError={() => setCompositionFailed(true)}
            />
          ) : null}
          {!mascotFailed ? (
            <img
              src="/illustrations/mascot-hero.png"
              alt=""
              className="relative z-10 h-full max-h-96 w-auto object-contain"
              onError={() => setMascotFailed(true)}
            />
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <article className="flex items-center gap-4 rounded-xl bg-clay-bg p-5 shadow-soft">
          <StatIcon slug="complete" />
          <div>
            <p className="font-heading text-2xl text-ink-900">{overall.modulePercentage}%</p>
            <p className="text-xs text-ink-700">complete</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-xl bg-clay-bg p-5 shadow-soft">
          <StatIcon slug="modules" />
          <div>
            <p className="font-heading text-2xl text-ink-900">
              {overall.modulesCompleted} / {overall.totalModules}
            </p>
            <p className="text-xs text-ink-700">modules</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-xl bg-clay-bg p-5 shadow-soft">
          <StatIcon slug="sandboxes" />
          <div>
            <p className="font-heading text-2xl text-ink-900">{overall.sandboxesPassed}</p>
            <p className="text-xs text-ink-700">sandboxes passed</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-xl bg-clay-bg p-5 shadow-soft">
          <StatIcon slug="badges" />
          <div>
            <p className="font-heading text-2xl text-ink-900">{badgesEarned}</p>
            <p className="text-xs text-ink-700">badges earned</p>
          </div>
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
                <h2 className="mt-1 font-heading text-2xl text-ink-900">{track.name}</h2>
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
