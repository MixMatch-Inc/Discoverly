# @discoverly/mobile

Expo + React Native + TypeScript foundation. No screens or business logic
are implemented yet — this package establishes the project structure,
tooling, and testing setup for future development.

## Structure

```
App.tsx           # Entry component
src/
  components/     # Shared UI components (empty)
  screens/        # App screens (empty)
  navigation/      # Navigation setup (empty)
  hooks/           # Custom hooks (empty)
  services/        # API/data services (empty)
  utils/           # Utilities (empty)
  assets/          # Images, fonts, etc. (empty)
```

## Running

```bash
cp .env.example .env
npm run start -w @discoverly/mobile
```

This launches the Expo dev server.

## Testing

```bash
npm run test -w @discoverly/mobile
```

Runs a basic setup-verification test to confirm the testing
infrastructure (Jest + jest-expo + React Native Testing Library) works.
