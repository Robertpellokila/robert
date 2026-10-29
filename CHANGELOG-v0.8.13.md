# Changelog v0.8.13 — WhatsApp & Character Greeting

## Added
- Added optional `owner.whatsapp` in `data/portfolio.ts`.
- Added `utils/whatsapp.ts` for validating a WhatsApp number and constructing `wa.me` links.
- Added **Chat via WhatsApp** button to shared `ContactForm.vue`, used by Contact Café and Lite Mode. Message is pre-filled but **never auto-sent**.
- Added a `greetingSignal` from the portfolio mode selection to `WorldScene` and the Three.js renderer.
- Added a camera-facing welcome, waving hand, brief invite gesture, and speech bubble when the 3D World experience begins.
- Added reduced-motion support for the animated greeting.
- Added 8 WhatsApp/greeting tests and updated the prior welcome-mode test harness with the new reactive signal.

## Preserved
- Original cinematic scroll and vehicle animation.
- Intro splash and compact choice modal.
- Direct Lite → 3D navigation without an additional mode prompt.
- First-person room exploration and contact barista waving animation.

## Limitations
- WhatsApp requires a valid number set by the site owner.
- The user's WhatsApp app must confirm sending a message.
- Nuxt full build/browser rendering is not verified in this environment.
