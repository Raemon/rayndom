import styles from './CatEolResearchPage.module.css'

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
  const textSources = display.split(/[,;]|\s+or\s+/i).map(s => s.trim()).filter(s => s.length > 0)
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
  const textSources = value.split(/[,;]|\s+or\s+|\s+and\s+/i).map(s => s.trim()).filter(s => s.length > 0)
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

const ProviderCard = ({provider, isActive, href}: {provider: Provider, isActive: boolean, href: string}) => {
  return (
    <div className={`${styles.card} ${isActive ? styles.rowActive : ''} ${styles.providerCard}`}>
      <div className={styles.providerCardHeader}>
        <a className={`${styles.providerLink} ${isActive ? styles.providerLinkActive : ''} ${styles.providerCardName}`} href={href}>{provider.name}</a>
        {provider.sourceUrl && <a href={provider.sourceUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}>↗</a>}
      </div>
      <div className={styles.providerCardContent}>
        <div className={styles.providerCardRow}>
          <div>Serves Berkeley: <TriStateIcon value={provider.servesBerkeley} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>In-Home Euthanasia: <TriStateIcon value={provider.inHomeEuthanasia} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>Private Cremation: <TriStateIcon value={provider.privateCremation} /></div>
        </div>
        <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>
          <div>Euthanasia: <PriceCell value={provider.priceEuthanasia} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>Private Cremation: <PriceCell value={provider.pricePrivateCremation} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>Communal Cremation: <PriceCell value={provider.priceCommunalCremation} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>Travel: <PriceCell value={provider.priceTravel} /></div>
        </div>
        <div className={styles.providerCardRow}>
          <div>After Hours: <PriceCell value={provider.priceAfterHours} /></div>
        </div>
        {provider.priceSedation && provider.priceSedation !== 'unknown' && provider.priceSedation !== 'not published' && (
          <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>Sedation: <PriceCell value={provider.priceSedation} /></div>
        )}
        {provider.priceBodyTransport && provider.priceBodyTransport !== 'unknown' && provider.priceBodyTransport !== 'not published' && (
          <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>Body Transport: <PriceCell value={provider.priceBodyTransport} /></div>
        )}
        {provider.incidentals && provider.incidentals !== 'unknown' && provider.incidentals !== 'not published' && (
          <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>Incidentals: <PriceCell value={provider.incidentals} /></div>
        )}
        {provider.waitTime && provider.waitTime !== 'unknown' && provider.waitTime !== 'not published' && (
          <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>Wait Time: {provider.waitTime}</div>
        )}
        <div className={`${styles.providerCardRow} ${styles.providerCardRowMargin}`}>Contact: <ContactCell value={provider.howToSchedule} /></div>
      </div>
    </div>
  )
}

const ProviderCardView = ({providers, selectedProvider}: {providers: Provider[], selectedProvider: string}) => {
  return (
    <div className={styles.providerCardGrid}>
      {providers.map((provider, idx) => {
        const isActive = provider.name === selectedProvider
        const href = `/cat-eol-research?provider=${encodeURIComponent(provider.name)}`
        return <ProviderCard key={provider.name || idx} provider={provider} isActive={isActive} href={href} />
      })}
    </div>
  )
}

export default ProviderCardView
