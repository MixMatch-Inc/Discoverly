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

## Why This Bootstrap Exists

This repository was normalized so contributors can pick up Phase 1/2 issues without
stack ambiguity. The active implementation target is documented in:

- `docs/adr/0001-stack-and-repo-structure.md`

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

## CI Baseline

Starter workflows are included for backend/mobile PR checks:

- `.github/workflows/backend.yml`
- `.github/workflows/mobile.yml`

They run install + lint + typecheck and are intended to be extended as issues 1.1 and 1.2 progress.
