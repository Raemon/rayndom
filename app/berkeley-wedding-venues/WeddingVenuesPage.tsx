import fs from 'fs'
import path from 'path'
import VenuesGrid from './VenuesGrid'
import DetailRowList from './DetailRowList'

export type Venue = {
  name: string
  venueUrl: string
  pricingUrl: string
  capacityUrl: string
  capacity: string
  priceRange: string
  lowestPrice: number | null
  highestPrice: number | null
  address: string
  region: string
  type: string
  distanceMiles: number | null
  photoUrls: string[]
}

const parsePriceRange = (priceRange: string): {lowest: number | null, highest: number | null} => {
  const matches = priceRange.match(/\$[\d,]+/g)
  if (!matches || matches.length === 0) return {lowest: null, highest: null}
  const prices = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10)).filter(n => !isNaN(n))
  if (prices.length === 0) return {lowest: null, highest: null}
  return {lowest: Math.min(...prices), highest: Math.max(...prices)}
}

const parseCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

const parseCsvToVenues = (csv: string): Venue[] => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length <= 1) return []
  const dataLines = lines.slice(1)
  return dataLines.map((line) => {
    const cols = parseCsvLine(line)
    const priceRange = cols[5] || ''
    const {lowest, highest} = parsePriceRange(priceRange)
    return {
      name: cols[0] || '',
      venueUrl: cols[1] || '',
      pricingUrl: cols[2] || '',
      capacityUrl: cols[3] || '',
      capacity: cols[4] || '',
      priceRange,
      lowestPrice: lowest,
      highestPrice: highest,
      address: cols[6] || '',
      region: cols[7] || '',
      type: cols[8] || '',
      distanceMiles: cols[9] ? parseFloat(cols[9]) : null,
      photoUrls: (cols[10] || '').split('|').map(url => url.trim()).filter(url => url.length > 0),
    }
  })
}

const parseCsvToRows = (csv: string): {columns: string[], rows: Record<string, string>[]} => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length <= 1) return {columns: [], rows: []}
  const headerLine = lines[0]
  const columns = parseCsvLine(headerLine)
  const dataLines = lines.slice(1)
  const rows = dataLines.map((line) => {
    const cols = parseCsvLine(line)
    const row: Record<string, string> = {}
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = cols[i] || ''
    }
    return row
  })
  return {columns, rows}
}

const WeddingVenuesPage = () => {
  const csvPath = path.join(process.cwd(), 'app', 'berkeley-wedding-venues', 'venues.csv')
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const venues = parseCsvToVenues(csvText)
  const {columns, rows} = parseCsvToRows(csvText)
  return (
    <div style={{padding: '20px', fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{margin: '0 0 8px 0', fontSize: '24px'}}>Wedding Venues Near Berkeley</h1>
      <p style={{margin: '0 0 16px 0', color: '#666', fontSize: '14px'}}>{venues.length} venues within ~1 hour drive</p>
      <VenuesGrid venues={venues} />
      <DetailRowList rows={rows} columns={columns} rowNameKey="Name" />
    </div>
  )
}

export default WeddingVenuesPage
