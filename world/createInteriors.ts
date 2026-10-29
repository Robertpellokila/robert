import * as THREE from 'three'
import type { ChapterId } from '~/data/portfolio'
import { roomObjectsFor } from '~/data/roomObjects'
import { owner } from '~/data/portfolio'
import { decorateRoom } from './roomDecor'

export interface InteriorSet {
  rooms: Record<ChapterId, THREE.Group>
  centers: Record<ChapterId, THREE.Vector3>
  doors: Record<ChapterId, THREE.Vector3>
  doorPivots: Record<ChapterId, THREE.Group>
  gates: Record<ChapterId, THREE.Group>
  /** Click targets for interactive exhibits */
  hotspots: THREE.Mesh[]
}

/** Diorama ringan yang dibangun hanya dari geometry Three.js, tanpa Blender. */
const locations: Record<ChapterId, [number, number]> = {
  home: [-29, -5.6], about: [-17.5, -5.8], experience: [-6, -6],
  skills: [5.5, -6.2], projects: [17.5, -6], contact: [29, -5.3],
}
// Material baru per mesh agar aman ketika berpindah halaman dan renderer dibuang.
// v0.6 akan memakai cache per-scene untuk mengoptimalkan alokasi GPU.
function mat(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: .84 })
}
function block(parent: THREE.Group, w: number, h: number, d: number, color: string, x: number, y: number, z: number) {
  const obj = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color))
  obj.position.set(x, y, z)
  obj.castShadow = true
  obj.receiveShadow = true
  parent.add(obj)
  return obj
}
function ball(parent: THREE.Group, radius: number, color: string, x: number, y: number, z: number) {
  const obj = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), mat(color))
  obj.position.set(x, y, z)
  obj.castShadow = true
  parent.add(obj)
  return obj
}
/** A legible physical exhibit, not just a hovering diamond.
 * The same objectId is used by the Vue details panel and the 3D raycaster.
 */
function printedCard(group: THREE.Group, hotspots: THREE.Mesh[], chapter: ChapterId, objectId: string,
  heading: string, subtitle: string, x: number, y: number, z: number, width = 1.5, height = 1.8) {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 640
  const context = canvas.getContext('2d')
  if (!context) return
  context.fillStyle = '#fffdf6'; context.fillRect(0,0,512,640)
  context.fillStyle = '#47765a'; context.fillRect(0,0,512,28)
  context.fillStyle = '#284532'; context.font = 'bold 38px sans-serif'
  const words = heading.split(' ')
  let line = '', yy = 130
  for (const word of words) {
    const next = (line+' '+word).trim()
    if (context.measureText(next).width > 425 && line) { context.fillText(line,38,yy); yy+=48; line=word }
    else line=next
  }
  context.fillText(line,38,yy)
  context.fillStyle='#6d8672'; context.font='24px sans-serif'
  let secondary = '', subY = Math.max(yy+82,300)
  for (const word of subtitle.split(' ')) {
    const next=(secondary+' '+word).trim()
    if (context.measureText(next).width>425 && secondary) {context.fillText(secondary,38,subY);subY+=33;secondary=word}
    else secondary=next
  }
  if(secondary)context.fillText(secondary,38,subY)
  context.fillStyle='#c9d8c5'; context.fillRect(38,560,436,3)
  context.fillStyle='#53795c'; context.font='bold 20px sans-serif'; context.fillText('CLICK TO EXPLORE',38,603)
  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  const frame=block(group,width+.13,height+.13,.10,'#9fbb9f',x,y,z-.045)
  frame.castShadow=false
  const page=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}))
  page.position.set(x,y,z+.028)
  page.userData={roomId:chapter,objectId,label:heading}
  group.add(page)
  hotspots.push(page)
}


/** Billboard interaction label anchored to the exhibit; no visible floating spheres. */
function clickBubble(group: THREE.Group, hotspots: THREE.Mesh[], chapter: ChapterId, objectId: string,
  label: string, x: number, y: number, z: number, width = 1.14, height = .43) {
  const canvas = document.createElement('canvas')
  canvas.width = 768; canvas.height = 288
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0,0,768,288)
  // Soft shadow + rounded cream pill with a little chat tail.
  ctx.shadowColor = 'rgba(22,58,37,.24)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8
  ctx.fillStyle = '#FFFCF4'; ctx.strokeStyle = '#A9C3AB'; ctx.lineWidth = 5
  ctx.beginPath();ctx.roundRect(24,22,720,202,58);ctx.fill();ctx.stroke()
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0
  ctx.fillStyle='#FFFCF4';ctx.beginPath();ctx.moveTo(312,218);ctx.lineTo(358,270);ctx.lineTo(400,218);ctx.fill()
  ctx.fillStyle='#DFECE0';ctx.beginPath();ctx.arc(108,120,53,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#3D7051';ctx.textBaseline='middle';ctx.textAlign='center';ctx.font='bold 62px system-ui,sans-serif';ctx.fillText('↗',108,118)
  ctx.textAlign='left';ctx.fillStyle='#2C503A';ctx.font='bold 59px system-ui,sans-serif';ctx.fillText('Click me',190,94)
  ctx.fillStyle='#708A74';ctx.font='32px system-ui,sans-serif';ctx.fillText(label.length>26 ? label.slice(0,24)+'…' : label,190,157)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const bubble = new THREE.Mesh(new THREE.PlaneGeometry(width,height), new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}))
  bubble.position.set(x,y,z)
  bubble.renderOrder=3
  bubble.userData={roomId:chapter,objectId,label,isInteractionBubble:true,baseY:y}
  group.add(bubble)
  hotspots.push(bubble)
  // An invisible plane widens the clickable area, without showing sphere markers.
  const hit = new THREE.Mesh(new THREE.PlaneGeometry(width*1.16,height*1.25),new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}))
  hit.position.set(x,y,z+.003)
  hit.userData={roomId:chapter,objectId,label,isInteractionBubble:true,baseY:y}
  group.add(hit)
  hotspots.push(hit)
}

export function createInteriors(scene: THREE.Scene): InteriorSet {
  const hotspots: THREE.Mesh[] = []
  const rooms = {} as Record<ChapterId, THREE.Group>
  const centers = {} as Record<ChapterId, THREE.Vector3>
  const doors = {} as Record<ChapterId, THREE.Vector3>
  const doorPivots = {} as Record<ChapterId, THREE.Group>
  const gates = {} as Record<ChapterId, THREE.Group>
  for (const id of Object.keys(locations) as ChapterId[]) {
    const [x,z] = locations[id]!
    const group = new THREE.Group()
    group.position.set(x, .18, z)
    // Cutaway dollhouse: lantai, dinding belakang, dua dinding samping, tanpa atap.
    // Each room keeps the same first-person navigation bounds from v0.8.4.
    const colorTheme = {
      home: ['#D9B18C','#F5EBD7','#EFE5D6'],
      about: ['#E2C9A5','#FBF5E8','#F6F0E7'],
      experience: ['#D1B596','#F8EFE1','#EDE6D8'],
      skills: ['#343D3F','#E4EBE8','#DFE6E1'],
      projects: ['#E7DDC9','#F9F6F0','#F5F1EA'],
      contact: ['#C99367','#F7DDBB','#F4D6AC'],
    } as const
    const [floor, back, side] = colorTheme[id]
    block(group, 6.6, .24, 5.6, floor, 0, -.1, 0)
    block(group, 6.6, 3.15, .15, back, 0, 1.48, -2.72)
    block(group, .12, 3.15, 5.6, side, -3.25, 1.48, 0)
    block(group, .12, 3.15, 5.6, side, 3.25, 1.48, 0)
    // Six explicit room builders replace the old generic cubes.
    decorateRoom(group, id)
    // Furniture may be clicked directly, not only its helper bubble.
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || typeof child.userData.interactiveObjectId !== 'string') return
      child.userData.roomId = id
      child.userData.objectId = child.userData.interactiveObjectId
      child.userData.label = child.userData.interactiveObjectId
      hotspots.push(child)
    })
    const warmRoom = id === 'home' || id === 'contact'
    const ambient = new THREE.PointLight(warmRoom ? '#FFC783' : '#FFF3E4', warmRoom ? 14 : 8, 8.5, 2)
    ambient.position.set(0, 2.7, .35)
    ambient.castShadow = false
    group.add(ambient)
    // Friendly chat-bubble hints replace the old floating spheres.
    for (const obj of roomObjectsFor(id)) {
      // Resume & projects have physical poster exhibits below, not overlay bubbles.
      if (obj.kind === 'resume' || obj.kind === 'project' || obj.kind === 'portrait') continue
      const [px, py, pz] = obj.position
      clickBubble(group, hotspots, id, obj.id, obj.label, px, py + .33, pz + .12)
    }
    if (id === 'about') {
      // An actual framed portrait on the wall. The local image can be replaced
      // with a real photo; this is not a generated reconstruction of the face.
      const frame = block(group, 1.18, 1.48, .12, '#9b7658', -1.92, 1.83, -2.5)
      frame.castShadow = false
      const picture = block(group, 1.02, 1.30, .025, '#f4ede1', -1.92, 1.83, -2.4)
      picture.castShadow = false
      picture.userData = {roomId:'about',objectId:'portrait',label:'My portrait'}
      picture.name = 'Portrait exhibit'
      hotspots.push(picture)
      const loader = new THREE.TextureLoader()
      loader.load('/images/avatar-reference.webp', texture => {
        texture.colorSpace = THREE.SRGBColorSpace
        const old = picture.material as THREE.Material
        picture.material = new THREE.MeshBasicMaterial({map:texture})
        old.dispose()
      }, undefined, () => { /* keep neutral placeholder */ })
    }
    if (id === 'experience') {
      // CV poster on the room wall; the panel opens a full readable HTML/PDF preview.
      printedCard(group, hotspots, id, 'resume', 'MY CV', `${owner.name} · Experience & skills`, 1.75, 1.72, -2.39, 1.38, 1.74)
    }
    if (id === 'projects') {
      // A real physical exhibit label at each project pedestal.
      const covers = [
        {slug:'meetspace',label:'MeetSpace',x:-2.2},
        {slug:'timedoor-battle-cards',label:'Battle Cards',x:0},
        {slug:'profitlens',label:'ProfitLens',x:2.2},
      ]
      for (const project of covers) {
        printedCard(group,hotspots,id,project.slug,project.label,'Explore case study',project.x,1.75,-1.50,1.44,1.12)
      }
    }
    group.visible = false
    scene.add(group)
    rooms[id] = group
    centers[id] = new THREE.Vector3(x, 1.0, z)
    doors[id] = new THREE.Vector3(x, .26, z+2.6)
    // Door at the front of each building. It rotates on its LEFT hinge.
    const gate = new THREE.Group()
    gate.position.set(x, .18, z+2.64)
    block(gate, .18, 2.1, .22, '#dfc49e', -.64, 1.05, 0)
    block(gate, .18, 2.1, .22, '#dfc49e', .64, 1.05, 0)
    block(gate, 1.42, .18, .24, '#dfc49e', 0, 2.16, 0)
    const hinge = new THREE.Group()
    hinge.position.set(-.53, 0, .03)
    block(hinge, 1.04, 1.95, .10, '#ac8d6f', .51, 1.04, 0)
    ball(hinge, .075, '#ead6aa', .88, 1.05, .13)
    gate.add(hinge)
    scene.add(gate)
    doorPivots[id] = hinge
    gates[id] = gate
  }
  return { rooms, centers, doors, doorPivots, gates, hotspots }
}
