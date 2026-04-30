import { useEffect, useState } from 'react';
import { BADGES, type Badge } from '../data/badges';
import { isBadgeUnlocked } from '../lib/badges';

function BadgeArt({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-clay-bg text-2xl text-ink-500"
        aria-label={`${badge.name} ${unlocked ? 'unlocked' : 'locked'}`}
      >
        <span aria-hidden="true">{unlocked ? '◆' : '🔒'}</span>
      </div>
    );
  }

  return (
    <img
      src={`/illustrations/badges/${badge.id}.png`}
      alt={badge.name}
      className={`mx-auto h-16 w-16 object-contain ${
        unlocked ? '' : 'opacity-40 grayscale'
      }`}
      onError={() => setImgFailed(true)}
    />
  );
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
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {BADGES.map((badge) => {
        const unlocked = isBadgeUnlocked(badge);

        return (
          <article
            key={badge.id}
            className={`rounded-xl bg-clay-bg p-4 text-center shadow-soft ${
              unlocked ? '' : 'opacity-90'
            }`}
          >
            <BadgeArt badge={badge} unlocked={unlocked} />
            <p className="mt-3 font-heading text-sm text-ink-900">{badge.name}</p>
            <p className="mt-1 text-xs text-ink-500">{badge.desc}</p>
          </article>
        );
      })}
    </section>
  );
}
