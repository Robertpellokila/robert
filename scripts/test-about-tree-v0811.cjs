const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const world = fs.readFileSync(path.join(root, 'world/createWorld.ts'), 'utf8')
const interiors = fs.readFileSync(path.join(root, 'world/createInteriors.ts'), 'utf8')
const decor = fs.readFileSync(path.join(root, 'world/roomDecor.ts'), 'utf8')
let count = 0
function test(label, fn) { fn(); count++; console.log('✔', label) }
test('the outdoor tree once inside About is moved outside the room footprint', () => {
  assert.doesNotMatch(world, /\[-20,\s*-8\.1,\s*0\.85,\s*0\]/)
  assert.match(world, /\[-22\.2,\s*-10\.5,\s*0\.85,\s*0\]/)
  const [treeX, treeZ] = [-22.2, -10.5]
  const [aboutX, aboutZ] = [-17.5, -5.8]
  assert.ok(Math.abs(treeX - aboutX) > 3.3)
  assert.ok(Math.abs(treeZ - aboutZ) > 2.8)
})
test('outdoor trees are hidden only when inside and return on exit', () => {
  assert.match(world, /const isInteriorVisible = roomId !== null && entry >= \.55/)
  assert.match(world, /for \(const tree of trees\) tree\.visible = !isInteriorVisible/)
})
test('About portrait remains clickable', () => {
  assert.match(interiors, /picture\.userData = \{roomId:'about',objectId:'portrait'/)
})
test('About room furniture/plant styling remains intact', () => {
  assert.match(decor, /function about\(p:Parent\)/)
  assert.match(decor, /desk\(p,\.65,-1\.05,2\.0\)/)
})
console.log(`${count} v0.8.11 exterior-tree regression checks passed (source-level).`)
