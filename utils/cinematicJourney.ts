/**
 * v0.3 — Pure functions only (no DOM / Three.js).
 * This makes travel animation deterministic and reversible when scrolling back.
 * Every leg occupies 1/(number of routes) of scroll progress.
 */
import { routes, type TravelMode } from '~/data/portfolio'

export type TravelPhase = 'walk' | 'approach' | 'mount' | 'ride' | 'dismount' | 'arrive'
export type CameraShot = 'establishing' | 'follow' | 'tracking' | 'arrival'

export interface CinematicState {
  leg: number
  portion: number
  mode: TravelMode
  phase: TravelPhase
  /** Position between the current and next chapter, independently of mount/dismount. */
  distance: number
  /** 0..1 within the selected phase. */
  phaseProgress: number
  shot: CameraShot
  caption: string
}

export const clamp01 = (number: number) => Math.min(1, Math.max(0, Number.isFinite(number) ? number : 0))
export const smoothstep = (n: number) => { const t = clamp01(n); return t * t * (3 - 2 * t) }
export const mix = (a: number, b: number, t: number) => a + (b - a) * clamp01(t)

function section(t: number, start: number, end: number) {
  return clamp01((t - start) / (end - start))
}

/**
 * Scroll storyboard per segment:
 * Walking   : leave immediately, travel continuously, stop at next chapter.
 * Motorbike : 0-.12 approach, .12-.24 mount, .24-.82 ride,
 *             .82-.94 dismount, .94-1 arrival.
 * Bus       : 0-.14 approach, .14-.26 board, .26-.83 ride,
 *             .83-.95 exit, .95-1 arrival.
 *
 * Important: vehicles appear at the BEGINNING of their leg, not the midpoint.
 */
export function getCinematicState(progress: number): CinematicState {
  const t = clamp01(progress)
  const scaled = Math.min(routes.length - 0.00000001, t * routes.length)
  const leg = Math.floor(scaled)
  const portion = scaled - leg
  const mode = routes[leg] ?? 'walk'

  if (mode === 'walk') {
    if (portion < 0.04) return { leg, portion, mode, phase: 'walk', distance: portion, phaseProgress: portion / 0.04, shot: 'establishing', caption: 'Starting on foot' }
    if (portion > 0.95) return { leg, portion, mode, phase: 'arrive', distance: portion, phaseProgress: section(portion, .95, 1), shot: 'arrival', caption: 'Arriving at the next stop' }
    return { leg, portion, mode, phase: 'walk', distance: portion, phaseProgress: section(portion, .04, .95), shot: 'follow', caption: 'Exploring on foot' }
  }

  const isBus = mode === 'bus'
  const approachEnd = isBus ? .14 : .12
  const mountEnd = isBus ? .26 : .24
  const rideEnd = isBus ? .83 : .82
  const exitEnd = isBus ? .95 : .94
  const vehicle = isBus ? 'bus' : 'motorbike'
  if (portion < approachEnd) return { leg, portion, mode, phase: 'approach', distance: 0, phaseProgress: smoothstep(section(portion, 0, approachEnd)), shot: 'establishing', caption: `Walking to the ${vehicle}` }
  if (portion < mountEnd) return { leg, portion, mode, phase: 'mount', distance: 0, phaseProgress: smoothstep(section(portion, approachEnd, mountEnd)), shot: 'follow', caption: isBus ? 'Boarding the bus' : 'Getting on the motorbike' }
  if (portion < rideEnd) return { leg, portion, mode, phase: 'ride', distance: smoothstep(section(portion, mountEnd, rideEnd)), phaseProgress: section(portion, mountEnd, rideEnd), shot: 'tracking', caption: isBus ? 'Riding through the city' : 'Riding to the tech district' }
  if (portion < exitEnd) return { leg, portion, mode, phase: 'dismount', distance: 1, phaseProgress: smoothstep(section(portion, rideEnd, exitEnd)), shot: 'follow', caption: isBus ? 'Stepping off the bus' : 'Getting off the motorbike' }
  return { leg, portion, mode, phase: 'arrive', distance: 1, phaseProgress: section(portion, exitEnd, 1), shot: 'arrival', caption: 'Arrived at the next stop' }
}
