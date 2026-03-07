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

## Swipe Endpoint

`POST /api/swipe`

Payload:

```json
{
  "foodId": "660000000000000000000100",
  "action": "like"
}
```

Headers:

- `x-user-id`: current user id (temporary until full JWT auth integration)

Behavior:

- Always writes to `UserSwipe`
- `pass`: no cart mutation
- `like`: also creates an `active` `CartItem`
- Returns `404` if `foodId` does not exist
