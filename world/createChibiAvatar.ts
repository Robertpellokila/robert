import * as THREE from 'three'
import { avatarStyle } from '~/data/portfolio'
import type { CharacterRig } from '~/world/animateCharacter'

/**
 * v0.8.2 – Stylized chibi avatar (procedural 3D; no Blender asset needed).
 * The supplied portrait is a likeness REFERENCE, not a face scan. The recognizable
 * features are dark center-parted curtain hair, brows, eyes and a softer face.
 * All facial pieces live beneath a single head pivot for scroll-driven animation.
 */
export function createChibiAvatar(): CharacterRig {
  const root = new THREE.Group()
  root.name = 'Robert / stylized chibi'
  root.scale.setScalar(1.48) // Keep the same vehicle/scene scale as v0.8.1.

  const smooth = (hex: string) => new THREE.MeshStandardMaterial({
    color: hex, roughness: 0.92, metalness: 0, flatShading: false,
  })
  const matte = (hex: string) => new THREE.MeshStandardMaterial({
    color: hex, roughness: 0.96, metalness: 0, flatShading: true,
  })
  const skin = smooth(avatarStyle.skin)
  const hair = smooth(avatarStyle.hair)
  const hairShine = smooth(avatarStyle.hairAccent)
  const hoodie = matte(avatarStyle.hoodie)
  const hoodShadow = matte(avatarStyle.hoodShadow)
  const trim = matte(avatarStyle.trim)
  const pants = matte(avatarStyle.trousers)
  const shoes = matte(avatarStyle.shoes)
  const brow = matte(avatarStyle.eyebrows)

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    parent.add(m)
    return m
  }
  const ellipsoid = (p: THREE.Object3D, material: THREE.Material, x:number,y:number,z:number, sx:number,sy:number,sz:number, segments=18) => {
    const mesh = add(p, new THREE.SphereGeometry(1, segments, 12), material,x,y,z)
    mesh.scale.set(sx,sy,sz)
    return mesh
  }
  const cuboid = (p: THREE.Object3D, material:THREE.Material, x:number,y:number,z:number, w:number,h:number,d:number) => add(p,new THREE.BoxGeometry(w,h,d),material,x,y,z)

  // Shorter, cozy sweater silhouette; legs remain distinct and animatable.
  ellipsoid(root, hoodie,0,1.085,0, .41,.46,.34,14)
  cuboid(root,trim,0,.70,0,.73,.13,.55)
  cuboid(root,hoodShadow,0,.985,.331,.43,.23,.035) // kangaroo pocket
  for (const x of [-.095,.095]) cuboid(root,matte('#ddd9ba'),x,1.37,.31,.027,.22,.023)
  ellipsoid(root,hoodShadow,0,1.52,-.055,.35,.20,.29,14) // rear collar

  // Face pivot: new headScale grows the head without breaking walking/boarding pivots.
  const head = new THREE.Group()
  head.name = 'Oversized head / pivot'
  head.position.set(0,1.82,0)
  head.scale.setScalar(avatarStyle.headScale)
  root.add(head)

  // Hoodie hood behind skull; skin-colored face with gentle, not blocky, shading.
  ellipsoid(head,hoodShadow,0,.015,-.15,.455,.465,.35)
  ellipsoid(head,skin,0,0,.105,.415,.452,.397)
  ellipsoid(head,skin,-.402,-.053,.135,.085,.115,.09,14)
  ellipsoid(head,skin, .402,-.053,.135,.085,.115,.09,14)
  // Short chin/lower cheek, inspired by the narrow face in the supplied portrait.
  ellipsoid(head,skin,0,-.25,.195,.315,.17,.275)

  // Hair: center-parted curtain hairstyle, black, dense volume, forehead V-opening.
  ellipsoid(head,hair,0,.344,-.018,.455,.238,.385,24) // scalp cap
  ellipsoid(head,hair,-.295,.22,-.115,.24,.30,.29,20) // temple left
  ellipsoid(head,hair, .295,.22,-.115,.24,.30,.29,20) // temple right
  for (const side of [-1,1]) {
    const crown = ellipsoid(head,hair,side*.205,.325,.205,.264,.205,.24,20)
    crown.rotation.z = -side * avatarStyle.hairSweep
    const curtain = ellipsoid(head,hair,side*.318,.125,.366,.145,.245,.150,20)
    curtain.rotation.z = -side * .32
    const fringe = ellipsoid(head,hairShine,side*.182,.308,.357,.149,.105,.090,16)
    fringe.rotation.z = -side * .18
    ellipsoid(head,hair,side*.421,.007,.032,.09,.26,.19,16) // sideburn
  }
  // Deliberately preserve a narrow forehead gap between the two curtains.
  ellipsoid(head,skin,0,.245,.465,.07,.115,.042)

  // Eyes are readable when the character becomes tiny on a phone screen.
  const white = smooth('#f7f5ed')
  const iris = smooth(avatarStyle.irises)
  const pupil = smooth('#11151a')
  const glint = smooth('#ffffff')
  for (const side of [-1,1]) {
    ellipsoid(head,white,side*.172,-.065,.471,.102,.064,.039)
    ellipsoid(head,iris,side*.169,-.067,.507,.055,.058,.026)
    ellipsoid(head,pupil,side*.169,-.069,.528,.032,.038,.016)
    ellipsoid(head,glint,side*.150,-.048,.538,.014,.017,.012,10)
    const eyebrow = cuboid(head,brow,side*.171,.088,.478,.205,.037,.042)
    eyebrow.rotation.z = -side*avatarStyle.eyebrowTilt
  }
  ellipsoid(head,smooth('#b67f68'),0,-.19,.508,.048,.066,.035,14) // petite nose
  // Soft expressive mouth: tiny two-segment curve is less cartoonish than a line.
  const mouth = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.09,-.306,.461),
    new THREE.Vector3(0,-.323,.487),
    new THREE.Vector3(.09,-.306,.461),
  ])
  add(head,new THREE.TubeGeometry(mouth,12,.009,5,false),smooth(avatarStyle.lips),0,0,0)

  function arm(side:number) {
    const pivot = new THREE.Group()
    pivot.position.set(side*.425,1.38,0)
    root.add(pivot)
    const sleeve = ellipsoid(pivot,hoodie,side*.017,-.255,0,.19,.34,.205,14)
    sleeve.rotation.z = side*.12
    ellipsoid(pivot,trim,side*.06,-.56,0,.152,.09,.16,12)
    ellipsoid(pivot,skin,side*.065,-.685,.013,.125,.13,.12,14)
    return pivot
  }
  function leg(side:number) {
    const pivot = new THREE.Group()
    pivot.position.set(side*.19,.72,0)
    root.add(pivot)
    ellipsoid(pivot,pants,0,-.27,0,.185,.325,.22,14)
    ellipsoid(pivot,shoes,0,-.595,.092,.205,.15,.315,14)
    cuboid(pivot,matte('#dddfd5'),0,-.695,.1,.395,.045,.55)
    return pivot
  }
  const leftArm = arm(-1)
  const rightArm = arm(1)
  const leftLeg = leg(-1)
  const rightLeg = leg(1)
  return { group:root, head, leftArm, rightArm, leftLeg, rightLeg }
}
