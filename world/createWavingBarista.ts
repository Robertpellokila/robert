import * as THREE from 'three'

/**
 * Simple chibi café attendant. Local +Z is the direction toward the visitor.
 * Procedural meshes keep the avatar light and editable without Blender.
 * The arm is animated in createWorld.ts, not via setInterval.
 */
export function createWavingBarista(parent: THREE.Object3D, x = -0.7, z = -2.14) {
  const root = new THREE.Group()
  root.name = 'contact-barista'
  root.position.set(x, 0, z)
  parent.add(root)

  const mat = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true })
  const hoodie = mat('#6e8e76')
  const apron = mat('#e7d4ad')
  const skin = mat('#d8a17e')
  const hair = mat('#25282a')
  const eyes = mat('#28352d')

  function box(parentObj: THREE.Object3D, w: number, h: number, d: number, material: THREE.Material,
    px: number, py: number, pz: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.set(px, py, pz)
    mesh.castShadow = true
    parentObj.add(mesh)
    return mesh
  }
  function ball(parentObj: THREE.Object3D, radius: number, material: THREE.Material,
    px: number, py: number, pz: number) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), material)
    mesh.position.set(px, py, pz)
    mesh.castShadow = true
    parentObj.add(mesh)
    return mesh
  }

  // Body sits behind the counter (counter top is around Y=1.10).
  const torso = box(root, 0.62, 0.75, 0.37, hoodie, 0, 1.06, 0)
  // Existing room picking in createInteriors.ts maps this to the email exhibit.
  torso.userData.interactiveObjectId = 'email'
  box(root, 0.44, 0.60, 0.04, apron, 0, 1.05, 0.21)

  ball(root, 0.29, skin, 0, 1.76, 0)
  ball(root, 0.30, hair, 0, 1.95, -0.08)
  // Fringe and face details are toward +Z.
  box(root, 0.22, 0.095, 0.12, hair, -0.11, 1.97, 0.19)
  box(root, 0.17, 0.095, 0.12, hair, 0.12, 1.99, 0.17)
  ball(root, 0.029, eyes, -0.10, 1.78, 0.272)
  ball(root, 0.029, eyes, 0.10, 1.78, 0.272)
  box(root, 0.095, 0.014, 0.02, mat('#a76660'), 0, 1.65, 0.284)

  // One resting arm; the other uses a shoulder pivot for a waving animation.
  box(root, 0.18, 0.50, 0.22, hoodie, -0.40, 1.17, 0.04)
  ball(root, 0.10, skin, -0.40, 0.90, 0.08)

  const waveArm = new THREE.Group()
  waveArm.name = 'contact-barista-wave-arm'
  waveArm.position.set(0.38, 1.42, 0.02) // Shoulder joint
  root.add(waveArm)
  box(waveArm, 0.18, 0.42, 0.22, hoodie, 0, -0.20, 0)
  ball(waveArm, 0.11, skin, 0, -0.46, 0.05)
  waveArm.rotation.z = 2.58

  // Nameplate in front, useful for debugging/learning where the barista is.
  return { root, waveArm }
}
