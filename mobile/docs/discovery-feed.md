# Discovery Feed Integration (Issue 2.5)

## APIs

- `GET /api/foods/discover`
- `POST /api/swipe`

## Prefetch Strategy

- Maintain a local card queue.
- After each swipe, if remaining cards are `<= 3`, fetch the next cursor page in background.
- Append next-page cards without blocking user interaction.

## Image Caching

- Use `expo-image` and run `Image.prefetch(urls)` for each fetched page.
- Render card images via `expo-image` with `contentFit="cover"`.

## Environment Variables

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_DEMO_USER_ID` (temporary user header for current backend integration)
