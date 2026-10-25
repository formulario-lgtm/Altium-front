/**
 * Fail when a Vue SFC uses a Vuetify `<v-*>` whose entry is not in `optimizeDeps`.
 * Prevents blank first-load of lazy routes (Vite dep re-optimization reload).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TAG_TO_OPTIMIZE_ENTRY, vuetifyOptimizeDeps } from './vuetify-optimize-deps';

const root = process.cwd();
const TAG_RE = /<v-([a-z][a-z0-9-]*)\b/g;

function walkVue(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkVue(fullPath));
    } else if (entry.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main(): void {
  const allowed = new Set(
    vuetifyOptimizeDeps.map((entry) => entry.replace('vuetify/components/', '')),
  );

  const missingByTag = new Map<string, Set<string>>();
  const unknownTags = new Map<string, Set<string>>();

  for (const file of walkVue(join(root, 'src'))) {
    const rel = relative(root, file).replace(/\\/g, '/');
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(TAG_RE)) {
      const tag = match[1]!;
      const entry = TAG_TO_OPTIMIZE_ENTRY[tag];
      if (!entry) {
        const set = unknownTags.get(tag) ?? new Set();
        set.add(rel);
        unknownTags.set(tag, set);
        continue;
      }
      if (!allowed.has(entry)) {
        const set = missingByTag.get(tag) ?? new Set();
        set.add(rel);
        missingByTag.set(tag, set);
      }
    }
  }

  let failed = false;

  if (missingByTag.size > 0) {
    failed = true;
    console.error(
      '[check:vuetify-deps] ERROR: Vuetify tags used in src/ but missing from optimizeDeps.',
    );
    console.error(
      '  Add the entry to scripts/vuetify-optimize-deps.ts (imported by vite.config.ts).',
    );
    console.error(
      '  Without this, the first lazy navigation blanks/reloads while Vite re-optimizes.',
    );
    for (const [tag, files] of [...missingByTag.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const entry = TAG_TO_OPTIMIZE_ENTRY[tag];
      console.error(`  <v-${tag}> → vuetify/components/${entry}`);
      for (const file of [...files].sort()) {
        console.error(`    - ${file}`);
      }
    }
  }

  if (unknownTags.size > 0) {
    failed = true;
    console.error(
      '[check:vuetify-deps] ERROR: Unknown <v-*> tags — map them in TAG_TO_OPTIMIZE_ENTRY.',
    );
    for (const [tag, files] of [...unknownTags.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      console.error(`  <v-${tag}>`);
      for (const file of [...files].sort()) {
        console.error(`    - ${file}`);
      }
    }
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log(
    `[check:vuetify-deps] OK (${vuetifyOptimizeDeps.length} optimizeDeps entries cover all src/ Vuetify tags)`,
  );
}

main();
