import { getCinematicState } from '~/utils/cinematicJourney'
import type { TravelMode } from '~/data/portfolio'

/**
 * Compatibility helper for v0.2 UI code. In v0.3 all leg calculations
 * come from getCinematicState() — there is only one source of truth.
 */
export function getTravelState(progress: number): { leg: number; portion: number; mode: TravelMode } {
  const { leg, portion, mode } = getCinematicState(progress)
  return { leg, portion, mode }
}

export const travelLabels: Record<TravelMode, string> = {
  walk: 'ON FOOT',
  motorbike: 'BY MOTORBIKE',
  bus: 'BY BUS',
}
