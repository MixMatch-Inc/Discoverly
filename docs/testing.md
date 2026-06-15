# Testing Guide

## Running tests

```bash
# everything
npm run test --workspaces --if-present

# individually
npm run test -w @discoverly/api
npm run test -w @discoverly/web
npm run test -w @discoverly/mobile
```

## Test structure

### `apps/api`

- Framework: Vitest + Supertest.
- Module tests live alongside the module, e.g.
  `src/modules/auth/tests/auth.test.ts`.
- Tests spin up an in-memory MongoDB instance via
  `mongodb-memory-server`, so no external database is required.
- Coverage: registration (success, duplicate email, invalid input) and
  login (success, invalid password, non-existent account).

### `apps/web`

- Framework: Vitest + React Testing Library.
- Tests live in `__tests__/`.
- Coverage: login and register pages render correctly and show
  validation errors for invalid input, plus a success path that
  redirects after authenticating.

### `apps/mobile`

- Framework: Jest + React Native Testing Library.
- `__tests__/App.test.tsx` is a setup-verification test confirming the
  app renders. No screens or features exist yet, so no further tests
  are expected at this stage.

### `packages/shared` and `packages/stellar`

- No runtime tests yet (no business logic). CI validates lint and build
  only.

## CI expectations

Every pull request runs the workflows in `.github/workflows/`:

- **shared**: install, lint, build
- **api**: install, build shared, lint, test, build
- **web**: install, build shared, lint, test, build
- **mobile**: install, lint, test

A failing lint, test, or build step fails CI and blocks the PR.
