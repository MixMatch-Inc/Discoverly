# Mobile CI/CD Notes (Issue 1.2)

## EAS Profiles

- `development`: internal dev client builds, local API base URL
- `preview`: internal preview builds for QA
- `production`: release builds for store distribution

## GitHub Actions

Workflow: `.github/workflows/mobile.yml`

Checks on pull requests:

1. `npm install`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run export:check` (Expo export dry-run compile check)

## Secret Handling

- Never commit API keys, tokens, or private credentials.
- Store mobile build/runtime secrets in:
  - GitHub Actions Secrets (CI)
  - EAS Secrets (build-time)
- Keep `.env` out of source control and use `.env.example` placeholders.
