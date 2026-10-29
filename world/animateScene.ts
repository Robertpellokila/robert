import * as THREE from 'three'
import { getCinematicState, mix, type CinematicState } from '~/utils/cinematicJourney'
import { poseCharacter, type CharacterRig } from '~/world/animateCharacter'
import { routes } from '~/data/portfolio'

interface Vehicle { group: THREE.Group; wheels: THREE.Mesh[] }
export interface AnimatedWorld {
  path: THREE.CatmullRomCurve3
  avatar: CharacterRig
  motor: Vehicle
  bus: Vehicle
}

const currentPosition = new THREE.Vector3()
const start = new THREE.Vector3()
const arrival = new THREE.Vector3()
const stand = new THREE.Vector3()
const seat = new THREE.Vector3()
const position = new THREE.Vector3()
const tangent = new THREE.Vector3()
const parkedTangent = new THREE.Vector3()

const placeNearVehicle = (vehicle: Vehicle, x: number, y: number, z: number, out: THREE.Vector3) => {
  vehicle.group.updateMatrixWorld(true)
  return out.set(x, y, z).applyMatrix4(vehicle.group.matrixWorld)
}

function setActor(avatar: CharacterRig, worldPosition: THREE.Vector3, facing: number) {
  avatar.group.position.copy(worldPosition)
  avatar.group.rotation.set(0, facing, 0)
}

/**
 * All movement is derived from scroll progress; no play/pause timers are involved.
 * This is essential for seamless reverse scrolling.
 */
export function animateScene(world: AnimatedWorld, progress: number): {
  state: CinematicState
  actorPosition: THREE.Vector3
  tangent: THREE.Vector3
} {
  const state = getCinematicState(progress)
  const { avatar, motor, bus, path } = world
  const segments = routes.length // six stops = five legs; always follow the data model
  const startT = state.leg / segments
  const endT = (state.leg + 1) / segments
  const positionT = mix(startT, endT, state.distance)
  path.getPointAt(positionT, currentPosition)
  path.getTangentAt(Math.min(.999999, positionT), tangent)
  path.getPointAt(startT, start)
  path.getPointAt(endT, arrival)
  path.getTangentAt(Math.min(.999999, startT), parkedTangent)

  // Local +X on every vehicle points towards the next stop.
  const facingVehicle = -Math.atan2(tangent.z, tangent.x)
  const facingPerson = facingVehicle + Math.PI / 2
  avatar.group.visible = true
  motor.group.visible = state.mode === 'motorbike'
  bus.group.visible = state.mode === 'bus'

  if (state.mode === 'walk') {
    setActor(avatar, currentPosition, facingPerson)
    const walking = state.phase !== 'arrive'
    const amount = walking ? 1 : 1 - state.phaseProgress
    poseCharacter(avatar, progress < .004 || progress > .997 ? 'wave' : walking ? 'walk' : 'idle', progress * segments * 8, amount)
    avatar.group.position.y += (walking ? .035 * Math.abs(Math.sin(progress * segments * 8 * Math.PI * 2)) : 0)
    return { state, actorPosition: avatar.group.position, tangent }
  }

  const isMotor = state.mode === 'motorbike'
  const vehicle = isMotor ? motor : bus
  // The waiting vehicle is parked a short distance in front of the chapter.
  // That distance fades out during the journey so it reaches the exact next stop.
  const lead = 1.25 * (1 - state.distance)
  vehicle.group.position.copy(currentPosition).addScaledVector(tangent, lead)
  vehicle.group.rotation.y = facingVehicle
  const wheelTravel = state.distance * Math.max(.1, arrival.distanceTo(start))
  for (const wheel of vehicle.wheels) wheel.rotation.z = -wheelTravel / 0.44

  // The avatar uses the SAME mesh whether standing, boarding or riding.
  // For the bus, the avatar becomes hidden after boarding its opaque body.
  const doorX = isMotor ? -.35 : 1.05
  const doorZ = isMotor ? .84 : 1.35
  const seatX = isMotor ? -.32 : .82
  const seatZ = isMotor ? 0 : .34
  placeNearVehicle(vehicle, doorX, 0, doorZ, stand)
  placeNearVehicle(vehicle, seatX, isMotor ? .20 : .06, seatZ, seat)

  if (state.phase === 'approach') {
    position.copy(start).lerp(stand, state.phaseProgress)
    setActor(avatar, position, facingPerson)
    poseCharacter(avatar, 'walk', state.leg * 9 + state.phaseProgress * 3.5, 1)
  } else if (state.phase === 'mount') {
    position.copy(stand).lerp(seat, state.phaseProgress)
    setActor(avatar, position, facingPerson)
    poseCharacter(avatar, isMotor ? 'rideMotor' : 'board', state.leg * 9 + state.phaseProgress, state.phaseProgress)
    avatar.group.rotation.z = isMotor ? -0.09 * state.phaseProgress : 0
  } else if (state.phase === 'ride') {
    setActor(avatar, seat, facingPerson)
    poseCharacter(avatar, isMotor ? 'rideMotor' : 'idle', state.leg * 9 + state.distance, 1)
    avatar.group.rotation.z = isMotor ? -0.09 : 0
    avatar.group.visible = isMotor
  } else if (state.phase === 'dismount') {
    position.copy(seat).lerp(stand, state.phaseProgress)
    setActor(avatar, position, facingPerson)
    poseCharacter(avatar, isMotor ? 'rideMotor' : 'exit', state.leg * 9 + state.phaseProgress, 1 - state.phaseProgress)
    avatar.group.rotation.z = isMotor ? -0.09 * (1 - state.phaseProgress) : 0
  } else { // final few percent: walk from door to the center of the new stop
    position.copy(stand).lerp(arrival, state.phaseProgress)
    setActor(avatar, position, facingPerson)
    poseCharacter(avatar, 'walk', state.leg * 9 + state.phaseProgress, 1 - state.phaseProgress)
  }

  // The camera tracks the avatar outside and the vehicle while driving.
  const actorPosition = state.phase === 'ride' ? vehicle.group.position : avatar.group.position
  return { state, actorPosition, tangent }
}
