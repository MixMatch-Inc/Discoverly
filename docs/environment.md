# Environment Setup

Each app has its own `.env.example`. Copy it to `.env` before running
that app locally.

## `apps/api/.env.example`

| Variable         | Description                                  | Default                              |
| ---------------- | --------------------------------------------- | ------------------------------------ |
| `PORT`           | Port the API listens on                       | `5000`                                |
| `NODE_ENV`       | `development` \| `test` \| `production`        | `development`                         |
| `MONGODB_URI`    | MongoDB connection string                      | `mongodb://localhost:27017/discoverly` |
| `JWT_SECRET`     | Secret used to sign auth JWTs                  | _(set a strong random value)_         |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`, `1h`)                   | `7d`                                  |
| `CORS_ORIGIN`    | Allowed origin for browser requests            | `http://localhost:3000`               |

`MONGODB_URI` and `JWT_SECRET` have safe development defaults so the app
and tests run without any setup, but **must** be set explicitly in any
shared or production environment. Tests use `mongodb-memory-server` and
never touch `MONGODB_URI`.

## `apps/web/.env.example`

| Variable               | Description                  | Default                       |
| ----------------------- | ----------------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL`   | Base URL of the API's `/api` route | `http://localhost:5000/api` |

## `apps/mobile/.env.example`

| Variable               | Description                  | Default                       |
| ----------------------- | ----------------------------- | ------------------------------ |
| `EXPO_PUBLIC_API_URL`   | Base URL of the API's `/api` route | `http://localhost:5000/api` |

## Secrets handling

- Never commit `.env` files — they are gitignored.
- `JWT_SECRET` must be a long, random value outside of local
  development. Do not reuse the development default in any shared
  environment.
