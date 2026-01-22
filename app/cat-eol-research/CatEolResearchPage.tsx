import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import styles from './CatEolResearchPage.module.css'
import ProviderCardView from './ProviderCardView'
import CloseButton from './CloseButton'

type Provider = {
  name: string
  sourceUrl: string
  servesBerkeley: 'yes' | 'no' | 'unknown'
  inHomeEuthanasia: 'yes' | 'no' | 'unknown'
  privateCremation: 'yes' | 'no' | 'unknown'
  priceEuthanasia: string
  priceSedation: string
  priceTravel: string
  priceAfterHours: string
  pricePrivateCremation: string
  priceCommunalCremation: string
  priceBodyTransport: string
  incidentals: string
  waitTime: string
  howToSchedule: string
}

const parseTriState = (val: string): 'yes' | 'no' | 'unknown' => {
  const v = val.toLowerCase().trim()
  if (v === 'yes') return 'yes'
  if (v === 'no') return 'no'
  return 'unknown'
}

const parseCsvToProviders = (csv: string): Provider[] => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length <= 1) return []
  const dataLines = lines.slice(1)
  return dataLines.map((line) => {
    const cols = line.split(',')
    return {
      name: cols[0]?.trim() || '',
      sourceUrl: cols[1]?.trim() || '',
      servesBerkeley: parseTriState(cols[3] || ''),
      inHomeEuthanasia: parseTriState(cols[4] || ''),
      privateCremation: parseTriState(cols[5] || ''),
      priceEuthanasia: cols[6]?.trim() || '',
      priceSedation: cols[7]?.trim() || '',
      priceTravel: cols[8]?.trim() || '',
      priceAfterHours: cols[9]?.trim() || '',
      pricePrivateCremation: cols[10]?.trim() || '',
      priceCommunalCremation: cols[11]?.trim() || '',
      priceBodyTransport: cols[12]?.trim() || '',
      incidentals: cols[13]?.trim() || '',
      waitTime: cols[14]?.trim() || '',
      howToSchedule: cols[15]?.trim() || '',
    }
  })
}

const slugify = (providerName: string) => {
  return providerName.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
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

const TriStateIcon = ({value}: {value: 'yes' | 'no' | 'unknown'}) => {
  if (value === 'yes') return <span className={styles.yes}>✓</span>
  if (value === 'no') return <span className={styles.no}>✗</span>
  return <span className={styles.unknown}>?</span>
}

const PriceCell = ({value}: {value: string}) => {
  if (!value || value === 'unknown' || value === 'not published') {
    return <span className={styles.noData}>—</span>
  }
  const display = value
    .replace(/not published/gi, '—')
    .replace(/unknown/gi, '?')
    .replace(/included \(not itemized\)/gi, 'incl.')
    .replace(/not itemized/gi, '—')
  const textSources = display.split(';').map(s => s.trim()).filter(s => s.length > 0)
  if (textSources.length > 1) {
    return (
      <span className={styles.price}>
        {textSources.map((source, idx) => (
          <span key={idx} style={{display: 'block'}}>{source}</span>
        ))}
      </span>
    )
  }
  return <span className={styles.price}>{display}</span>
}

const ContactCell = ({value}: {value: string}) => {
  if (!value || value === 'unknown' || value === 'not published') {
    return <span className={styles.noData}>—</span>
  }
  const textSources = value.split(';').map(s => s.trim()).filter(s => s.length > 0)
  if (textSources.length > 1) {
    return (
      <span className={styles.contact}>
        {textSources.map((source, idx) => (
          <span key={idx} style={{display: 'block'}}>{source}</span>
        ))}
      </span>
    )
  }
  return <span className={styles.contact}>{value}</span>
}

const CatEolResearchPage = ({searchParams}:{searchParams?:{provider?: string, site?: string}}) => {
  const csvPath = path.join(process.cwd(), 'cat-eol-research', 'providers.csv')
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const providers = parseCsvToProviders(csvText)

  const selectedProvider = searchParams?.provider || ''
  const siteUrl = searchParams?.site || ''
  const hasSelection = !!selectedProvider || !!siteUrl
  const mdPath = selectedProvider ? resolveProviderReport(selectedProvider) : ''
  const markdown = selectedProvider ? (mdPath && fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : `# ${selectedProvider}\n\nNo report found for this provider under \`cat-eol-research/providers/\`.\n`) : ''
  const html = selectedProvider ? marked.parse(markdown) : ''

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <div className={styles.title}>Cat EOL Research</div>
        <div className={styles.subtitle}>{providers.length} providers</div>
      </div>
      {hasSelection ? (
        <div className={styles.split}>
          <div className={`${styles.card} ${styles.leftPane}`}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.sticky}`}>Provider</th>
                    <th className={styles.th}>Link</th>
                    <th className={styles.th}>Notes</th>
                    <th className={styles.th} title="In-Home Euthanasia">Home</th>
                    <th className={styles.th} title="Private Cremation Available">Priv</th>
                    <th className={styles.th}>Euthanasia $</th>
                    <th className={styles.th}>Priv Crem $</th>
                    <th className={styles.th}>Comm Crem $</th>
                    <th className={styles.th}>Travel $</th>
                    <th className={styles.th}>After Hrs $</th>
                    <th className={styles.th}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p, idx) => {
                    const isActive = p.name === selectedProvider
                    const href = `/cat-eol-research?provider=${encodeURIComponent(p.name)}`
                    return (
                      <tr key={p.name || idx} className={`${idx % 2 === 1 ? styles.rowAlt : ''} ${isActive ? styles.rowActive : ''}`}>
                        <td className={`${styles.td} ${styles.sticky} ${styles.providerCell}`}>
                          <a className={`${styles.providerLink} ${isActive ? styles.providerLinkActive : ''}`} href={href}>{p.name}</a>
                        </td>
                        <td className={`${styles.td} ${styles.center}`}>{p.sourceUrl && <a href={`/cat-eol-research?site=${encodeURIComponent(p.sourceUrl)}`} className={styles.sourceLink}>🔗</a>}</td>
                        <td className={styles.td}><a href={href} className={styles.notesLink}>📝</a></td>
                        <td className={`${styles.td} ${styles.center}`}><TriStateIcon value={p.inHomeEuthanasia} /></td>
                        <td className={`${styles.td} ${styles.center}`}><TriStateIcon value={p.privateCremation} /></td>
                        <td className={styles.td}><PriceCell value={p.priceEuthanasia} /></td>
                        <td className={styles.td}><PriceCell value={p.pricePrivateCremation} /></td>
                        <td className={styles.td}><PriceCell value={p.priceCommunalCremation} /></td>
                        <td className={styles.td}><PriceCell value={p.priceTravel} /></td>
                        <td className={styles.td}><PriceCell value={p.priceAfterHours} /></td>
                        <td className={styles.td}><ContactCell value={p.howToSchedule} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className={`${styles.card} ${styles.rightPane}`}>
            <CloseButton />
            {siteUrl ? (
              <iframe src={siteUrl} className={styles.iframe} />
            ) : (
              <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableWrapFullWidth}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.sticky}`}>Provider</th>
                <th className={styles.th}>Link</th>
                <th className={styles.th}>Notes</th>
                <th className={styles.th} title="In-Home Euthanasia">Home</th>
                <th className={styles.th} title="Private Cremation Available">Priv</th>
                <th className={styles.th}>Euthanasia $</th>
                <th className={styles.th}>Priv Crem $</th>
                <th className={styles.th}>Comm Crem $</th>
                <th className={styles.th}>Travel $</th>
                <th className={styles.th}>After Hrs $</th>
                <th className={styles.th}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, idx) => {
                const isActive = p.name === selectedProvider
                const href = `/cat-eol-research?provider=${encodeURIComponent(p.name)}`
                return (
                  <tr key={p.name || idx} className={`${idx % 2 === 1 ? styles.rowAlt : ''} ${isActive ? styles.rowActive : ''}`}>
                    <td className={`${styles.td} ${styles.sticky} ${styles.providerCell}`}>
                      <a className={`${styles.providerLink} ${isActive ? styles.providerLinkActive : ''}`} href={href}>{p.name}</a>
                    </td>
                    <td className={`${styles.td} ${styles.center}`}>{p.sourceUrl && <a href={`/cat-eol-research?site=${encodeURIComponent(p.sourceUrl)}`} className={styles.sourceLink}>🔗</a>}</td>
                    <td className={styles.td}><a href={href} className={styles.notesLink}>📝</a></td>
                    <td className={`${styles.td} ${styles.center}`}><TriStateIcon value={p.inHomeEuthanasia} /></td>
                    <td className={`${styles.td} ${styles.center}`}><TriStateIcon value={p.privateCremation} /></td>
                    <td className={styles.td}><PriceCell value={p.priceEuthanasia} /></td>
                    <td className={styles.td}><PriceCell value={p.pricePrivateCremation} /></td>
                    <td className={styles.td}><PriceCell value={p.priceCommunalCremation} /></td>
                    <td className={styles.td}><PriceCell value={p.priceTravel} /></td>
                    <td className={styles.td}><PriceCell value={p.priceAfterHours} /></td>
                    <td className={styles.td}><ContactCell value={p.howToSchedule} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <ProviderCardView providers={providers} selectedProvider={selectedProvider} />
    </div>
  )
}

export default CatEolResearchPage
