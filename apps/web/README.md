# @discoverly/web

Next.js (App Router) + TypeScript web app providing the authentication
experience: login and create-account pages.

## Structure

```
app/
  layout.tsx      # Root layout, wraps the app in AuthProvider
  page.tsx        # Landing page with links to login/register
  login/page.tsx
  register/page.tsx
components/
  AuthForm.tsx     # Reusable form with validation, loading, and error states
  TextField.tsx
lib/
  api-client.ts    # Fetch wrapper for the API's auth endpoints
  auth-context.tsx # Client-side auth state (token + user, persisted to localStorage)
```

## Running

```bash
cp .env.example .env
npm run dev -w @discoverly/web
```

Visit `http://localhost:3000/login` or `http://localhost:3000/register`.
The app expects `@discoverly/api` to be running at the URL configured by
`NEXT_PUBLIC_API_URL`.

## Testing

```bash
npm run test -w @discoverly/web
```
