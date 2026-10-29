const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const read = path => fs.readFileSync(path, 'utf8')
const world = read('world/createWorld.ts')
const pose = read('world/animateCharacter.ts')
const page = read('pages/index.vue')
const scene = read('components/WorldScene.vue')
const contact = read('components/ContactForm.vue')
const owner = read('data/portfolio.ts')
const source = read('utils/whatsapp.ts')
const script = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const moduleContext = { exports: {} }
vm.runInNewContext(script, moduleContext)
const { normalizeWhatsAppNumber, createWhatsAppLink } = moduleContext.exports
const tests = [
  ['International-format WhatsApp digits', () => {
    assert.equal(normalizeWhatsAppNumber('+62 812-3456-7890'), '6281234567890')
    assert.equal(normalizeWhatsAppNumber('0812 3456 7890'), '6281234567890')
    assert.equal(normalizeWhatsAppNumber('62-812-3456-7890'), '6281234567890')
  }],
  ['Reject missing/invalid WhatsApp numbers', () => {
    assert.equal(normalizeWhatsAppNumber(''), null)
    assert.equal(normalizeWhatsAppNumber('123'), null)
    assert.equal(createWhatsAppLink('', 'test'), null)
  }],
  ['WhatsApp URL message is URL encoded and not auto-sent', () => {
    assert.equal(createWhatsAppLink('081234567890', 'Halo! Apa kabar?'), 'https://wa.me/6281234567890?text=Halo!%20Apa%20kabar%3F')
  }],
  ['Owner config and shared ContactForm link', () => {
    assert.match(owner, /whatsapp:\s*''/)
    assert.match(contact, /createWhatsAppLink\(owner\.whatsapp, text\)/)
    assert.match(contact, /window\.open\(link, '_blank'/)
    assert.match(contact, /Chat via WhatsApp/)
  }],
  ['Greeting is activated on explicit choice of 3D', () => {
    assert.match(page, /if \(value === '3d'\) greetingSignal\.value\+\+/)
    assert.match(page, /:greeting-signal="greetingSignal"/)
    assert.match(scene, /props\.greetingSignal/)
    assert.match(world, /getGreetingSignal\?\./)
  }],
  ['Both invite and wave poses available', () => {
    assert.match(pose, /\| 'invite'/)
    assert.match(pose, /pose === 'invite'/)
    assert.match(world, /poseCharacter\(avatar, 'invite'/)
    assert.match(world, /poseCharacter\(avatar, 'wave'/)
  }],
  ['Greeting stops once scrolling begins or a room is entered', () => {
    assert.match(world, /t < \.025 && !getInteriorState/)
    assert.match(world, /greetingElapsed < \(reducedMotion/)
  }],
  ['Speech bubble and reduced motion preference', () => {
    assert.match(scene, /Yuk, ikut aku!/)
    assert.match(scene, /prefers-reduced-motion/)
    assert.match(world, /reducedMotion \? 400 : 3000/)
  }],
]
let passed = 0
for (const [name, test] of tests) {
  test(); console.log('✔', name); passed++
}
console.log(`${passed} invitation v0.8.13 checks passed.`)
