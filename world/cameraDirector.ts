import * as THREE from 'three'
import { clamp01, mix, smoothstep, type CinematicState } from '~/utils/cinematicJourney'
import { cameraBlendFor } from '~/utils/cameraTimeline'

/** Camera presets match the existing isometric miniature art direction. */
interface Shot { offset: THREE.Vector3; zoom: number; lead: number }
const shots: Record<string, Shot> = {
  establishing: { offset: new THREE.Vector3(22, 27, 31), zoom: 0.85, lead: -0.4 },
  follow: { offset: new THREE.Vector3(15, 21, 25), zoom: 1.08, lead: 1.3 },
  tracking: { offset: new THREE.Vector3(24, 28, 33), zoom: 0.81, lead: 3.0 },
  arrival: { offset: new THREE.Vector3(13, 19, 24), zoom: 1.18, lead: -0.8 },
}

/** Per-chapter variations: about & experience slightly closer, projects wide. */
const chapterZoom = [1.00, 1.07, 1.03, 0.99, 0.93, 1.08]

export function createCameraDirector(camera: THREE.OrthographicCamera, prefersReducedMotion: boolean) {
  const lookAt = new THREE.Vector3()
  const desiredPosition = new THREE.Vector3()
  const desiredTarget = new THREE.Vector3()
  const relative = new THREE.Vector3()
  const follow = new THREE.Vector3()
  let initialized = false

  function update(state: CinematicState, actorPosition: THREE.Vector3, tangent: THREE.Vector3, deltaSeconds: number, cinematic: boolean, viewportWidth = 1200) {
    // In the desktop layout, the panel covers the right side. On mobile, the
    // card is a bottom sheet, so the world should remain centered horizontally.
    const isMobile = viewportWidth <= 760
    const cinematicEnabled = cinematic && !prefersReducedMotion
    const blend = cameraBlendFor(state)
    const previous = shots[cinematicEnabled ? blend.from : 'follow']!
    const next = shots[cinematicEnabled ? blend.to : 'follow']!
    const blendAmount = cinematicEnabled ? blend.alpha : 1
    const transition = cinematicEnabled ? smoothstep(state.phaseProgress) : 0
    const zoomFrom = chapterZoom[Math.min(state.leg, chapterZoom.length - 1)] ?? 1
    const zoomTo = chapterZoom[Math.min(state.leg + 1, chapterZoom.length - 1)] ?? 1
    const localZoom = mix(zoomFrom, zoomTo, smoothstep(state.distance))
    const targetZoom = mix(previous.zoom, next.zoom, blendAmount) * localZoom * (isMobile ? 1.20 : 1)
    relative.copy(previous.offset).lerp(next.offset, blendAmount)
    // Blend look-ahead too, avoiding a snap when vehicle boarding ends.
    const lead = mix(previous.lead, next.lead, blendAmount)
    follow.copy(tangent).multiplyScalar(lead * (state.phase === 'ride' ? 1 : 0.4))
    desiredTarget.copy(actorPosition).add(follow)
    desiredTarget.y = isMobile ? 0.4 : 1.0
    // Desktop framing reserves room for the right-side portfolio card.
    // Mobile framing lets the actor occupy the center of the open viewport.
    desiredTarget.x += isMobile ? 0 : 2.0
    if (isMobile) {
      relative.multiplyScalar(0.83)
      // A small rearward target offset keeps buildings legible in portrait.
      desiredTarget.z += 0.35
    }
    // Mild vertical crane while arriving; no dramatic rotation that hides the city.
    relative.y += state.shot === 'arrival' && cinematicEnabled ? transition * 1.4 : 0
    desiredPosition.copy(desiredTarget).add(relative)

    // Damping uses delta-time, so it behaves similarly on 60Hz and 144Hz monitors.
    const alpha = initialized ? (prefersReducedMotion || !cinematic ? 1 : 1 - Math.exp(-4.8 * clamp01(deltaSeconds))) : 1
    camera.position.lerp(desiredPosition, alpha)
    lookAt.lerp(desiredTarget, alpha)
    camera.zoom = mix(camera.zoom, targetZoom, alpha)
    camera.updateProjectionMatrix()
    camera.lookAt(lookAt)
    initialized = true
  }

  return { update }
}
