# Food Details Modal (Issue 2.6)

## Behavior

- Tapping a card opens an animated bottom-sheet modal.
- Modal displays:
  - food name
  - restaurant name
  - distance
  - price
  - full description
- Modal can be dismissed by tapping the backdrop.

## Swipe Actions In Modal

- `Swipe Left` and `Swipe Right` buttons are available in the modal.
- Pressing either button:
  1. closes the modal
  2. advances/removes the top card
  3. triggers `POST /api/swipe` in background

## Notes

- Discover list uses the same in-memory queue as modal actions.
- Image rendering uses `expo-image`.
