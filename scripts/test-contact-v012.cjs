const fs = require('node:fs')
const assert = require('node:assert/strict')
const ts = require('typescript')
const read = (path) => fs.readFileSync(path, 'utf8')
const barista = read('world/createWavingBarista.ts')
const decor = read('world/roomDecor.ts')
const world = read('world/createWorld.ts')
const form = read('components/ContactForm.vue')
const room = read('components/RoomObjectDetails.vue')
const lite = read('components/LitePortfolio.vue')
const tests = [
  ['Barista placed behind the cafe counter', () => {
    assert.match(decor, /createWavingBarista\(p,\s*-\.73,\s*-2\.15\)/)
    assert.match(barista, /root\.name = 'contact-barista'/)
  }],
  ['Barista has an articulated shoulder and waving arm', () => {
    assert.match(barista, /const waveArm = new THREE\.Group\(\)/)
    assert.match(barista, /contact-barista-wave-arm/)
  }],
  ['Barista is selectable as existing email exhibit', () => {
    assert.match(barista, /interactiveObjectId = 'email'/)
  }],
  ['Animation runs inside existing render loop and honors motion toggle', () => {
    assert.match(world, /getObjectByName\('contact-barista-wave-arm'\)/)
    assert.match(world, /baristaWaveArm\.rotation\.z = motion \?/)
  }],
  ['Contact form includes validated inputs with accessible labels', () => {
    assert.match(form, /type="email"/)
    assert.match(form, /required minlength="10"/)
    assert.match(form, /<form.*@submit\.prevent=/)
  }],
  ['mailto composes a draft rather than promising server delivery', () => {
    assert.match(form, /mailto:\$\{owner\.email\}/)
    assert.match(form, /encodeURIComponent\(body\)/)
    assert.match(form, /belum mengirim otomatis/)
  }],
  ['Same ContactForm reused in 3D and Lite mode', () => {
    assert.match(room, /<ContactForm\s*\/>/)
    assert.match(lite, /<ContactForm\s*\/>/)
  }],
  ['New TS barista module parses', () => {
    const file = ts.createSourceFile('createWavingBarista.ts', barista, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    assert.equal(file.parseDiagnostics.length, 0)
  }],
]
let count = 0
for (const [label, cb] of tests) { cb(); console.log('✔', label); count++ }
console.log(`${count} contact v0.8.12 source checks passed (not a browser render test).`)
