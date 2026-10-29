const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')

function loadPlainTypeScript(relative) {
  const src = fs.readFileSync(path.join(root, relative), 'utf8')
  const transpiled = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  })
  const errors = (transpiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error)
  assert.equal(errors.length, 0, `${relative} has TS parsing errors`)
  const out = { exports: {} }
  vm.runInNewContext(transpiled.outputText, { module: out, exports: out.exports, URL, require }, { filename: relative })
  return out.exports
}
const { projects, getProject } = loadPlainTypeScript('data/projects.ts')
const { safeWebUrl, getEmbedUrl } = loadPlainTypeScript('utils/projectLinks.ts')
let count = 0
function test(label, check) { check(); count++; console.log('PASS', label) }

test('Projects have unique safe slugs', () => {
  assert(projects.length >= 3)
  assert.equal(new Set(projects.map(p => p.slug)).size, projects.length)
  for (const p of projects) assert.match(p.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
})
test('Case studies provide a full narrative', () => {
  for (const p of projects) {
    assert(p.context && p.challenge && p.outcome && p.role)
    assert(p.approach.length && p.highlights.length && p.engineering.length && p.learnings.length)
    assert.equal(getProject(p.slug).name, p.name)
  }
})
test('Covers exist and are explicitly marked concept illustrations', () => {
  for (const p of projects) {
    assert(fs.existsSync(path.join(root, 'public', p.cover)))
    assert.match(p.coverLabel, /concept/i)
  }
})
test('Gallery image references exist if configured', () => {
  for (const p of projects) for (const img of p.gallery) {
    assert(img.src.startsWith('/images/projects/'))
    assert(img.alt && img.caption)
    assert(fs.existsSync(path.join(root, 'public', img.src)))
  }
})
test('Unsafe URL schemes are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'file:///etc/passwd', 'https://user:pass@example.com']) assert.equal(safeWebUrl(url), '')
})
test('HTTPS links and localhost dev links are accepted', () => {
  assert.equal(safeWebUrl('https://example.com/'), 'https://example.com/')
  assert.equal(safeWebUrl('http://localhost:3000/'), 'http://localhost:3000/')
  assert.equal(safeWebUrl('http://example.com/'), '')
})
test('Embedding requires an explicit opt-in flag', () => {
  assert.equal(getEmbedUrl({demoUrl:'https://example.com',allowEmbed:false}), '')
  assert.equal(getEmbedUrl({demoUrl:'https://example.com',allowEmbed:true}), 'https://example.com/')
  assert.equal(getEmbedUrl({demoUrl:'javascript:alert(1)',allowEmbed:true}), '')
})
test('All referenced project pages resolve to the same project data', () => {
  for (const p of projects) assert.equal(getProject(p.slug)?.slug,p.slug)
  assert.equal(getProject('this-does-not-exist'), undefined)
})
console.log(`\n${count} content checks passed.`)
