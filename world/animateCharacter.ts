import type { Group } from 'three'
import { clamp01, mix } from '~/utils/cinematicJourney'

/** The pivot groups are assembled in createWorld.ts. */
export interface CharacterRig {
  group: Group
  head: Group
  leftArm: Group
  rightArm: Group
  leftLeg: Group
  rightLeg: Group
}

export type CharacterPose = 'idle' | 'walk' | 'board' | 'rideMotor' | 'exit' | 'wave' | 'invite'

/**
 * Poses are derived from scroll progress instead of a clock, so rewinding
 * the scrollbar also rewinds every step and limb gesture.
 */
export function poseCharacter(character: CharacterRig, pose: CharacterPose, walkCycle: number, amount = 1) {
  const weight = clamp01(amount)
  const step = Math.sin(walkCycle * Math.PI * 2)
  const gait = pose === 'walk' || pose === 'board' || pose === 'exit' ? weight : 0
  const riding = pose === 'rideMotor' ? weight : 0
  const wave = pose === 'wave' ? weight : 0
  const invite = pose === 'invite' ? weight : 0

  character.leftArm.rotation.set(mix(0.08, -0.55 * step, gait), 0, -0.11)
  character.rightArm.rotation.set(mix(-0.08, 0.55 * step, gait), 0, mix(0.11, -1.82, wave))
  character.leftLeg.rotation.set(mix(0, 0.62 * step, gait), 0, -0.03)
  character.rightLeg.rotation.set(mix(0, -0.62 * step, gait), 0, 0.03)

  // A forward-moving hand gesture: 'come, explore with me!'.
  if (invite > 0) {
    character.rightArm.rotation.x = mix(-0.08, -1.16 + 0.17 * Math.sin(walkCycle * Math.PI * 2), invite)
    character.rightArm.rotation.z = mix(0.11, -0.57, invite)
    character.leftArm.rotation.z = -0.20
  }

  // Small motions keep the character alive without an external GLB animation.
  // Head tilt is scroll-driven (no clock): going backwards rewinds it exactly.
  character.head.rotation.x = pose === 'wave' || pose === 'invite' ? -0.10 : pose === 'rideMotor' ? 0.12 : 0.025 * Math.sin(walkCycle * Math.PI * 2)
  character.head.rotation.y = pose === 'idle' || pose === 'wave' || pose === 'invite' ? 0.15 * Math.sin(walkCycle * Math.PI) : 0
  character.head.rotation.z = pose === 'walk' ? -0.035 * step : 0

  if (riding > 0) {
    // Both hands grasp handlebars; knees tuck around the motorbike.
    character.leftArm.rotation.x = mix(character.leftArm.rotation.x, -0.92, riding)
    character.rightArm.rotation.x = mix(character.rightArm.rotation.x, -0.92, riding)
    character.leftArm.rotation.z = mix(-0.11, -0.16, riding)
    character.rightArm.rotation.z = mix(0.11, 0.16, riding)
    character.leftLeg.rotation.x = mix(character.leftLeg.rotation.x, -1.18, riding)
    character.rightLeg.rotation.x = mix(character.rightLeg.rotation.x, -1.18, riding)
  }
}
