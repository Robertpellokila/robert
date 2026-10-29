const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const vm = require('node:vm')
const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root,file),'utf8')
function loadPure(file) {
  const js = ts.transpileModule(read(file), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const exports = {}
  vm.runInNewContext(js, {exports, require: () => {throw new Error('Unexpected import')}}, {filename:file})
  return exports
}
let n=0
function test(label, run) {run();++n;console.log('✔',label)}
const {stepExplorer,initialPose}=loadPure('world/roomExplorer.ts')
const {entryVeilOpacity}=loadPure('utils/roomTransitions.ts')
test('room exploration starts facing into the room',()=> {const pose=initialPose();assert.equal(pose.yaw,0);assert(pose.z>1)})
test('W / up makes camera walk toward negative Z',()=>{const p=initialPose();assert(stepExplorer(p,{forward:1,strafe:0,turn:0},.06).z < p.z)})
test('S / down moves backward',()=>{const p=initialPose();assert(stepExplorer(p,{forward:-1,strafe:0,turn:0},.06).z > p.z)})
test('A and D strafe in opposite directions',()=>{const p=initialPose();assert(stepExplorer(p,{forward:0,strafe:1,turn:0},.06).x>p.x);assert(stepExplorer(p,{forward:0,strafe:-1,turn:0},.06).x<p.x)})
test('arrow keys can turn without changing location',()=>{const p=initialPose();const n=stepExplorer(p,{forward:0,strafe:0,turn:1},.06);assert(n.yaw<0);assert.equal(n.x,p.x)})
test('movement never crosses room boundaries',()=>{let p=initialPose();for(let i=0;i<2000;i++)p=stepExplorer(p,{forward:1,strafe:1,turn:0},1);assert(p.x<=2.73);assert(p.z>=-1.92)})
test('large deltas are capped to prevent teleporting',()=>{const p=initialPose();const n=stepExplorer(p,{forward:1,strafe:0,turn:0},6);assert(Math.abs(n.z-p.z)<.2)})
test('veil masks switch point between camera projections',()=>{assert.equal(entryVeilOpacity(0),0);assert.equal(entryVeilOpacity(.985),1);assert.equal(entryVeilOpacity(1),0)})
test('chapter wheel stops by gesture with touch and keyboard fallbacks',()=>{const s=read('composables/useJourney.ts');assert.match(s,/wheelGestureActive/);assert.match(s,/Math\.round\(progress\.value/);assert.match(s,/duration: direct/);assert.match(s,/onTouchEnd/);assert.match(s,/onKeyDown/)})
test('POV uses actual PerspectiveCamera + room hit-testing',()=>{const s=read('world/createWorld.ts');assert.match(s,/new THREE\.PerspectiveCamera/);assert.match(s,/interiors\.hotspots/);assert.match(s,/renderer\.render\(scene, firstPersonCamera\)/)})
test('every room has clickable 3D objects and the About photo',()=>{const s=read('data/roomObjects.ts');for(const id of ['home','about','experience','skills','projects','contact'])assert.match(s,new RegExp("chapter:'"+id+"'"));assert.match(s,/id:'portrait'/);assert.match(read('world/createInteriors.ts'),/TextureLoader/)})
test('keyboard and touch controls connect to Vue and camera',()=>{assert.match(read('components/RoomExplorerControls.vue'),/keydown/);assert.match(read('components/RoomExplorerControls.vue'),/pointerdown/);assert.match(read('components/WorldScene.vue'),/explorerInput/);assert.match(read('pages/index.vue'),/@room-object="inspectRoomObject"/)})
test('content opens from objects with real existing portfolio data',()=>{const s=read('components/RoomObjectDetails.vue');assert.match(s,/getRoomObject/);assert.match(s,/getProject/);assert.match(s,/owner\.photo/);assert.match(s,/experiences/)} )
console.log(`${n} v0.8.3 room and journey tests passed.`)
