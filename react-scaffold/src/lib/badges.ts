import { type Badge } from '../data/badges';
import { MODULES } from '../data/modules';
import { getCurrentStreak, getModule, getOverall, getSandbox } from './progress';

export function isBadgeUnlocked(badge: Badge): boolean {
  switch (badge.unlock.kind) {
    case 'module':
      return getModule(badge.unlock.moduleId).status === 'completed';
    case 'sandbox':
      return getSandbox(badge.unlock.sandboxId).status === 'passed';
    case 'modules-completed':
      return getOverall().modulesCompleted >= badge.unlock.count;
    case 'sandboxes-passed':
      return getOverall().sandboxesPassed >= badge.unlock.count;
    case 'track-complete': {
      const trackId = badge.unlock.trackId;
      const trackModules = MODULES.filter((m) => m.track === trackId);
      return (
        trackModules.length > 0 &&
        trackModules.every((m) => getModule(m.id).status === 'completed')
      );
    }
    case 'sandbox-streak':
      return getCurrentStreak() >= badge.unlock.count;
    case 'modules-completed-list':
      return badge.unlock.moduleIds.every(
        (id) => getModule(id).status === 'completed'
      );
  }
}
