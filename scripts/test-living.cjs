/** Run with Node, no browser or Three dependency required. */
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const ts = require('typescript')

function load(file, mocks = {}) {
  const content = fs.readFileSync(path.resolve(__dirname, file), 'utf8')
  const compiled = ts.transpileModule(content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  })
  assert.equal(compiled.diagnostics.filter(x => x.category === ts.DiagnosticCategory.Error).length, 0)
  const module = { exports: {} }
  new Function('require','module','exports',compiled.outputText)((name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    throw new Error('Unexpected dependency ' + name)
  }, module, module.exports)
  return module.exports
}
const math = load('../utils/livingMath.ts')
const quality = load('../utils/renderQuality.ts')
const { skyPresets } = load('../world/livingWorld.ts', { three: {}, '~/utils/livingMath': math, '~/utils/renderQuality': quality })
const close = (a, b, eps = 1e-8) => assert.ok(Math.abs(a-b) < eps, `${a} != ${b}`)
let count = 0
const test = (name, fn) => { fn(); count++; console.log('✔ ' + name) }

test('Settings contain three complete and distinct sky presets', () => {
  assert.deepEqual(Object.keys(skyPresets), ['day','sunset','night'])
  assert.notEqual(skyPresets.day.sky, skyPresets.sunset.sky)
  assert.notEqual(skyPresets.sunset.sky, skyPresets.night.sky)
  for (const preset of Object.values(skyPresets)) {
    for (const key of ['sky','fog','sunColor']) assert.match(preset[key], /^#[0-9a-fA-F]{6}$/)
    for (const key of ['hemisphere','sun','lamp','exposure']) assert.ok(Number.isFinite(preset[key]) && preset[key] >= 0)
  }
})
test('Night lamps become brighter and the sun weaker', () => {
  assert(skyPresets.night.lamp > skyPresets.sunset.lamp)
  assert(skyPresets.sunset.lamp > skyPresets.day.lamp)
  assert(skyPresets.night.sun < skyPresets.sunset.sun)
  assert(skyPresets.sunset.sun < skyPresets.day.sun)
})
test('Clamping invalid / out of-range input is safe', () => {
  assert.equal(math.clampUnit(-3), 0)
  assert.equal(math.clampUnit(4), 1)
  assert.equal(math.clampUnit(Number.NaN), 0)
  close(math.clampUnit(.75), .75)
})
test('Loop progress wraps at both ends, even negative input', () => {
  close(math.wrapUnit(1.3), .3)
  close(math.wrapUnit(-.2), .8)
  close(math.wrapUnit(2), 0)
  close(math.wrapUnit(.5), .5)
})
test('NPC vehicle movement is deterministic at the same elapsed time', () => {
  const a = math.npcProgress(14, .015, .2)
  const b = math.npcProgress(14, .015, .2)
  close(a, b)
})
test('Reverse traffic is mirrored without mutating the main path', () => {
  const forward = math.npcProgress(10, .02, .23)
  const reverse = math.npcProgress(10, .02, .23, true)
  close(forward + reverse, 1)
})
test('NPC time wraps smoothly between 0 and 1', () => {
  for (let t = 0; t < 1500; t += 13) {
    const n = math.npcProgress(t, .012, .55)
    assert(n >= 0 && n < 1)
  }
})
test('Frame-rate independent damping is zero when paused', () => {
  close(math.dampingFactor(0), 0)
  close(math.dampingFactor(-10), 0)
})
test('Damping yields the same total transition over 60 or 30 frames', () => {
  const sixty = Math.pow(1 - math.dampingFactor(1/60), 60)
  const thirty = Math.pow(1 - math.dampingFactor(1/30), 30)
  close(sixty, thirty)
})
console.log(`\n${count} Living World tests passed.`)
