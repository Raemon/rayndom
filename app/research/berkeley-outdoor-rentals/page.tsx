import fs from 'fs'
import path from 'path'
import OutdoorRentalsPage from './OutdoorRentalsPage'
import { Venue } from './VenueDetailPanel'

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

export default function Page() {
  const csvPath = path.join(process.cwd(), 'outputs', 'berkeley-outdoor-rentals', '_outputrentals.csv')
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0)
  if (lines.length <= 1) return <div>No venues found</div>
  const headers = parseCsvLine(lines[0])
  const venues: Venue[] = lines.slice(1).map(line => {
    const cols = parseCsvLine(line)
    const row: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cols[i] || ''
    }
    return row as unknown as Venue
  })
  return <OutdoorRentalsPage venues={venues} />
}
