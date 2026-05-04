import type { TrackId } from './tracks';

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlock: BadgeUnlock;
}

export type BadgeUnlock =
  | { kind: 'module'; moduleId: string }
  | { kind: 'sandbox'; sandboxId: string }
  | { kind: 'modules-completed'; count: number }
  | { kind: 'sandboxes-passed'; count: number }
  | { kind: 'track-complete'; trackId: TrackId }
  | { kind: 'sandbox-streak'; count: number }
  | { kind: 'modules-completed-list'; moduleIds: string[] };

export const BADGES: Badge[] = [
  { id: 'foundations-track', name: 'Foundations', desc: 'Finished all of Track 1 Foundations', icon: '◆', unlock: { kind: 'track-complete', trackId: 'foundations' } },
  { id: 'interfaces-track', name: 'Interfaces', desc: 'Finished all of Track 2 Interfaces', icon: '◆', unlock: { kind: 'track-complete', trackId: 'interfaces' } },
  { id: 'building-track', name: 'Building', desc: 'Finished all of Track 3 Building', icon: '◆', unlock: { kind: 'track-complete', trackId: 'building' } },
  { id: 'production-track', name: 'Production', desc: 'Finished all of Track 4 Production', icon: '◆', unlock: { kind: 'track-complete', trackId: 'production' } },
  { id: 'applied-track', name: 'Applied', desc: 'Finished all of Track 5 Applied', icon: '◆', unlock: { kind: 'track-complete', trackId: 'applied' } },

  { id: 'byok', name: 'BYOK', desc: 'Made a real Anthropic API call from a sandbox', icon: '◆', unlock: { kind: 'sandbox', sandboxId: 'm01-real-call' } },
  { id: 'sandbox-streak', name: 'Sandbox Streak', desc: 'Passed five sandboxes in a row', icon: '◆', unlock: { kind: 'sandbox-streak', count: 5 } },
  { id: 'halfway', name: 'Halfway', desc: 'Completed twelve modules', icon: '◆', unlock: { kind: 'modules-completed', count: 12 } },
  { id: 'course-complete', name: 'Course Complete', desc: 'Finished all 25 modules', icon: '◆', unlock: { kind: 'modules-completed', count: 25 } },
  { id: 'three-gtm-agents', name: 'Three GTM Agents', desc: 'Built all three GTM agents', icon: '◆', unlock: { kind: 'modules-completed-list', moduleIds: ['m22', 'm23', 'm24'] } },

  { id: 'tool-designer', name: 'Tool Designer', desc: 'Completed Module 10 Tool design at scale', icon: '◆', unlock: { kind: 'module', moduleId: 'm10' } },
  { id: 'browser-pilot', name: 'Browser Pilot', desc: 'Completed Module 13 Browser and web automation', icon: '◆', unlock: { kind: 'module', moduleId: 'm13' } },
  { id: 'open-source-explorer', name: 'Open Source Explorer', desc: 'Completed Module 20 Open source models', icon: '◆', unlock: { kind: 'module', moduleId: 'm20' } },
  { id: 'potter-initiate', name: 'Potter Initiate', desc: 'Walked the Potter case study', icon: '◆', unlock: { kind: 'module', moduleId: 'm25' } }
];
