# Architecture

## Monorepo layout

```
apps/
  api/      # Express + TypeScript modular monolith (auth API)
  web/      # Next.js + TypeScript web app (login / create account)
  mobile/   # Expo + React Native + TypeScript foundation

packages/
  shared/   # Shared types & zod validation schemas
  stellar/  # Placeholder scaffold for future Stellar integration

.github/workflows/  # CI for each package
docs/                # Architecture, environment, testing, contributing
```

`apps/*` are independently runnable applications. `packages/*` are
internal libraries consumed via npm workspaces (`@discoverly/shared`,
`@discoverly/stellar`).

## Backend: modular monolith

`apps/api` is a single Express application, a single deployment
artifact, and talks to a single MongoDB database. It is organized by
business module rather than by technical layer:

```
src/
  app.ts                  # Express app wiring
  server.ts               # Entry point (connects DB, starts server)
  modules/
    auth/
      controllers/        # HTTP request/response handling
      services/           # Business logic
      routes/              # Route definitions
      validators/          # Request validation (zod)
      middleware/           # Module-specific middleware (e.g. authenticate)
      types/                # Module-specific types
      tests/                # Module tests
    users/
      repositories/         # Data access (Mongoose model + repository)
      services/
      types/
  shared/
    config/                 # Environment validation
    database/                # MongoDB connection
    errors/                  # AppError and HTTP error classes
    logger/                  # Lightweight structured logger
    middleware/               # Cross-cutting middleware (error handler, 404)
    types/                     # Express type augmentations
```

### Conventions

- Each module owns its controllers, services, validators, routes, types,
  and tests. Business logic stays inside the module.
- `shared/` contains only cross-cutting infrastructure — no business
  logic.
- New business modules should follow the same shape as `auth/` and live
  alongside it under `src/modules/`.
- Validation schemas that are useful to both the API and the web/mobile
  clients live in `@discoverly/shared` and are imported from there.

## Frontend conventions

- `apps/web` uses the Next.js App Router. Pages are thin; shared UI
  lives in `components/`, and client-side auth state lives in
  `lib/auth-context.tsx`.
- `apps/mobile` currently contains only the project foundation. New
  screens go in `src/screens`, shared UI in `src/components`,
  navigation in `src/navigation`, etc.

## Stellar package

`packages/stellar` is an empty scaffold reserved for future Stellar
integration. It contains only placeholder types/interfaces and compiles
successfully, but has no blockchain logic.
