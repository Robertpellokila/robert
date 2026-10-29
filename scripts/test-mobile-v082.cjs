const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8')
let count = 0
function test(name, fn) { fn(); count++; console.log('✔',name) }
const page = read('pages/index.vue')
const avatar = read('world/createChibiAvatar.ts')
const stylesheet = read('assets/css/main.css')
const drawer = read('components/MobileToolsDrawer.vue')
test('chibi avatar uses an oversized head pivot with configurable scale', () => {
  assert.match(avatar,/head\.scale\.setScalar\(avatarStyle\.headScale\)/)
  assert.match(read('data/portfolio.ts'),/headScale:\s*1\.35/)
})
test('head pivot remains in CharacterRig for scroll animation', () => {
  assert.match(avatar,/return \{ group:root, head, leftArm, rightArm, leftLeg, rightLeg \}/)
  assert.match(read('world/animateCharacter.ts'),/character\.head\.rotation/)
})
test('face is 3D geometry with eyes and mouth', () => {
  assert.match(avatar,/SphereGeometry/)
  assert.match(avatar,/TubeGeometry/)
  assert.match(avatar,/const iris/)
})
test('curtain hairstyle has center part and separate side strands', () => {
  assert.match(avatar,/center-parted curtain hairstyle/)
  assert.match(avatar,/curtain/)
  assert.match(avatar,/hairSweep/)
})
test('project replaces old avatar geometry, not existing journey logic', () => {
  assert.match(read('world/createWorld.ts'),/createChibiAvatar\(\)/)
  assert.match(read('world/animateScene.ts'),/poseCharacter/)
})
test('mobile has a single tools drawer', () => {
  assert.match(page,/<MobileToolsDrawer/)
  assert.match(page,/:aria-expanded="mobileToolsOpen"/)
  assert.match(page,/mobileToolsOpen = ref\(false\)/)
})
test('drawer provides functional location navigation', () => {
  assert.match(drawer,/@click="emit\('navigate',index\)"/)
  assert.match(page,/@navigate="jumpFromMap"/)
})
test('drawer connects time, graphics, sound and movement', () => {
  for (const event of ['setTime','setQuality','toggleMotion','toggleSound','toggleCamera']) {
    assert.match(drawer, new RegExp('emit\\(\\\'' + event + '\\\''))
  }
})
test('old map/world/graphics overlays hidden only on mobile', () => {
  assert.match(stylesheet, /\.portfolio-v082-root \.visitor-map-wrap/)
  assert.match(stylesheet, /\.portfolio-v082-root \.world-controls/)
  assert.match(stylesheet, /\.portfolio-v082-root \.experience-switch \.experience-quality \{display:none;\}/)
  assert.match(stylesheet, /@media \(max-width:760px\)/)
})
test('drawer is an accessible modal with Escape and focus wrap', () => {
  assert.match(drawer, /aria-modal="true"/)
  assert.match(drawer,/e\.key === 'Escape'/)
  assert.match(drawer,/e\.key !== 'Tab'/)
})
test('mobile world camera uses more readable framing', () => {
  assert.match(read('world/cameraDirector.ts'),/isMobile \? 1\.20 : 1/)
  assert.match(read('world/cameraDirector.ts'),/relative\.multiplyScalar\(0\.83\)/)
})
test('desktop and Lite portfolio remain', () => {
  assert.match(page, /<LitePortfolio v-if="experienceMode === 'lite'"/)
  assert.match(page, /<WorldScene/)
  assert.match(stylesheet, /\.portfolio-v081-root \.topbar/)
})
console.log(`${count} v0.8.2 source-level checks passed; NOT a browser render test.`)
