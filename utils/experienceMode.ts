/** v0.8: no 3D dependencies are imported by this helper. */
export type ExperienceMode = 'lite' | '3d'
export function defaultExperience(webgl2: boolean, reducedMotion: boolean): ExperienceMode {
  return webgl2 && !reducedMotion ? '3d' : 'lite'
}
export function isExperienceMode(value: unknown): value is ExperienceMode {
  return value === 'lite' || value === '3d'
}
export function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', { powerPreference: 'low-power' })
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}
