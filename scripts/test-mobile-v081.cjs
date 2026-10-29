const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const tests = [
  ['mobile card has a proper toggle', () => assert.match(read('pages/index.vue'), /class="mobile-sheet-toggle"/)],
  ['mobile card has expansion state', () => assert.match(read('pages/index.vue'), /mobileSheetExpanded = ref\(false\)/)],
  ['mobile details have accessible controls', () => assert.match(read('pages/index.vue'), /aria-controls="mobile-section-content"/)],
  ['mobile navigation can collapse', () => assert.match(read('pages/index.vue'), /class="mobile-menu-toggle"/)],
  ['scene uses CSS responsive overlay', () => assert.match(read('assets/css/main.css'), /MOBILE CINEMATIC LAYOUT/)],
  ['collapsed content does not cover 3D', () => assert.match(read('assets/css/main.css'), /\.panel-anchor \.chapter-card \{ display:none; \}/)],
  ['expanded content is scrollable', () => assert.match(read('assets/css/main.css'), /max-height:min\(47dvh,440px\)/)],
  ['mobile camera disables desktop offset', () => assert.match(read('world/cameraDirector.ts'), /desiredTarget.x \+= isMobile \? 0 : 2\.0/)],
  ['camera reads viewport width', () => assert.match(read('world/createWorld.ts'), /getCinematicMode\?\.\(\) \?\? true, host\.clientWidth/)],
  ['avatar has center-parted hair', () => assert.match(read('world/createWorld.ts'), /middle-part \/ curtain hairstyle/)],
  ['user-provided portrait is included as an asset', () => assert.ok(fs.statSync(path.join(root,'public/images/avatar-reference.webp')).size > 10000)],
  ['mobile mode is preserved without removing Lite experience', () => assert.match(read('pages/index.vue'), /<LitePortfolio v-if="experienceMode === 'lite'"/)],
];
for (const [name,fn] of tests) { try {fn(); console.log('✔',name)} catch(e) {console.error('✘',name,e.message);process.exitCode=1} }
if (!process.exitCode) console.log(`${tests.length} mobile/avatar integration checks passed (source-level, not browser rendering).`)
