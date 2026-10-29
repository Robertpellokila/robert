/** Pure numeric helpers. No Vue or Three.js: easy to test independently. */
export function clampUnit(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

/** Wrap a trip around the same 0..1 circuit (works for negative values too). */
export function wrapUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

/** Stable interpolation factor irrespective of display refresh rate. */
export function dampingFactor(deltaSeconds: number, response = 3) {
  return 1 - Math.exp(-Math.max(0, deltaSeconds) * Math.max(0, response))
}

/** Environmental animation uses time, not scroll. Hero journey remains scroll-driven. */
export function npcProgress(elapsed: number, speed: number, offset: number, backwards = false) {
  const t = wrapUnit(offset + Math.max(0, elapsed) * speed)
  return backwards ? 1 - t : t
}
