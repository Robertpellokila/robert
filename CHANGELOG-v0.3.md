# Change Log v0.2 → v0.3

## Existing source preserved

All six sections and their card content, GitHub endpoint, photo support, responsive CSS, GSAP scroll, and the working `WorldScene.vue` DOM mounting strategy from v0.2.

## Added

- `utils/cinematicJourney.ts`: phase-based journey storyboard
- `world/animateCharacter.ts`: deterministic procedural human movement (walking, waving, mounting, riding)
- `world/animateScene.ts`: one character and vehicles coordinated by scroll and local-to-world positioning
- `world/cameraDirector.ts`: four camera shots, dynamic orthographic zoom, scroll-based target, damped movement
- `scripts/test-journey.cjs`: scroll logic regression tests
- `npm run test:journey` script

## Changed

- `world/createWorld.ts`: clearer hoodie portrait, no duplicate motor rider, bus door and step, new render loop and camera director; scene/scenery/lighting remain
- `components/WorldScene.vue`: optional `cinematic` prop; render context is **not re-created** on toggle
- `pages/index.vue`: adds Cinematic/Calm toggle and current action caption
- `composables/useJourney.ts`: information panel switches near arrival, not mid-route
- `assets/css/main.css`: compact toggle HUD layout
- `utils/journey.ts`: compatibility wrapper delegating to single cinematic state source
- `package.json`: v0.3.0 and test command
- `README.md`, `PANDUAN_BELAJAR.md`: step-by-step documentation

## Testing

7 pure storyboard tests pass; all `.ts` and Vue `<script setup>` blocks pass TypeScript **syntax transpilation**. This does not replace typechecking using installed dependencies, building Nuxt, or WebGL rendering tests in Chrome.
