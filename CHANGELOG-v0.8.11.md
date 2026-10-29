# Changelog v0.8.11 — Exterior Tree Clipping Fix

## Root cause

The tree drawn across the About portrait was **not** created by `roomDecor.ts`.
`createWorld.ts` adds a separate set of outdoor trees directly to the scene.
One tree at `(-20, -8.1)` falls inside the About room footprint relative to
its world center at `(-17.5, -5.8)`. It remains rendered even after the
exterior About building is hidden.

## Fix

- Move the overlapping tree from `(-20, -8.1)` to `(-22.2, -10.5)`.
- Hide all `addScenery()` outdoor trees during room exploration (`entry >= 0.55`).
- Restore outdoor trees automatically when exiting a room.
- Leave the photo's position, click handler, and room furniture unchanged.
- Add `scripts/test-about-tree-v0811.cjs` regression test.

## Verify locally

`npm install && npm run test:about-tree && npm run dev`

Open About in 3D mode, then check your photo from the first-person entrance.
Also test Exit Room to confirm outdoor trees return.

Note: source-level tests do not replace an actual browser/WebGL test.
