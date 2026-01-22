import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import styles from './CatEolResearchPage.module.css'

type CsvRow = Record<string, string>

const parseCsv = (csv: string) => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] as CsvRow[] }
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',')
    const row: CsvRow = {}
    headers.forEach((headerName) => row[headerName] = '')
    headers.forEach((headerName, idx) => row[headerName] = (cols[idx] ?? '').trim())
    return row
  })
  return { headers, rows }
}

const slugify = (providerName: string) => {
  return providerName.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const stripParenSuffix = (s: string) => {
  return s.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

const resolveProviderReport = (providerName: string) => {
  const providersDir = path.join(process.cwd(), 'cat-eol-research', 'providers')
  const providerNameNoParen = stripParenSuffix(providerName)
  const candidateSlugs = [
    slugify(providerName),
    slugify(providerNameNoParen),
    slugify(providerNameNoParen.replace(/\s*&\s*euthanasia\s*$/i, '').trim()),
    slugify(providerNameNoParen.replace(/\s*&\s*in-home euthanasia\s*$/i, '').trim()),
  ].filter((s) => s.length > 0)

  for (const candidateSlug of candidateSlugs) {
    const candidatePath = path.join(providersDir, `${candidateSlug}.md`)
    if (fs.existsSync(candidatePath)) return candidatePath
  }

  if (!fs.existsSync(providersDir)) return ''
  const providerMdFiles = fs.readdirSync(providersDir).filter((f) => f.endsWith('.md'))
  for (const providerMdFile of providerMdFiles) {
    const candidatePath = path.join(providersDir, providerMdFile)
    const contents = fs.readFileSync(candidatePath, 'utf8')
    const firstLine = contents.split(/\r?\n/, 1)[0] || ''
    const title = firstLine.startsWith('# ') ? firstLine.slice(2).trim() : ''
    if (!title) continue
    if (title === providerName) return candidatePath
    if (title === providerNameNoParen) return candidatePath
    if (stripParenSuffix(title) === providerNameNoParen) return candidatePath
  }

  return ''
}

const CatEolResearchPage = ({searchParams}:{searchParams?:{provider?: string}}) => {
  const csvPath = path.join(process.cwd(), 'cat-eol-research', 'providers.csv')
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const { headers, rows } = parseCsv(csvText)

  const selectedProvider = searchParams?.provider || ''
  const hasSelection = !!selectedProvider
  const mdPath = hasSelection ? resolveProviderReport(selectedProvider) : ''
  const markdown = hasSelection ? (mdPath && fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : `# ${selectedProvider}\n\nNo report found for this provider under \`cat-eol-research/providers/\`.\n`) : ''
  const html = hasSelection ? marked.parse(markdown) : ''

  const tableHeaders = headers.filter((h) => ['provider', 'source_pages', 'link', 'price_euthanasia', 'price_private_cremation', 'expected_wait_time', 'how_to_schedule'].includes(h))

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <div className={styles.title}>Cat EOL Research</div>
        <div className={styles.subtitle}>`cat-eol-research/providers.csv` + `cat-eol-research/providers/*.md`</div>
      </div>
      {hasSelection ? (
      <div className={styles.split}>
        <div className={`${styles.card} ${styles.leftPane}`}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {tableHeaders.map((h) => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const providerName = row.provider || ''
                  const isActive = providerName === selectedProvider
                  const href = `/cat-eol-research?provider=${encodeURIComponent(providerName)}`
                  return (
                    <tr key={providerName || idx} className={idx % 2 === 1 ? styles.rowAlt : undefined}>
                      {tableHeaders.map((h) => {
                        if (h === 'provider') {
                          return (
                            <td key={h} className={styles.td}>
                              <a className={`${styles.providerLink} ${isActive ? styles.providerLinkActive : ''}`} href={href}>{providerName}</a>
                            </td>
                          )
                        }
                        if (h === 'link') {
                          return (
                            <td key={h} className={styles.td}>
                              <a href={href} className={styles.providerLink}>{row[h] || ''}</a>
                            </td>
                          )
                        }
                        if (h === 'source_pages') {
                          return (
                            <td key={h} className={styles.td}>
                              <a href={row[h] || ''} target="_blank" rel="noreferrer" className={styles.providerLink}>{row[h] || ''}</a>
                            </td>
                          )
                        }
                        return (
                          <td key={h} className={styles.td}>{row[h] || ''}</td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={`${styles.card} ${styles.rightPane}`}>
          <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {tableHeaders.map((h) => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const providerName = row.provider || ''
                  const href = `/cat-eol-research?provider=${encodeURIComponent(providerName)}`
                  return (
                    <tr key={providerName || idx} className={idx % 2 === 1 ? styles.rowAlt : undefined}>
                      {tableHeaders.map((h) => {
                        if (h === 'provider') {
                          return (
                            <td key={h} className={styles.td}>
                              <a className={styles.providerLink} href={href}>{providerName}</a>
                            </td>
                          )
                        }
                        if (h === 'link') {
                          return (
                            <td key={h} className={styles.td}>
                              <a href={href} className={styles.providerLink}>{row[h] || ''}</a>
                            </td>
                          )
                        }
                        if (h === 'source_pages') {
                          return (
                            <td key={h} className={styles.td}>
                              <a href={row[h] || ''} target="_blank" rel="noreferrer" className={styles.providerLink}>{row[h] || ''}</a>
                            </td>
                          )
                        }
                        return (
                          <td key={h} className={styles.td}>{row[h] || ''}</td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatEolResearchPage
