# Discoverly Mobile

Active mobile stack for contributors:

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start app:

```bash
npm run start
```

## Notes

- Deep link scheme is `discoverly`.
- EAS profiles are defined in `eas.json`.
- Discovery tab pulls from `GET /api/foods/discover`.
- Swipe actions post to `POST /api/swipe`.
- Feed prefetch starts when only 3 cards remain.
- `expo-image` is used for image caching/prefetch to reduce flicker.
- Do not hardcode secrets in source files. Keep sensitive values in EAS secrets
  or CI environment variables.
- Only `EXPO_PUBLIC_*` variables should be exposed to client runtime code.
