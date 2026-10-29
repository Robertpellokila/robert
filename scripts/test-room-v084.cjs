const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const vm = require('node:vm')
const root=path.resolve(__dirname,'..')
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const code=ts.transpileModule(read('world/roomExplorer.ts'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
const moduleExports={};vm.runInNewContext(code,{exports:moduleExports})
const {explorerBasis, stepExplorer,initialPose}=moduleExports
let count=0
function test(label, fn){fn();count++;console.log('✔',label)}
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8, `${actual} !== ${expected}`)
for (const yaw of [-Math.PI,-Math.PI/2,-.73,0,.61,Math.PI/2,Math.PI]) {
  test(`W forward matches camera forward at yaw ${yaw.toFixed(2)}`,()=>{
    const p={x:0,z:0,yaw};const next=stepExplorer(p,{forward:1,strafe:0,turn:0},.02)
    const basis=explorerBasis(yaw)
    near(next.x-p.x,basis.forwardX*.044)
    near(next.z-p.z,basis.forwardZ*.044)
  })
  test(`D strafe matches camera right at yaw ${yaw.toFixed(2)}`,()=>{
    const p={x:0,z:0,yaw};const next=stepExplorer(p,{forward:0,strafe:1,turn:0},.02)
    const basis=explorerBasis(yaw)
    near(next.x-p.x,basis.rightX*.044)
    near(next.z-p.z,basis.rightZ*.044)
  })
}
test('turn right rotates camera toward +X',()=>{
  const p=initialPose();const next=stepExplorer(p,{forward:0,strafe:0,turn:1},.02)
  assert(next.yaw<0);assert(explorerBasis(next.yaw).forwardX>0)
})
test('turn left rotates camera toward -X',()=>{
  const p=initialPose();const next=stepExplorer(p,{forward:0,strafe:0,turn:-1},.02)
  assert(next.yaw>0);assert(explorerBasis(next.yaw).forwardX<0)
})
test('mouse dragging right also turns camera right',()=>{
  assert.match(read('world/createWorld.ts'),/indoorPose\.yaw -= dx \* \.004/)
})
test('full CV preview component renders actual data, not an invented file',()=>{
  const s=read('components/RoomObjectDetails.vue')
  assert.match(s,/<ResumeInlinePreview v-else/)
  assert.match(s,/:src="localCvPdf"/)
  assert.match(read('components/ResumeInlinePreview.vue'),/experiences/)
})
test('physical CV poster and project cards exist in indoor scene',()=>{
  assert.match(read('world/createInteriors.ts'),/printedCard\(group, hotspots, id, 'resume'/)
  assert.match(read('world/createInteriors.ts'),/project\.slug,project\.label/)
})
test('mobile readable panel and keyboard dismissal remain available',()=>{
  assert.match(read('assets/css/main.css'),/room-object-panel-v084/)
  assert.match(read('components/RoomObjectDetails.vue'),/@keydown\.esc/)
})
console.log(`${count} v0.8.4 movement and readable exhibits tests passed.`)
