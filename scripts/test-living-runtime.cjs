/** Lightweight scene mock for testing v0.6 update callbacks. Not a real WebGL renderer. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const load = (relative, dependencies) => {
  const contents = fs.readFileSync(path.join(__dirname, relative), 'utf8')
  const result = ts.transpileModule(contents, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
  const mod = { exports: {} }
  new Function('require','module','exports',result.outputText)((name) => {
    if (Object.hasOwn(dependencies,name)) return dependencies[name]
    throw Error('Unexpected import ' + name)
  },mod,mod.exports)
  return mod.exports
}
class Vector3 {
  constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
  clone(){return new Vector3(this.x,this.y,this.z)}
  copy(v){return this.set(v.x,v.y,v.z)}
  normalize(){const r=Math.hypot(this.x,this.y,this.z)||1;return this.set(this.x/r,this.y/r,this.z/r)}
  addScaledVector(v,a){this.x+=v.x*a;this.y+=v.y*a;this.z+=v.z*a;return this}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}
}
class Color {
  constructor(s='#000000'){this.value=s}
  lerp(other,a){this.value=a>=0?other.value:this.value;return this}
  copy(other){this.value=other.value;return this}
}
class Node {
  constructor(){this.position=new Vector3();this.rotation={x:0,y:0,z:0};this.scale={setScalar(){}};this.children=[];this.visible=true}
  add(...children){this.children.push(...children)}
}
class Mesh extends Node {
  constructor(geometry,material){super();this.geometry=geometry;this.material=material}
}
class Material {constructor(props){Object.assign(this,props)}}
class Fog{constructor(color){this.color=new Color(color)}}
class Geometry{constructor(...args){this.args=args}}
const three = {
  Mesh, Group:Node, Vector3, Color, Fog,
  BoxGeometry:Geometry, CylinderGeometry:Geometry, TorusGeometry:Geometry,
  MeshBasicMaterial:Material, MeshStandardMaterial:Material,
}
const math = load('../utils/livingMath.ts', {})
const quality = load('../utils/renderQuality.ts', {})
const { createLivingWorld } = load('../world/livingWorld.ts', {three,'~/utils/livingMath':math,'~/utils/renderQuality':quality})
const scene = new Node()
scene.fog = new Fog('#eaf1e9')
const buildings = Object.fromEntries(['home','about','experience','skills','projects','contact'].map(id=>[id,new Node()]))
const trees=[new Node(),new Node()]
const clouds=[new Node()]
clouds[0].position.set(-20,10,-10)
const hemisphere={intensity:3}
const sunlight={intensity:3,color:new Color('#fff3df')}
const renderer={toneMappingExposure:1.7,shadowMap:{enabled:true,needsUpdate:false},setPixelRatio(n){this.pixelRatio=n}}
global.window={devicePixelRatio:2}
const path3={getPointAt(t){return new Vector3(-29 + 58*t,.26,2)},getTangentAt(){return new Vector3(1,0,0)}}
const world=createLivingWorld({scene,path:path3,trees,clouds,buildings,hemisphere,sunlight,renderer})
const hero=new Vector3(-29,.26,2)
const day={timeOfDay:'day',motionEnabled:false,ecoMode:false}
const night={timeOfDay:'night',motionEnabled:true,ecoMode:true}
world.update(1/60, day, hero)
const parkedCars = scene.children.filter(n => n instanceof Node && n.children.length >= 8)
assert.equal(parkedCars.length,2,'Two NPC vehicles should be created')
assert(parkedCars.every(c => Math.abs(c.position.x) > .1), 'Cars are positioned even when motion is off')
const originalX=parkedCars[0].position.x
for(let i=0;i<200;i++)world.update(1/60,night,hero)
assert(sunlight.intensity<1,'Night should dim sunlight')
assert(hemisphere.intensity<1,'Night should dim ambient light')
assert.equal(renderer.shadowMap.enabled,false,'Eco should disable shadows')
assert.equal(renderer.pixelRatio,1,'Eco should reduce device pixel ratio')
assert.notEqual(parkedCars[0].position.x,originalX,'Traffic should move when motion enabled')
assert(Math.abs(trees[0].rotation.z)>0,'Trees should sway')
assert.notEqual(clouds[0].position.x,-20,'Clouds should drift')
const brightLights=scene.children.filter(n=>n instanceof Mesh && n.material.emissiveIntensity>0)
assert(brightLights.length>=7,'Streetlights should glow')
const rings=scene.children.filter(n=>n instanceof Mesh && n.material.transparent===true)
assert.equal(rings.length,6,'There should be six interactive arrival rings')
assert(rings.some(r=>r.visible),'Arrival rings should activate near a stop')
const parkedX=parkedCars[0].position.x
world.update(1/60,{timeOfDay:'sunset',motionEnabled:false,ecoMode:false},hero)
assert.equal(renderer.shadowMap.enabled,true,'Normal mode should re-enable shadows')
assert.equal(parkedCars[0].position.x,parkedX,'Traffic should freeze when motion disabled')
console.log('✔ Living World mock smoke test: day/night, lamps, tree/cloud, traffic, arrivals, Eco (not real WebGL)')
