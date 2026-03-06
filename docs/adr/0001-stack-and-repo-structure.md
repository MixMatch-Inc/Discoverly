# ADR 0001: Discoverly Stack And Repository Structure

## Status
Accepted

## Decision
Discoverly uses:

- `mobile/`: Expo + React Native + TypeScript
- `backend/`: Node.js + Express + TypeScript + MongoDB (Mongoose)
- `web/`: reserved for future restaurant dashboard work

Repository shape:

```text
discoverly/
  backend/
  mobile/
  web/
  docs/
  legacy/
```

The previous NestJS backend is archived in `legacy/nest-backend/` and is not the active implementation target.

## Rationale
- Phase 1 and Phase 2 issues define MongoDB geospatial and aggregation requirements.
- A clear monorepo split removes ambiguity for contributors and CI.
- Archiving legacy code preserves historical context without blocking new work.

## Consequences
- All new backend issues target `backend/` only.
- New mobile issues target `mobile/` only.
- Contributors should not add features to `legacy/nest-backend/`.
