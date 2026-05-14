import { execFileSync } from 'node:child_process'

const scripts = ['fetchHackerNews.ts', 'fetchLWNews.ts', 'fetchArxiv.ts']

for (const script of scripts) {
  console.log(`\n=== Running ${script} ===\n`)
  execFileSync('npx', ['tsx', `scripts/${script}`], { stdio: 'inherit' })
}
