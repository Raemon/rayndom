import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../..')
const nextStandaloneDir = path.join(projectRoot, '.next', 'standalone')
const nextStaticDir = path.join(projectRoot, '.next', 'static')
const publicDir = path.join(projectRoot, 'public')

const outRoot = path.join(projectRoot, 'electron-resources')
const outNextRoot = path.join(outRoot, 'next')

const ensureDir = (p: string) => fs.mkdirSync(p, { recursive: true })

const copyDir = (from: string, to: string) => {
  ensureDir(path.dirname(to))
  fs.cpSync(from, to, { recursive: true })
}

if (!fs.existsSync(nextStandaloneDir)) throw new Error(`Missing ${nextStandaloneDir}. Run \`npm run build\` first.`)

fs.rmSync(outNextRoot, { recursive: true, force: true })
ensureDir(outNextRoot)

for (const entry of fs.readdirSync(nextStandaloneDir)) {
  if (entry === 'electron-resources') continue
  copyDir(path.join(nextStandaloneDir, entry), path.join(outNextRoot, entry))
}

copyDir(nextStaticDir, path.join(outNextRoot, '.next', 'static'))

if (fs.existsSync(publicDir)) copyDir(publicDir, path.join(outNextRoot, 'public'))

for (const entry of fs.readdirSync(outNextRoot)) {
  if (!entry.startsWith('.env')) continue
  fs.rmSync(path.join(outNextRoot, entry), { force: true })
}

console.log(`Prepared Next resources at ${outNextRoot}`)
