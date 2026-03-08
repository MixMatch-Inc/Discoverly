# Discoverly

Discoverly is a swipe-first food discovery app with Stellar-powered checkout.

## Active Stack

- Mobile: Expo + React Native + TypeScript
- Backend: Node.js + Express + TypeScript + MongoDB (Mongoose)
- Blockchain: Stellar

## Repository Structure

```text
discoverly/
  backend/                # Active backend implementation
  mobile/                 # Active mobile implementation
  web/                    # Reserved for restaurant dashboard
  docs/adr/               # Architecture decisions
  legacy/nest-backend/    # Archived legacy backend (read-only)
```

## Quick Start

### 1) Install Workspace Dependencies

```bash
npm run bootstrap
```

### 2) Run Backend

```bash
cd backend
cp .env.example .env
npm run dev
```

Or run backend + Mongo together from repo root:

```bash
docker-compose up --build
```

Smoke test after containers are up:

```bash
curl http://localhost:5000/api/health
```

### 3) Run Mobile

```bash
cd mobile
cp .env.example .env
npm run start
```

## Backend Upload Service

The backend exposes:

- `POST /api/upload` (multipart form-data)
- file field name: `file`
- max file size: `5MB`
- storage target: S3

See `/backend/.env.example` for required AWS variables.
