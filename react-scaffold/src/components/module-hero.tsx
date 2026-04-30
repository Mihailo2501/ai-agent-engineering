import { useState } from 'react';
import type { TrackId } from '../data/tracks';

interface ModuleHeroProps {
  kicker: string;
  title: string;
  lead: string;
  trackId?: TrackId;
  moduleId?: string;
}

const trackBackgrounds: Record<TrackId, string> = {
  foundations: 'bg-clay-mint',
  interfaces: 'bg-clay-lavender',
  building: 'bg-clay-sky',
  production: 'bg-clay-cream',
  applied: 'bg-clay-peach'
};

function HeroIllustration({ moduleId }: { moduleId: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) return null;
  return (
    <img
      src={`/illustrations/${moduleId}.png`}
      alt=""
      className="h-20 w-20 shrink-0 object-contain md:h-24 md:w-24"
      onError={() => setImgFailed(true)}
    />
  );
}

export default function ModuleHero({
  kicker,
  title,
  lead,
  trackId,
  moduleId
}: ModuleHeroProps) {
  const background = trackId ? trackBackgrounds[trackId] : 'bg-clay-cream';

  return (
    <section className={`rounded-2xl p-12 shadow-soft ${background}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {moduleId ? <HeroIllustration moduleId={moduleId} /> : null}
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">
            {kicker}
          </p>
          <h1 className="mb-4 font-heading text-4xl text-ink-900">{title}</h1>
          <p className="text-lg text-ink-700">{lead}</p>
        </div>
      </div>
    </section>
  );
}
