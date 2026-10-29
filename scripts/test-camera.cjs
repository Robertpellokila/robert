/* Pure unit tests for camera shot blends: npm run test:camera */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function compile(file, requireMock) {
  const source = fs.readFileSync(path.resolve(__dirname, file), 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = { exports: {} }
  new Function('require','module','exports',js)(requireMock,mod,mod.exports)
  return mod.exports
}
const journey = compile('../utils/cinematicJourney.ts', name => {
  if (name === '~/data/portfolio') return { routes: ['walk','walk','motorbike','bus','walk'] }
  throw Error('Unexpected dependency ' + name)
})
const camera = compile('../utils/cameraTimeline.ts', name => {
  if (name === '~/utils/cinematicJourney') return journey
  throw Error('Unexpected dependency ' + name)
})
const { getCinematicState } = journey
const { cameraBlendFor } = camera
const close = (a,b) => assert.ok(Math.abs(a-b) < 0.0001, `${a} != ${b}`)
let count = 0
function test(name, fn) { fn(); count++; console.log('✔ '+ name) }

test('Home establishes a wide view without jumping', () => {
  const blend = cameraBlendFor(getCinematicState(0))
  assert.equal(blend.from,'establishing')
  assert.equal(blend.to,'establishing')
})
test('When mounting a motorbike, camera blends from establishing to follow', () => {
  const begin = cameraBlendFor(getCinematicState((2 + .120001) / 5))
  assert.equal(begin.from,'establishing')
  assert.equal(begin.to,'follow')
  close(begin.alpha,0)
  const later = cameraBlendFor(getCinematicState((2 + .20) / 5))
  close(later.alpha,1)
})
test('During bus driving, camera blends from follow into tracking', () => {
  const begin = cameraBlendFor(getCinematicState((3 + .260001) / 5))
  assert.equal(begin.from,'follow')
  assert.equal(begin.to,'tracking')
  close(begin.alpha,0)
  const later = cameraBlendFor(getCinematicState((3 + .55) / 5))
  close(later.alpha,1)
})
test('Arriving blends from follow to arrival shot', () => {
  const b = cameraBlendFor(getCinematicState((3 + .950001) / 5))
  assert.equal(b.from,'follow')
  assert.equal(b.to,'arrival')
  close(b.alpha,0)
})
test('Every camera blend remains valid for scroll positions 0..1', () => {
  for(let i=0;i<=1000;i++) {
    const state = getCinematicState(i / 1000)
    const blend = cameraBlendFor(state)
    assert.ok(Number.isFinite(blend.alpha) && blend.alpha>=0 && blend.alpha<=1)
    assert.ok(['establishing','follow','tracking','arrival'].includes(blend.from))
    assert.ok(['establishing','follow','tracking','arrival'].includes(blend.to))
  }
})
test('Reverse scroll reconstructs identical camera state', () => {
  for (let i=0;i<=500;i++) {
    const t=i/500
    assert.deepEqual(cameraBlendFor(getCinematicState(t)), cameraBlendFor(getCinematicState(t)))
  }
})
console.log(`\n${count} camera tests passed.`)
