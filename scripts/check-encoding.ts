import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const root = process.cwd();
const targets =
  process.argv.length > 2 ? process.argv.slice(2) : ['src', 'tests', 'scripts', 'docs'];
const extensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.vue',
  '.scss',
  '.css',
  '.md',
  '.json',
]);
const decoder = new TextDecoder('utf-8', { fatal: true });
let failures = 0;

function check(path: string): void {
  if (!existsSync(path)) {
    console.error(`[check:encoding] Missing path: ${relative(root, path)}`);
    failures++;
    return;
  }
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) check(resolve(path, entry));
    return;
  }
  if (!extensions.has(extname(path))) return;
  try {
    const text = decoder.decode(readFileSync(path));
    if (text.includes('\uFFFD')) throw new Error('Replacement character');
  } catch {
    console.error(
      `[check:encoding] Invalid UTF-8 or replacement character: ${relative(root, path)}`,
    );
    failures++;
  }
}

for (const target of targets) check(resolve(root, target));
if (failures) process.exitCode = 1;
else console.log('[check:encoding] OK — source, tests and documentation use valid UTF-8.');
