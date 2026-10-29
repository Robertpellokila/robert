/** An opaque bridge at the exact moment orthographic exterior switches to POV. */
export function entryVeilOpacity(progress: number) {
  const t = Math.min(1, Math.max(0, progress))
  let blend = t < .985 ? (t - .87) / .115 : (1 - t) / .015
  blend = Math.max(0, Math.min(1, blend))
  return blend * blend * (3 - 2 * blend)
}
