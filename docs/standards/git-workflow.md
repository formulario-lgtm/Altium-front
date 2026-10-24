# Git workflow

## Agent restrictions

Agents must **not** `git commit`, `git push`, create tags, or rewrite remotes unless the user explicitly requests that action.

Commit permission does **not** include push permission.

## Before an authorized commit

1. `pnpm check` passes.
2. Run `pnpm test:e2e` when UI flows changed (browsers installed).
3. Docs + CHANGELOG updated.
4. No secrets / `.env` staged.
5. Report results to the user.

If validation fails, fix first — do not commit.
