'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

type MapItemValue = string | number | string[] | undefined
type MapItem = {
  name: string
  address: string
  lat?: number
  lng?: number
  [key: string]: MapItemValue
}

type GeocodedItem = MapItem & { lat: number; lng: number }

const geocodeCache: Record<string, { lat: number; lng: number } | null> = {}

const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (geocodeCache[address] !== undefined) return geocodeCache[address]
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'CsvMapComponent/1.0' } }
    )
    const data = await response.json()
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      geocodeCache[address] = result
      return result
    }
    geocodeCache[address] = null
    return null
  } catch (e) {
    console.error('Geocoding error for', address, e)
    geocodeCache[address] = null
    return null
  }
}

const MapContent = ({ items, addressField = 'address', nameField = 'name', latField = 'lat', lngField = 'lng', popupRenderer }: {
  items: Record<string, MapItemValue>[]
  addressField?: string
  nameField?: string
  latField?: string
  lngField?: string
  popupRenderer?: (item: Record<string, MapItemValue>) => React.ReactNode
}) => {
  const [geocodedItems, setGeocodedItems] = useState<GeocodedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const [ReactLeaflet, setReactLeaflet] = useState<typeof import('react-leaflet') | null>(null)
  useEffect(() => {
    Promise.all([import('leaflet'), import('react-leaflet')]).then(([leaflet, rl]) => {
      setL(leaflet.default)
      setReactLeaflet(rl)
    })
  }, [])
  useEffect(() => {
    if (!L) return
    const geocodeItems = async () => {
      setLoading(true)
      const results: GeocodedItem[] = []
      const itemsToProcess = items.map(item => ({
        name: String(item[nameField] || ''),
        address: String(item[addressField] || ''),
        lat: item[latField] !== undefined ? Number(item[latField]) : undefined,
        lng: item[lngField] !== undefined ? Number(item[lngField]) : undefined,
        ...item
      }))
      for (const item of itemsToProcess) {
        if (item.lat !== undefined && item.lng !== undefined && !isNaN(item.lat) && !isNaN(item.lng)) {
          results.push(item as GeocodedItem)
        } else if (item.address) {
          const coords = await geocodeAddress(item.address)
          if (coords) results.push({ ...item, lat: coords.lat, lng: coords.lng })
          await new Promise(r => setTimeout(r, 100))
        }
      }
      setGeocodedItems(results)
      setLoading(false)
    }
    geocodeItems()
  }, [items, addressField, nameField, latField, lngField, L])
  const center = useMemo(() => {
    if (geocodedItems.length === 0) return { lat: 37.8719, lng: -122.2585 }
    const avgLat = geocodedItems.reduce((sum, i) => sum + i.lat, 0) / geocodedItems.length
    const avgLng = geocodedItems.reduce((sum, i) => sum + i.lng, 0) / geocodedItems.length
    return { lat: avgLat, lng: avgLng }
  }, [geocodedItems])
  const bounds = useMemo(() => {
    if (geocodedItems.length === 0) return null
    const lats = geocodedItems.map(i => i.lat)
    const lngs = geocodedItems.map(i => i.lng)
    return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]] as [[number, number], [number, number]]
  }, [geocodedItems])
  const defaultIcon = useMemo(() => {
    if (!L) return null
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }, [L])
  if (!L || !ReactLeaflet) return <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading map...</div>
  const { MapContainer, TileLayer, Marker, Popup, useMap } = ReactLeaflet
  const FitBounds = ({ bounds }: { bounds: [[number, number], [number, number]] | null }) => {
    const map = useMap()
    useEffect(() => {
      if (bounds) map.fitBounds(bounds, { padding: [30, 30] })
    }, [bounds, map])
    return null
  }
  return (
    <div style={{position: 'relative'}}>
      {loading && <div style={{position: 'absolute', top: 8, left: 8, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', fontSize: '12px'}}>Geocoding {items.length - geocodedItems.length} addresses...</div>}
      <MapContainer center={[center.lat, center.lng]} zoom={12} style={{height: '400px', width: '100%'}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        {geocodedItems.map((item, i) => (
          <Marker key={i} position={[item.lat, item.lng]} icon={defaultIcon!}>
            <Popup>
              {popupRenderer ? popupRenderer(item) : (
                <div>
                  <strong>{item.name}</strong>
                  {item.address && <div style={{fontSize: '12px', color: '#666'}}>{item.address}</div>}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>{geocodedItems.length} of {items.length} locations mapped</div>
    </div>
  )
}

const CsvMap = (props: {
  items: Record<string, MapItemValue>[]
  addressField?: string
  nameField?: string
  latField?: string
  lngField?: string
  popupRenderer?: (item: Record<string, MapItemValue>) => React.ReactNode
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
  }, [mounted])
  if (!mounted) return <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading map...</div>
  return <MapContent {...props} />
}

export default CsvMap
