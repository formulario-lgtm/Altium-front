import { describe, expect, it, vi } from 'vitest';
import { buildSale } from '../../../tests/e2e/support/api-mock';
import { advanceSessionVersion } from './session-version';
import { updateSale } from './sales.service';
const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));
vi.mock('./client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./client')>()),
  backgroundApiClient: { PATCH: patch },
}));

describe('non-blocking draft transport', () => {
  it('returns the authoritative sale after a normal save', async () => {
    const sale = buildSale({ version: 2 });
    patch.mockResolvedValue({ data: sale, response: Response.json(sale) });
    expect(await updateSale(sale.id, { version: 1 })).toEqual(sale);
  });
  it('rejects a late successful response from an earlier session before it reaches the query cache', async () => {
    let finish!: (result: { data: ReturnType<typeof buildSale>; response: Response }) => void;
    patch.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const pending = updateSale(buildSale().id, { version: 1 });
    advanceSessionVersion();
    const sale = buildSale({ version: 2 });
    finish({ data: sale, response: Response.json(sale) });
    await expect(pending).rejects.toMatchObject({ kind: 'cancelled', code: 'SESSION_CHANGED' });
  });
});
