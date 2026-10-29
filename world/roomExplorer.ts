/** First-person movement relative to Three.js camera direction (local -Z). */
export interface ExplorerInput { forward: number; strafe: number; turn: number }
export interface ExplorerPose { x: number; z: number; yaw: number }
export const emptyInput: ExplorerInput = { forward: 0, strafe: 0, turn: 0 }
export const initialPose = (): ExplorerPose => ({ x: 0, z: 1.86, yaw: 0 })
export function clampRoom(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** THREE.PerspectiveCamera with rotation.y=yaw looks along (-sin(yaw), 0, -cos(yaw)).
 * Its right side is (+cos(yaw), 0, -sin(yaw)).
 * Sharing this basis avoids moving opposite to the visible camera view.
 */
export function explorerBasis(yaw: number) {
  return {
    forwardX: -Math.sin(yaw), forwardZ: -Math.cos(yaw),
    rightX: Math.cos(yaw), rightZ: -Math.sin(yaw),
  }
}

export function stepExplorer(pose: ExplorerPose, input: ExplorerInput, dt: number): ExplorerPose {
  const seconds = clampRoom(dt, 0, .065)
  // Turning right means rotating camera to the RIGHT, which is negative yaw in Three.js.
  const yaw = pose.yaw - clampRoom(input.turn, -1, 1) * seconds * 1.65
  const forward = clampRoom(input.forward, -1, 1)
  const strafe = clampRoom(input.strafe, -1, 1)
  const magnitude = Math.max(1, Math.hypot(forward, strafe)) // no diagonal speed bonus
  const distance = 2.2 * seconds / magnitude
  const basis = explorerBasis(yaw)
  const dx = (basis.forwardX * forward + basis.rightX * strafe) * distance
  const dz = (basis.forwardZ * forward + basis.rightZ * strafe) * distance
  return {
    x: clampRoom(pose.x + dx, -2.73, 2.73),
    z: clampRoom(pose.z + dz, -1.92, 2.25),
    yaw,
  }
}
