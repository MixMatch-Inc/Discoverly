# @discoverly/api

Express + TypeScript modular monolith. Currently implements the **auth**
module (registration, login, and an authenticated `/me` endpoint) and a
supporting **users** module.

## Structure

```
src/
  app.ts                  # Express app wiring (middleware, routes)
  server.ts               # Entry point: connects to MongoDB and starts the server
  modules/
    auth/                 # Controllers, services, routes, validators, middleware, tests
    users/                # User model, repository, service
  shared/
    config/               # Environment validation
    database/              # MongoDB connection helper
    errors/                # AppError and HTTP error classes
    logger/                # Lightweight structured logger
    middleware/            # Error handler, 404 handler
    types/                  # Express type augmentations
```

## Running

```bash
cp .env.example .env
npm run dev -w @discoverly/api
```

The API listens on `http://localhost:5000` and exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
- `GET /api/health`

## Testing

```bash
npm run test -w @discoverly/api
```

Tests use `mongodb-memory-server`, so no external database is required.
