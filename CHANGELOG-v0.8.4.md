# My Little World v0.8.4 — Correct POV Controls & Readable Exhibits

Built directly on v0.8.3; preserves the existing low-poly city, chibi avatar, chapter-stop navigation, room entry, mini-map, Lite mode, project gallery and Night Mode.

## 1. Control fix

`world/roomExplorer.ts` now calculates **camera-relative** movement from a single basis:

- Three.js `PerspectiveCamera` looks down its **local -Z** axis.
- Facing forward in world coordinates: `(-sin(yaw), 0, -cos(yaw))`.
- Camera-relative right: `(cos(yaw), 0, -sin(yaw))`.
- W/S move along forward/backward; A/D strafe along right/left.
- Right arrow / E decrease yaw (turn right); left arrow / Q increase yaw.
- Drag to the right decreases yaw as well, consistent with right arrow.
- The previous mismatch between `camera.rotation.y` and `stepExplorer` has been removed.

This matters particularly after turning 30–180 degrees: at yaw=0 the older movement appeared correct, but after rotating the camera it diverged. Unit tests exercise seven different yaw angles, not just the starting orientation.

## 2. Improved room exhibits

- New `ResumeInlinePreview.vue` displays an embedded, readable CV using the same `owner`, `experiences`, `education`, and `skills` data used in `/resume`.
- If `owner.cvUrl` points to a **local PDF** (e.g. `/cv.pdf`), the room panel shows an iframe preview instead. The original PDF remains openable separately. Mobile browser PDF previews vary; the open action remains available.
- A physical **CV poster** replaces the abstract floating diamond inside Experience. The image is drawn using `THREE.CanvasTexture` without requiring Blender.
- Project Gallery now uses **labeled project posters** that can be clicked; the panels show cover art (labeled as concept art if appropriate), the challenge, technologies, highlights, and links.
- About portrait is larger and followed by clear explanatory text. The existing face reference is preserved.
- Content dialog is wider on desktop, scrollable on mobile, keyboard-dismissable with Escape, and automatically focuses its dialog for keyboard users.
- Other room data stay in one place: `data/roomObjects.ts` / `data/portfolio.ts` / `data/projects.ts`.

## 3. Verification

- `npm run test:logic` — regression checks including new 0.8.4 tests.
- `npm run test:room:v084` — camera-basis and content-specific checks.
- `npm run check:syntax` — syntax parsing of TypeScript/Vue script blocks.
- A Nuxt build, Vue SFC template compilation, and real Three.js browser rendering **were not verified** in the artifact environment. Run `npm run build` and test in your browser.
