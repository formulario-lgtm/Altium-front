import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const contract = resolve(root, 'contracts/openapi.json');
const output = resolve(root, 'src/types/generated/api.ts');

mkdirSync(dirname(output), { recursive: true });

const result = spawnSync('pnpm', ['exec', 'openapi-typescript', contract, '-o', output], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('[api:generate] Wrote src/types/generated/api.ts from contracts/openapi.json');
