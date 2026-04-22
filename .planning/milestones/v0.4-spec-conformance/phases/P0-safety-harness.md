# P0 — Safety Harness

**Why first**: every subsequent phase needs a regression signal. This phase provides it.

## Deliverables

1. `tests/contracts/run.mjs` — Node script that hits 15 live endpoints, writes responses to `tests/contracts/fixtures/*.json`, and on subsequent runs diffs. Exits non-zero on diff.
2. `tests/contracts/fixtures/*.json` — baseline snapshots captured against the live Railway deploy
3. `e2e/playwright.config.ts` — Playwright config pointing at local docker-compose
4. `e2e/smoke.spec.ts` — Playwright smoke covering:
   - Login → dashboard renders
   - Commit editor renders for current week
   - RCDO list renders
   - AI summary endpoint returns content
5. `.github/workflows/regression.yml` — GH Actions job running: backend Docker build, `npm ci && vitest`, contract snapshot verify against live API, Playwright against local docker-compose

## Acceptance

- `npm run contracts:verify` exits 0
- `npx playwright test` exits 0 against local docker-compose
- GitHub Actions workflow file validates (yamllint clean)

## Regression guard used AFTER this phase

- `tests/contracts/run.mjs` diff-mode = regression signal for backend changes
- `npx playwright test` = regression signal for frontend changes
- `npx vitest run` = unit regression signal
