import { useEffect, useState } from 'react';
import { BADGES, type Badge } from '../data/badges';
import { getModule, getOverall, getSandbox } from '../lib/progress';

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

export default function BadgesShelf() {
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    function refreshBadges() {
      setRefreshKey((key) => key + 1);
    }

    window.addEventListener('aiae:progress-changed', refreshBadges);
    return () => window.removeEventListener('aiae:progress-changed', refreshBadges);
  }, []);

  return (
    <section className="grid grid-cols-3 gap-4 md:grid-cols-4">
      {BADGES.map((badge) => {
        const unlocked = isBadgeUnlocked(badge);

        return (
          <article
            key={badge.id}
            className="rounded-xl bg-clay-bg p-4 text-center shadow-soft"
          >
            {unlocked ? (
              <img
                src={`/illustrations/badges/${badge.id}.png`}
                alt={badge.name}
                className="mx-auto h-16 w-16 object-contain"
                onError={(event) => {
                  event.currentTarget.style.opacity = '0.3';
                }}
              />
            ) : (
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gray-200 text-2xl text-ink-500"
                aria-label={`${badge.name} locked`}
              >
                <span aria-hidden="true">🔒</span>
              </div>
            )}
            <p className="mt-3 font-heading text-sm text-ink-900">{badge.name}</p>
            <p className="mt-1 text-xs text-ink-500">{badge.desc}</p>
          </article>
        );
      })}
    </section>
  );
}
