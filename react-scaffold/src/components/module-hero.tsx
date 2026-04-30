import type { TrackId } from '../data/tracks';

interface ModuleHeroProps {
  kicker: string;
  title: string;
  lead: string;
  trackId?: TrackId;
}

const trackBackgrounds: Record<TrackId, string> = {
  foundations: 'bg-clay-mint',
  interfaces: 'bg-clay-lavender',
  building: 'bg-clay-sky',
  production: 'bg-clay-cream',
  applied: 'bg-clay-peach'
};

export default function ModuleHero({
  kicker,
  title,
  lead,
  trackId
}: ModuleHeroProps) {
  const background = trackId ? trackBackgrounds[trackId] : 'bg-clay-cream';

  return (
    <section className={`rounded-2xl p-12 shadow-soft ${background}`}>
      <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">
        {kicker}
      </p>
      <h1 className="mb-4 font-heading text-4xl text-ink-900">{title}</h1>
      <p className="text-lg text-ink-700">{lead}</p>
    </section>
  );
}
