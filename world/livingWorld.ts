import * as THREE from 'three'
import type { ChapterId } from '~/data/portfolio'
import { npcProgress, dampingFactor } from '~/utils/livingMath'
import { qualityDPR, type RenderQualityTier } from '~/utils/renderQuality'

export type TimeOfDay = 'day' | 'sunset' | 'night'
export type WorldSettings = { timeOfDay: TimeOfDay; motionEnabled: boolean; ecoMode: boolean; quality?: RenderQualityTier }

export const skyPresets: Record<TimeOfDay, {
  sky: string; fog: string; hemisphere: number; sun: number; lamp: number; exposure: number; sunColor: string
}> = {
  day: { sky: '#eaf1e9', fog: '#eaf1e9', hemisphere: 3, sun: 3, lamp: 0, exposure: 1.7, sunColor: '#fff3df' },
  sunset: { sky: '#e9c8b3', fog: '#e9d0b9', hemisphere: 1.65, sun: 1.7, lamp: 1.0, exposure: 1.56, sunColor: '#ffb584' },
  night: { sky: '#162739', fog: '#27394a', hemisphere: 0.58, sun: 0.42, lamp: 2.9, exposure: 1.36, sunColor: '#b0c3eb' },
}

function basicMaterial(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true })
}
function shape(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
  const item = new THREE.Mesh(geometry, material)
  item.position.set(x, y, z)
  item.castShadow = false // Small decorative objects should not increase shadow cost.
  parent.add(item)
  return item
}

function makeNpcCar(scene: THREE.Scene, color: string) {
  const group = new THREE.Group()
  const paint = basicMaterial(color)
  const wheelMaterial = basicMaterial('#293d42')
  const windowMaterial = basicMaterial('#93b8bf')
  shape(group, new THREE.BoxGeometry(2.0, .55, .98), paint, 0, .64, 0)
  shape(group, new THREE.BoxGeometry(1.08, .56, .84), paint, -.16, 1.12, 0)
  shape(group, new THREE.BoxGeometry(.72, .34, .044), windowMaterial, -.2, 1.14, .45)
  shape(group, new THREE.BoxGeometry(.72, .34, .044), windowMaterial, -.2, 1.14, -.45)
  for (const x of [-.62, .62]) {
    for (const z of [-.5, .5]) {
      const wheel = shape(group, new THREE.CylinderGeometry(.26, .26, .13, 8), wheelMaterial, x, .33, z)
      wheel.rotation.x = Math.PI / 2
    }
  }
  // Front and rear headlamps, shared with the city lamp animation.
  const headlights: THREE.MeshStandardMaterial[] = []
  for (const z of [-.31, .31]) {
    const mat = new THREE.MeshStandardMaterial({ color: '#ffe6ae', emissive: '#ffcb73', emissiveIntensity: 0 })
    shape(group, new THREE.BoxGeometry(.065, .15, .18), mat, 1.04, .69, z)
    headlights.push(mat)
  }
  scene.add(group)
  return { group, headlights }
}

/** Decorative windows are kept separate from ordinary glass materials. */
function makeWindow(parent: THREE.Object3D, x: number, y: number, z: number, width = .75) {
  const mat = new THREE.MeshStandardMaterial({
    color: '#b8dce0', emissive: '#ffca72', emissiveIntensity: 0, roughness: .65,
  })
  shape(parent, new THREE.BoxGeometry(width, .74, .06), mat, x, y, z)
  return mat
}

/** These lights glow visually, without expensive per-object real-time shadows. */
function makeStreetLamp(scene: THREE.Scene, x: number, z: number) {
  const pole = basicMaterial('#58645c')
  const cap = basicMaterial('#495c54')
  shape(scene, new THREE.CylinderGeometry(.055, .08, 2.45, 6), pole, x, 1.28, z)
  shape(scene, new THREE.BoxGeometry(.62, .13, .5), cap, x, 2.53, z)
  const globe = new THREE.MeshStandardMaterial({
    color: '#ffeed0', emissive: '#ffbd66', emissiveIntensity: 0, roughness: .3,
  })
  shape(scene, new THREE.BoxGeometry(.49, .30, .38), globe, x, 2.33, z)
  return globe
}

/**
 * The environment update is clock-driven. It never modifies the hero's journey
 * progress: scroll can still run backwards, and doors still work as in v0.5.
 */
export function createLivingWorld(args: {
  scene: THREE.Scene
  path: THREE.CatmullRomCurve3
  trees: THREE.Group[]
  clouds: THREE.Group[]
  buildings: Record<ChapterId, THREE.Group>
  hemisphere: THREE.HemisphereLight
  sunlight: THREE.DirectionalLight
  renderer: THREE.WebGLRenderer
}) {
  const { scene, path, trees, clouds, buildings, hemisphere, sunlight, renderer } = args
  const lamps: THREE.MeshStandardMaterial[] = []
  for (const x of [-32, -24, -12, -1, 11, 23, 32]) {
    lamps.push(makeStreetLamp(scene, x, 5.8))
  }
  lamps.push(makeWindow(buildings.home, -1.5, 1.75, 2.25, 1.03))
  lamps.push(makeWindow(buildings.about, -1.0, 1.72, 2.18, 1.15))
  lamps.push(makeWindow(buildings.experience, 1.4, 1.87, 2.18, .85))
  lamps.push(makeWindow(buildings.skills, -2.65, 2.75, 1.84, 1.04))
  lamps.push(makeWindow(buildings.projects, 2.02, 1.55, 2.34, 1.12))
  lamps.push(makeWindow(buildings.contact, -1.55, 1.5, 1.91, 1.08))

  // Add another object here when you want a third car (not a new animation system).
  const traffic = [
    { model: makeNpcCar(scene, '#a9b9d0'), speed: .017, offset: .08, reverse: false, lane: -1.02 },
    { model: makeNpcCar(scene, '#dca894'), speed: .012, offset: .55, reverse: true, lane: 1.02 },
  ]
  for (const vehicle of traffic) lamps.push(...vehicle.model.headlights)
  const skyColor = new THREE.Color(skyPresets.day.sky)
  const fogColor = new THREE.Color(skyPresets.day.fog)
  const sunColor = new THREE.Color(skyPresets.day.sunColor)
  // Allocate colors once: no temporary Color instances on every animation frame.
  const colors = Object.fromEntries((Object.keys(skyPresets) as TimeOfDay[]).map(key => [key, {
    sky: new THREE.Color(skyPresets[key].sky), fog: new THREE.Color(skyPresets[key].fog), sun: new THREE.Color(skyPresets[key].sunColor),
  }])) as Record<TimeOfDay, { sky: THREE.Color; fog: THREE.Color; sun: THREE.Color }>
  const normal = new THREE.Vector3()
  // Arrival circles shimmer when the main character reaches a building.
  const welcomeRings = Array.from({ length: 6 }, (_, i) => {
    const location = path.getPointAt(i / 5)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#ffda9e', transparent: true, opacity: 0, depthWrite: false })
    const ring = shape(scene, new THREE.TorusGeometry(1.24, .054, 5, 30), ringMaterial,
      location.x, .29, location.z)
    ring.rotation.x = -Math.PI / 2
    ring.visible = false
    return { ring, material: ringMaterial, location }
  })
  const baseTreeRotations = trees.map(t => t.rotation.z)
  const cloudPositions = clouds.map(c => c.position.clone())
  let elapsed = 0
  let currentQuality: RenderQualityTier | null = null

  const setQuality = (quality: RenderQualityTier) => {
    if (quality === currentQuality) return
    currentQuality = quality
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, qualityDPR[quality]))
    renderer.shadowMap.enabled = quality === 'high'
    renderer.shadowMap.needsUpdate = true
  }

  function update(deltaSeconds: number, settings: WorldSettings, actorPosition: THREE.Vector3) {
    const frameDelta = Math.max(0, Math.min(.05, deltaSeconds))
    const target = skyPresets[settings.timeOfDay] ?? skyPresets.day
    const alpha = dampingFactor(frameDelta, 2.2)
    const colorsForTime = colors[settings.timeOfDay] ?? colors.day
    skyColor.lerp(colorsForTime.sky, alpha)
    fogColor.lerp(colorsForTime.fog, alpha)
    sunColor.lerp(colorsForTime.sun, alpha)
    scene.background = skyColor
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(fogColor)
    hemisphere.intensity += (target.hemisphere - hemisphere.intensity) * alpha
    sunlight.intensity += (target.sun - sunlight.intensity) * alpha
    sunlight.color.copy(sunColor)
    renderer.toneMappingExposure += (target.exposure - renderer.toneMappingExposure) * alpha
    for (const mat of lamps) {
      mat.emissiveIntensity += (target.lamp - mat.emissiveIntensity) * alpha
    }
    setQuality(settings.quality ?? (settings.ecoMode ? 'low' : 'high'))

    // The Vue control defaults to OFF for reduced-motion users, and can be explicitly overridden.
    const canAnimate = settings.motionEnabled
    welcomeRings.forEach(({ ring, material, location }, i) => {
      const distance = actorPosition.distanceTo(location)
      const intensity = Math.max(0, 1 - distance / 4)
      ring.visible = intensity > .04
      material.opacity = intensity * (canAnimate ? .46 + .13 * Math.sin(elapsed * 3 + i) : .55)
      ring.scale.setScalar(1 + (canAnimate ? .06 * Math.sin(elapsed * 2 + i) : 0))
    })
    if (canAnimate) elapsed += frameDelta
    // Place traffic even when motion is disabled: no cars piled up at origin.
    traffic.forEach(({ model, speed, offset, reverse, lane }) => {
      const t = npcProgress(elapsed, speed, offset, reverse)
      const point = path.getPointAt(t)
      const tangent = path.getTangentAt(t)
      normal.set(-tangent.z, 0, tangent.x).normalize()
      model.group.position.copy(point).addScaledVector(normal, lane)
      model.group.position.y = .28
      model.group.rotation.y = -Math.atan2(tangent.z, tangent.x) + (reverse ? Math.PI : 0)
    })
    if (!canAnimate) return
    trees.forEach((tree, i) => {
      tree.rotation.z = baseTreeRotations[i]! + Math.sin(elapsed * .72 + i * .91) * .018
    })
    clouds.forEach((cloud, i) => {
      const base = cloudPositions[i]!
      cloud.position.set(base.x + Math.sin(elapsed * .13 + i * 1.8) * 2.4,
        base.y + Math.sin(elapsed * .20 + i) * .13, base.z)
    })
  }
  return { update }
}
