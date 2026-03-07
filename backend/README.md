# Discoverly Backend

Active backend stack for contributors:

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

## Seed Data

Run the seed script to create:
Run:

```bash
npm run seed
```

This creates:

- 1 dummy restaurant
- 5 dummy food items

```bash
npm run seed
```

## Validation Example

`POST /api/ping` validates request bodies with Zod.

Valid payload:

```json
{
  "message": "hello",
  "timestamp": "2026-03-07T10:00:00.000Z"
}
```

Invalid payloads return a structured `400` response with a `details` array.

## Scope

This folder is the target for Phase 1 and Phase 2 backend issues.
Legacy NestJS code is archived under `/legacy/nest-backend`.

## Docker

From repository root:

```bash
docker-compose up --build
```

Health endpoint:

```bash
curl http://localhost:5000/api/health
```
