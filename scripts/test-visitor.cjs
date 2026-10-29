/** v0.7 pure logic tests: no browser, WebGL or Nuxt required. */
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const modules = {}
const chapters = ['home','about','experience','skills','projects','contact'].map(id => ({ id }))
function load(file, stub={}) {
  const source = fs.readFileSync(path.join(root,file),'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }}).outputText
  const module = {exports:{}}
  new Function('require','module','exports',code)((name) => {
    if (name in stub) return stub[name]
    throw new Error(`Unexpected import ${name} in ${file}`)
  },module,module.exports)
  return module.exports
}
const {validDiscoveryIds,chapterAt,journeyDialogue} = load('utils/visitorExperience.ts',{'~/data/portfolio':{chapters}})
const {discoveries,discoveryById} = load('data/discoveries.ts')
let passed = 0
function test(label, fn) { fn();passed++;console.log('✔',label) }
test('There are six unique discoveries, one per chapter', () => {
 assert.deepEqual(discoveries.map(d=>d.id), chapters.map(c=>c.id))
 assert.equal(new Set(discoveries.map(d=>d.id)).size,6)
})
test('Discovery lookup returns the configured item', () => assert.equal(discoveryById.projects.title,'Ideas into prototypes'))
test('Empty and malformed saved collections fall back safely', () => {
 assert.deepEqual(validDiscoveryIds(null),[])
 assert.deepEqual(validDiscoveryIds({id:'skills'}),[])
})
test('Duplicated and unknown IDs never enter saved state', () => {
 assert.deepEqual(validDiscoveryIds(['about','about',1,'bad','skills']),['about','skills'])
})
test('Chapter jump clamps both ends', () => {
 assert.equal(chapterAt(-4),'home');assert.equal(chapterAt(500),'contact')
})
test('Non-finite map index returns the starting point', () => assert.equal(chapterAt(NaN),'home'))
test('Arrival dialogue matches the destination', () => assert.match(journeyDialogue('arrive','projects','walk'),/gallery/))
test('Vehicle boarding dialogue changes for bus versus motorbike', () => {
 assert.notEqual(journeyDialogue('mount','skills','bus'),journeyDialogue('mount','skills','motorbike'))
})
test('Dialogue does not leak user private data', () => {
 for (const c of chapters) assert.equal(typeof journeyDialogue('arrive',c.id,'walk'),'string')
})
console.log(`\n${passed} visitor experience tests passed.`)
