import entries from './glossary-entries.json';

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  moduleId: string;
  moduleNum: string;
  moduleTitle: string;
  moduleSlug: string;
}

const ENTRIES = entries as GlossaryEntry[];

export async function loadGlossaryEntries(): Promise<GlossaryEntry[]> {
  return ENTRIES;
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
