// Pre-builds src/data/glossary-entries.json from the MDX files.
// The runtime glossary loader cannot read raw MDX because Vite's MDX plugin
// transforms .mdx files even when imported with ?raw. So we extract the
// glossary blocks at build time instead.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content');
const MODULES_FILE = path.join(ROOT, 'src/data/modules.ts');
const OUTPUT = path.join(ROOT, 'src/data/glossary-entries.json');

const ENTRY_RE =
  /<div\s+id="glossary-([^"]+)"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/g;

const MODULE_RE =
  /\{\s*id:\s*'([^']+)',\s*num:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)'/g;

function stripJsxTags(value) {
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

function parseModules() {
  const raw = fs.readFileSync(MODULES_FILE, 'utf8');
  const modules = [];
  MODULE_RE.lastIndex = 0;
  let match;
  while ((match = MODULE_RE.exec(raw)) !== null) {
    const [, id, num, slug, title] = match;
    modules.push({ id, num, slug, title });
  }
  return modules;
}

function moduleFromPath(filename, modules) {
  const match = filename.match(/m(\d{2})-/);
  if (!match) return undefined;
  return modules.find((m) => m.num === match[1]);
}

function parseEntries(filename, raw, modules) {
  const module = moduleFromPath(filename, modules);
  if (!module) return [];
  const entries = [];
  ENTRY_RE.lastIndex = 0;
  let match;
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

function build() {
  const modules = parseModules();
  if (modules.length === 0) {
    throw new Error('build-glossary: no modules parsed from src/data/modules.ts');
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  const all = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    all.push(...parseEntries(f, raw, modules));
  }

  all.sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));

  fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2) + '\n', 'utf8');
  console.log(`build-glossary: wrote ${all.length} entries to ${path.relative(ROOT, OUTPUT)}`);
}

build();
