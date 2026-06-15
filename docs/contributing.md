# Contributor Guide

## Coding standards

- TypeScript strict mode is enabled across all packages.
- ESLint and Prettier enforce linting and formatting. Run
  `npm run lint -w <package>` before opening a PR, and
  `npm run format` to apply Prettier.
- Keep business logic inside the relevant module (`apps/api/src/modules/*`)
  — `shared/` directories are for cross-cutting infrastructure only.

## Project structure

See [architecture.md](architecture.md) for the full layout and
conventions, particularly the modular monolith structure of `apps/api`.

## Development workflow

1. Install dependencies from the repo root: `npm install`.
2. Build `@discoverly/shared` (required by `apps/api` and `apps/web`):
   `npm run build -w @discoverly/shared`.
3. Copy the relevant `.env.example` to `.env` for the app(s) you're
   running (see [environment.md](environment.md)).
4. Run the app(s) you're working on with `npm run dev -w <package>` (or
   `npm run start -w @discoverly/mobile` for mobile).
5. Run tests with `npm run test -w <package>` before opening a PR.

## Adding a new module to the API

Follow the shape of `apps/api/src/modules/auth`:

```
modules/<name>/
  controllers/
  services/
  repositories/   # if the module owns data
  validators/
  routes/
  types/
  tests/
```

Register the module's router in `apps/api/src/app.ts`.

## Contribution expectations

- New features should include tests.
- Keep PRs focused — one logical change per PR.
- CI (lint, test, build) must pass before merging.
