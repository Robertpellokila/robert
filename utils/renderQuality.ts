/** Small deterministic quality policy; can be tested without a browser or WebGL. */
export type QualityPreference = 'auto' | 'high' | 'balanced' | 'low'
export type RenderQualityTier = Exclude<QualityPreference, 'auto'>

export const qualityFPS: Record<RenderQualityTier, number> = {
  high: 60, balanced: 30, low: 20,
}
export const qualityDPR: Record<RenderQualityTier, number> = {
  high: 1.5, balanced: 1.15, low: 1,
}
export function pickInitialTier(width: number, reducedMotion: boolean, cores = 4): RenderQualityTier {
  if (reducedMotion || width < 700 || cores <= 2) return 'low'
  return width < 1100 || cores <= 4 ? 'balanced' : 'high'
}
/** Hysteresis: drop quickly below 80% target, recover only above 95% target. */
export function adaptTier(current: RenderQualityTier, observedFPS: number): RenderQualityTier {
  if (!Number.isFinite(observedFPS) || observedFPS <= 0) return current
  if (current === 'high' && observedFPS < 47) return 'balanced'
  if (current === 'balanced' && observedFPS < 22) return 'low'
  if (current === 'low' && observedFPS > 38) return 'balanced'
  if (current === 'balanced' && observedFPS > 56) return 'high'
  return current
}
export function targetInterval(tier: RenderQualityTier) { return 1000 / qualityFPS[tier] }
