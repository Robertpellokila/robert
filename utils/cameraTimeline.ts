/** Pure camera edit: no WebGL dependency, easy to test. */
import { clamp01, smoothstep, type CameraShot, type CinematicState } from '~/utils/cinematicJourney'

export interface CameraBlend { from: CameraShot; to: CameraShot; alpha: number }

/**
 * Each phase starts using the PREVIOUS shot then eases into a new one.
 * This avoids abrupt framing jumps at mount/ride/dismount boundaries.
 */
export function cameraBlendFor(state: CinematicState): CameraBlend {
  const shot = state.shot
  let from: CameraShot
  switch (state.phase) {
    case 'walk':
      from = shot === 'establishing' ? (state.leg === 0 ? 'establishing' : 'arrival') : 'establishing'
      break
    case 'approach': from = state.leg === 0 ? 'establishing' : 'arrival'; break
    case 'mount': from = 'establishing'; break
    case 'ride': from = 'follow'; break
    case 'dismount': from = 'tracking'; break
    case 'arrive': from = 'follow'; break
  }
  // Blend during first 22% of each phase, then hold the new shot.
  const alpha = smoothstep(clamp01(state.phaseProgress / 0.22))
  return { from, to: shot, alpha }
}
