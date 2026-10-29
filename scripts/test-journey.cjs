/*
 * npm run test:journey
 * Uses TypeScript (already in devDependencies) to test our pure storyboard functions.
 * No Nuxt server, browser or WebGL required.
 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const filename = path.resolve(__dirname, '../utils/cinematicJourney.ts')
const source = fs.readFileSync(filename, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const moduleObject = { exports: {} }
const fakeRequire = (name) => {
  if (name === '~/data/portfolio') return { routes: ['walk', 'walk', 'motorbike', 'bus', 'walk'] }
  throw new Error(`Unexpected import: ${name}`)
}
new Function('require', 'module', 'exports', compiled)(fakeRequire, moduleObject, moduleObject.exports)
const { getCinematicState } = moduleObject.exports

const tests = []
const test = (name, callback) => {
  callback()
  tests.push(name)
  console.log('✔', name)
}
const close = (a, b) => assert.ok(Math.abs(a-b) < 0.0001, `${a} !== ${b}`)

test('Clamps scroll progress to [0,1]', () => {
  assert.equal(getCinematicState(-10).leg, 0)
  assert.equal(getCinematicState(100).leg, 4)
  assert.equal(getCinematicState(Number.NaN).leg, 0)
})
test('Starts motorbike and bus immediately at the beginning of each leg', () => {
  assert.equal(getCinematicState(.4).mode, 'motorbike')
  assert.equal(getCinematicState(.4).phase, 'approach')
  assert.equal(getCinematicState(.6).mode, 'bus')
  assert.equal(getCinematicState(.6).phase, 'approach')
})
test('Motorbike progresses through approach -> mount -> ride -> dismount -> arrive', () => {
  const part = p => getCinematicState((2 + p) / 5)
  assert.equal(part(.08).phase,'approach')
  assert.equal(part(.18).phase,'mount')
  assert.equal(part(.55).phase,'ride')
  assert.equal(part(.90).phase,'dismount')
  assert.equal(part(.99).phase,'arrive')
  close(part(.20).distance, 0)
  close(part(.90).distance, 1)
})
test('Bus has board, ride and exit phases', () => {
  const part = p => getCinematicState((3 + p) / 5)
  assert.equal(part(.20).phase, 'mount')
  assert.equal(part(.55).phase, 'ride')
  assert.equal(part(.9).phase, 'dismount')
})
test('All distances remain monotonic while scrolling forward', () => {
  for (let leg=0; leg<5; leg++) {
    let previous=0
    for(let i=0;i<=1000;i++) {
      const value=getCinematicState((leg + Math.min(.99999, i/1000))/5).distance
      assert.ok(value+1e-8>=previous, `backtracking in leg ${leg}, sample ${i}`)
      previous=value
    }
  }
})
test('Reverse scrolling restores exactly the same state per scroll position', () => {
  const samples = Array.from({ length: 501 }, (_, i) => i / 500)
  const forward = samples.map(t => getCinematicState(t))
  const backward = [...samples].reverse().map(t => getCinematicState(t)).reverse()
  assert.deepEqual(forward, backward)
})
test('Distance is continuous at vehicle phase boundaries', () => {
  for (const [leg, boundaries] of [[2,[.12,.24,.82,.94]],[3,[.14,.26,.83,.95]]]) {
    for (const b of boundaries) {
      const before = getCinematicState((leg + b - 1e-7) / 5)
      const after = getCinematicState((leg + b + 1e-7) / 5)
      assert.ok(Math.abs(before.distance - after.distance) < 1e-4, `jump at leg ${leg}, portion ${b}`)
    }
  }
})
console.log(`\n${tests.length} storyboard tests passed.`)
