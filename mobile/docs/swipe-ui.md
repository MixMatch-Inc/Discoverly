# High-Performance Swipe UI

This screen implements a gesture-driven swipe stack using `react-native-reanimated` and
`react-native-gesture-handler`.

## Behavior

- The top card follows the user's finger on both X and Y.
- `SWIPE_THRESHOLD` is set to `120` pixels.
- Swiping beyond threshold animates the card out and consumes it from the stack.
- Right swipe logs `Swiped Right: [food_id]`.
- Left swipe logs `Swiped Left: [food_id]`.

## Visual Feedback

- LIKE stamp appears while dragging right.
- NOPE stamp appears while dragging left.
- As the top card moves away, the next card scales up to replace it smoothly.

## Data

- Screen uses local mock data from `src/mocks/foods.ts`.
