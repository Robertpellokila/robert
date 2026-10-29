# My Little World — v0.8.10 (About Portrait Visibility Fix)

## Bug fixed

- Removed the large foreground tree on the left side of the About / Creative Studio interior.
- Kept a smaller potted plant in the far-right corner instead.
- Left the portrait mesh, interaction identifier, and `RoomObjectDetails.vue` unchanged, so the portrait remains clickable.
- No changes to the existing welcome flow, Lite Mode, chapter navigation or other five rooms.

## Why it happened

The tree at `(-2.83, -1.52)` was located between the player's first-person camera and the framed portrait at approximately `(-1.92, -2.40)`. Its foliage filled a large fraction of the view due to proximity / perspective. Deleting the decorative plant from this corridor is more reliable than shifting the photograph.

## What to test locally

1. Open `About`, enter Creative Studio, and verify the whole photo is visible from the entrance and as you approach it.
2. Click the photo and verify *All About Me* opens.
3. Check the workstation coding monitor and seated avatar still appear.
4. Exit and re-enter About; confirm that the photo remains uncovered.
5. Run `npm run build` in your local environment.

This patch was checked with syntax and source-level tests only; browser rendering is not guaranteed.
