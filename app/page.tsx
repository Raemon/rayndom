import fs from 'fs'
import path from 'path'
import Link from 'next/link'

function getRouteDirectories() {
  const appDir = path.join(process.cwd(), 'app')
  const entries = fs.readdirSync(appDir, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .filter(dir => dir.name !== 'downloads' && dir.name !== 'research')
    .filter(dir => {
      const pagePath = path.join(appDir, dir.name, 'page.tsx')
      return fs.existsSync(pagePath)
    })
    .map(dir => dir.name)
}

function getResearchRouteDirectories() {
  const researchDir = path.join(process.cwd(), 'app', 'research')
  if (!fs.existsSync(researchDir)) return []
  const entries = fs.readdirSync(researchDir, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .filter(dir => {
      const pagePath = path.join(researchDir, dir.name, 'page.tsx')
      return fs.existsSync(pagePath)
    })
    .map(dir => dir.name)
}

export default function Home() {
  const routes = getRouteDirectories()
  const researchRoutes = getResearchRouteDirectories()
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Routes</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {routes.map(route => (
          <li key={route} style={{ marginBottom: '8px' }}>
            <Link href={`/${route}`} style={{ color: '#667eea', textDecoration: 'none' }}>
              /{route}
            </Link>
          </li>
        ))}
      </ul>
      {researchRoutes.length > 0 && (
        <>
          <h2 style={{ marginTop: '24px', marginBottom: '12px' }}>Research</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {researchRoutes.map(route => (
              <li key={route} style={{ marginBottom: '8px' }}>
                <Link href={`/research/${route}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                  /research/{route}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
