/** v0.8 tests: pure policy and code wiring; no browser/GPU necessary. */
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const ts=require('typescript')
const load=(name)=>{
  const code=fs.readFileSync(path.join(__dirname,name),'utf8')
  const transpiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}})
  const mod={exports:{}}
  new Function('require','module','exports',transpiled.outputText)((id)=>{throw new Error(`Unexpected dependency ${id}`)},mod,mod.exports)
  return mod.exports
}
const quality=load('../utils/renderQuality.ts')
const mode=load('../utils/experienceMode.ts')
let count=0
const test=(title,fn)=>{fn();console.log('✔ '+title);count++}
test('Lite is default when WebGL2 is unavailable',()=>assert.equal(mode.defaultExperience(false,false),'lite'))
test('Reduced motion defaults to Lite even with WebGL2',()=>assert.equal(mode.defaultExperience(true,true),'lite'))
test('Supported client defaults to 3D',()=>assert.equal(mode.defaultExperience(true,false),'3d'))
test('Only valid saved experience modes are accepted',()=>{
  assert(mode.isExperienceMode('lite')); assert(mode.isExperienceMode('3d'));assert(!mode.isExperienceMode('auto'))
})
test('Initial quality on phones and 2-core devices is low',()=>{
  assert.equal(quality.pickInitialTier(390,false,8),'low'); assert.equal(quality.pickInitialTier(1440,false,2),'low')
})
test('Initial quality on desktop devices is balanced/high',()=>{
  assert.equal(quality.pickInitialTier(1024,false,8),'balanced');assert.equal(quality.pickInitialTier(1440,false,8),'high')
})
test('Auto quality reacts to sustained low FPS, without oscillating at threshold',()=>{
  assert.equal(quality.adaptTier('high',30),'balanced');assert.equal(quality.adaptTier('balanced',10),'low')
  assert.equal(quality.adaptTier('high',58),'high');assert.equal(quality.adaptTier('balanced',26),'balanced')
})
test('Low quality caps DPR and frame budget',()=>{
  assert.equal(quality.qualityDPR.low,1)
  assert(quality.targetInterval('low')>quality.targetInterval('high'))
})
test('Page visibility and the Lite fallback are wired in source',()=>{
  const world=fs.readFileSync(path.join(__dirname,'../world/createWorld.ts'),'utf8')
  const page=fs.readFileSync(path.join(__dirname,'../pages/index.vue'),'utf8')
  assert(world.includes("document.addEventListener('visibilitychange'"))
  assert(page.includes('LitePortfolio'))
  assert(page.includes('onWorldFatal'))
})
test('Lite has semantic navigation and all six chapters',()=>{
  const lite=fs.readFileSync(path.join(__dirname,'../components/LitePortfolio.vue'),'utf8')
  for(const chapter of ['home','about','experience','skills','projects','contact']) assert(lite.includes(`id="lite-${chapter}"`))
  assert(lite.includes('id="lite-main"'))
})
console.log(`\n${count} v0.8 performance and fallback checks passed.`)
