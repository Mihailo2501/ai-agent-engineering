export type TrackId = 'foundations' | 'interfaces' | 'building' | 'production' | 'applied';

export interface Track {
  id: TrackId;
  num: 1 | 2 | 3 | 4 | 5;
  name: string;
  blurb: string;
}

export const TRACKS: Track[] = [
  {
    id: 'foundations',
    num: 1,
    name: 'Foundations',
    blurb: 'Primitives, inference, agent patterns, prompt engineering, multimodal.'
  },
  {
    id: 'interfaces',
    num: 2,
    name: 'Interfaces',
    blurb: 'API, SDK, CLI, MCP. Harnesses. Claude Code surface. Managed platforms.'
  },
  {
    id: 'building',
    num: 3,
    name: 'Building',
    blurb: 'Tool design, memory, structured output, browser, voice, async.'
  },
  {
    id: 'production',
    num: 4,
    name: 'Production',
    blurb: 'Evaluation, cost, security, observability.'
  },
  {
    id: 'applied',
    num: 5,
    name: 'Applied',
    blurb: 'Open source models, coding agents, three GTM agent builds, Potter case study.'
  }
];
