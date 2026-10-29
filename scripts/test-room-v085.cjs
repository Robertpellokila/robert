const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root=path.resolve(__dirname,'..')
const read=x=>fs.readFileSync(path.join(root,x),'utf8')
const decor=read('world/roomDecor.ts')
const scene=read('world/createInteriors.ts')
const objects=read('data/roomObjects.ts')
const world=read('world/createWorld.ts')
let count=0
function test(name, fn){fn();count++;console.log('✔',name)}
for(const chapter of ['home','about','experience','skills','projects','contact']){
  test(`${chapter} gets its own interior builder`,()=>{
    assert.match(decor,new RegExp(`function ${chapter}\\(p:Parent\\)`))
    assert.match(decor,new RegExp(`case '${chapter}':${chapter}\\(group\\)`))
  })
}
test('all-room decorating code parses in TypeScript',()=>{
  const src=ts.createSourceFile('roomDecor.ts',decor,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS)
  assert.equal(src.parseDiagnostics.length,0)
})
test('room shell uses the established first-person bounds',()=>{
  assert.match(scene,/block\(group, 6\.6, \.24, 5\.6, floor/)
  assert.match(read('world/roomExplorer.ts'),/x: clampRoom\(pose\.x \+ dx, -2\.73, 2\.73\)/)
})
test('previous click targets and physical project/CV posters remain',()=>{
  assert.match(scene,/roomObjectsFor\(id\)/)
  assert.match(scene,/printedCard\(group, hotspots, id, 'resume'/)
  assert.match(scene,/project\.slug,project\.label/)
  assert.match(objects,/chapter:'contact'/)
})
test('six room layouts have distinct reference-inspired details',()=>{
  for(const keyword of ['woodFloor','curtains','seatedCreator','rack','PROJECT EXHIBITION','cafeMachine']) assert.ok(decor.includes(keyword))
})
test('indoor exposure is managed independently of outdoor view',()=>{
  assert.match(world,/targetExposure = roomId && entry >= \.55 \? 1\.04 : 1\.7/)
})
console.log(`${count} v0.8.5 interior source checks passed. These do not replace a WebGL browser render test.`)
