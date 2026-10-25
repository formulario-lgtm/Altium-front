import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const MAX_LINES = 1000;
const SOFT_LIMIT = 500;
const targets = ['src', 'tests', 'scripts'];
/** Generated from the OpenAPI contract; must not be hand-edited or split (also ignored by ESLint/Prettier). */
const excludedPrefixes = ['src/types/generated/'];

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(ts|tsx|js|mjs|cjs|vue)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function main(): void {
  const violations: string[] = [];
  const softWarnings: string[] = [];

  for (const target of targets) {
    for (const file of walk(join(root, target))) {
      const content = readFileSync(file, 'utf8');
      const lineCount = content.length === 0 ? 0 : content.split(/\r?\n/).length;
      const rel = relative(root, file).replace(/\\/g, '/');
      if (excludedPrefixes.some((prefix) => rel.startsWith(prefix))) {
        continue;
      }

      if (lineCount > MAX_LINES) {
        violations.push(`${rel}: ${lineCount} lines (max ${MAX_LINES})`);
      } else if (lineCount > SOFT_LIMIT) {
        softWarnings.push(`${rel}: ${lineCount} lines (preferred ≤ ${SOFT_LIMIT})`);
      }
    }
  }

  for (const warning of softWarnings) {
    console.warn(`[check:lines] WARN ${warning}`);
  }

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`[check:lines] ERROR ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[check:lines] OK — no source file exceeds ${MAX_LINES} lines.`);
}

main();
