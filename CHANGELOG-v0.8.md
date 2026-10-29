# CHANGELOG — v0.8.0 (Performance & Mobile)

## New
- **Lite Portfolio**: readable semantic HTML covering all 6 chapters and case studies, without WebGL/Three.js canvas. Can be used with keyboard and small screens.
- **3D/Lite toggle**: accessible controls, persists the user's choice, handles unsupported WebGL2 and 3D runtime failures.
- **First-frame loading state**: stops displaying the loader after the first successful render, not merely after canvas creation.
- **Quality presets**: Auto / High / Balanced / Low, with DPR limits and frame pacing, selective shadow disabling, and runtime quality readings.
- **Background pause**: suspend render loop on hidden tabs using Page Visibility API; restore with fresh frame delta.
- **Reduced-motion default**: new visitors with system reduced-motion choose Lite, though 3D can be enabled deliberately.
- **Responsive Lite layout**, lazy-loaded project imagery, accessible section links and semantic case-study navigation.
- **Regressions**: retained Project Gallery, GitHub, CV, interiors, NPC vehicles, day/night, dialogue and collectibles in 3D.
- **Unit tests**: 10 new performance/fallback checks, run with existing logic tests.

## Notes / limitations
- Auto quality **drops** to lower tiers during prolonged slow rendering; upgrading to a higher tier can always be done manually. Current implementation does not measure GPU timings or guarantee a target FPS.
- WebGL2 is checked before loading the expensive 3D bundle, but GPU context loss can still happen. If it does, Lite remains available.
- Lite is rendered first for SSR/accessibility; client can upgrade to 3D after hydration if supported.
- There is no asset streaming or texture compression because this project is still made of Three.js primitives, not GLB models.
- Full Nuxt build and browser WebGL testing should be performed locally; automated scripts test logic, not visual appearance.
