import { Link } from 'react-router';
import { MODULES } from '../data/modules';
import { TRACKS } from '../data/tracks';

// Placeholder home page. Real visual treatment lands when design is locked.
// For now, surfaces the tracks and modules so navigation is testable.

export function HomePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">AI Agent Engineering</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Self-paced course. Twenty-five modules across five tracks. Hands-on sandboxes against the
          real Anthropic API. Open source, runs locally.
        </p>
      </div>

      {TRACKS.map((track) => {
        const trackModules = MODULES.filter((m) => m.track === track.id);
        return (
          <section key={track.id} className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500">
              Track {track.num}: {track.name}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {trackModules.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/m/${m.slug}`}
                    className="block rounded border border-neutral-200 p-4 hover:border-neutral-400"
                  >
                    <div className="text-xs font-mono text-neutral-500">M{m.num}</div>
                    <div className="mt-1 font-medium">{m.title}</div>
                    <div className="mt-1 text-xs text-neutral-500">{m.lead}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
