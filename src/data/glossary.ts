import { MODULES, type Module } from './modules';

export interface GlossaryEntry {
  id: string;          // e.g. "tool-use" (without the "glossary-" prefix)
  term: string;        // human-readable term, e.g. "tool use"
  definition: string;  // plain-text definition (HTML stripped)
  moduleId: string;    // e.g. "m01"
  moduleNum: string;   // e.g. "01"
  moduleTitle: string;
  moduleSlug: string;  // url slug for the module
}

type RawMdxLoader = () => Promise<string>;

const mdxRawLoaders = import.meta.glob<string>('../content/*.mdx', {
  query: '?raw',
  import: 'default'
}) as Record<string, RawMdxLoader>;

const ENTRY_RE =
  /<div\s+id="glossary-([^"]+)"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/g;

function stripJsxTags(value: string): string {
  return value
    .replace(/\{`([^`]*?)`\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function moduleFromPath(path: string): Module | undefined {
  const match = path.match(/m(\d{2})-/);
  if (!match) return undefined;
  return MODULES.find((m) => m.num === match[1]);
}

function parseEntries(path: string, raw: string): GlossaryEntry[] {
  const module = moduleFromPath(path);
  if (!module) return [];
  const entries: GlossaryEntry[] = [];
  ENTRY_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ENTRY_RE.exec(raw)) !== null) {
    const [, id, termRaw, defRaw] = match;
    const term = stripJsxTags(termRaw);
    const definition = stripJsxTags(defRaw);
    if (!term || !definition) continue;
    entries.push({
      id,
      term,
      definition,
      moduleId: module.id,
      moduleNum: module.num,
      moduleTitle: module.title,
      moduleSlug: module.slug
    });
  }
  return entries;
}

let cached: GlossaryEntry[] | null = null;
let inflight: Promise<GlossaryEntry[]> | null = null;

export async function loadGlossaryEntries(): Promise<GlossaryEntry[]> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = Promise.all(
    Object.entries(mdxRawLoaders).map(async ([path, load]) => {
      const raw = await load();
      return parseEntries(path, raw);
    })
  )
    .then((perFile) => {
      const all = perFile.flat();
      all.sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
      cached = all;
      return all;
    })
    .catch((error: unknown) => {
      inflight = null;
      throw error;
    });
  return inflight;
}

export function groupByLetter(entries: GlossaryEntry[]): Map<string, GlossaryEntry[]> {
  const byLetter = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const firstChar = entry.term[0]?.toUpperCase() ?? '#';
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(entry);
  }
  return byLetter;
}
