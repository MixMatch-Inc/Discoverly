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

## Discovery Endpoint

`GET /api/foods/discover`

Query params:

- `longitude` (number, required)
- `latitude` (number, required)
- `cursor` (string, optional)

Behavior:

- Uses MongoDB geospatial query with a 10km radius
- Sorts results by nearest restaurant first
- Returns up to 10 items per page
- Includes `distanceMeters` on each item
- Returns next `cursor` when additional items exist
