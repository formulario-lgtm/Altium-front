import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function main(): void {
  const root = process.cwd();
  const contract = resolve(root, 'contracts/openapi.json');
  const committed = resolve(root, 'src/types/generated/api.ts');

  const tempDir = mkdtempSync(join(tmpdir(), 'altium-api-'));
  const tempOut = join(tempDir, 'api.ts');

  try {
    const result = spawnSync('pnpm', ['exec', 'openapi-typescript', contract, '-o', tempOut], {
      cwd: root,
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      console.error(result.stderr || result.stdout || 'openapi-typescript failed');
      process.exitCode = 1;
      return;
    }

    const normalize = (value: string) => `${value.replace(/\r\n/g, '\n').trimEnd()}\n`;
    const expected = normalize(readFileSync(tempOut, 'utf8'));
    const actual = normalize(readFileSync(committed, 'utf8'));

    if (expected !== actual) {
      console.error(
        '[api:check] src/types/generated/api.ts is out of date. Run pnpm api:generate after syncing contracts/openapi.json.',
      );
      process.exitCode = 1;
      return;
    }

    console.log('[api:check] OK — generated API types match contracts/openapi.json');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
