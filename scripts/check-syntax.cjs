/** Fast syntax-only check, NOT a Vue compile, typecheck or WebGL integration test. */
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const folders = ['components', 'composables', 'data', 'pages', 'server', 'utils', 'world']
let count = 0
const walk = (folder) => {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name)
    if (entry.isDirectory()) { walk(full); continue }
    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.vue')) continue
    let source = fs.readFileSync(full, 'utf8')
    if (entry.name.endsWith('.vue')) {
      const match = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)
      if (!match) continue
      source = match[1]
    }
    const result = ts.transpileModule(source, {
      fileName: full.replace(/\.vue$/, '.ts'),
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      reportDiagnostics: true,
    })
    const errors = result.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error)
    if (errors.length) {
      console.error(path.relative(root, full), errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')))
      process.exitCode = 1
    }
    count++
  }
}
for (const name of folders) if (fs.existsSync(path.join(root,name))) walk(path.join(root,name))
if (!process.exitCode) console.log(`${count} TypeScript / Vue-script files passed syntax parsing (not full build).`)
