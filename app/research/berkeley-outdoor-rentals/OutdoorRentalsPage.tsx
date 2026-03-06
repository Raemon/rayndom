'use client'
import { useState } from 'react'
import CsvMap from '../../common/CsvMap'
import VenueDetailPanel, { Venue } from './VenueDetailPanel'

const OutdoorRentalsPage = ({venues}: {venues: Venue[]}) => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const mapItems = venues.map(v => ({
    Name: v.Name, Address: v.Address, Lat: v.Lat, Lng: v.Lng,
    Location: v.Location, Type: v.Type, Capacity: v.Capacity, Price: v.Price,
    MarkerImage: v.Image || v.Image2,
    Images: [v.Image, v.Image2, v.Image3, v.Image4, v.Image5, v.Image6].filter(u => u && u.trim()),
  }))
  const handleMarkerClick = (item: Record<string, unknown>) => {
    const venue = venues.find(v => v.Name === item.Name)
    if (venue) setSelectedVenue(venue)
  }
  return (
    <div className="flex h-screen">
      <div className="flex-1 min-w-0">
        <CsvMap items={mapItems} nameField="Name" addressField="Address" latField="Lat" lngField="Lng"
          height="100vh" onMarkerClick={handleMarkerClick} selectedItem={selectedVenue?.Name} markerImageField="MarkerImage"
          markerSize={56}
          markerLabelRenderer={(item) => `${String(item.Capacity || '')}`}
          tooltipRenderer={(item) => {
            const images = (item.Images as string[] | undefined) || []
            return (
              <div>
                <strong>{String(item.Name)}</strong>
                <div style={{fontSize: '11px', color: '#666'}}>{String(item.Type)} · Cap: {String(item.Capacity)}</div>
                {item.Price && <div style={{fontSize: '11px', color: '#4ade80'}}>{String(item.Price)}</div>}
                <div style={{fontSize: '11px', color: '#888'}}>{String(item.Location)}</div>
                {images.length > 0 && (
                  <div style={{display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap'}}>
                    {images.map((url, i) => (
                      <img key={i} src={url} alt="" style={{width: '80px', height: '60px', objectFit: 'cover'}}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          }}
          popupRenderer={(item) => (
            <div>
              <strong style={{cursor: 'pointer'}} onClick={() => { const v = venues.find(v => v.Name === item.Name); if (v) setSelectedVenue(v) }}>{String(item.Name)}</strong>
              <div style={{fontSize: '12px', color: '#666'}}>{String(item.Type)} · {String(item.Capacity)}</div>
            </div>
          )} />
      </div>
      <div className="w-[420px] flex-shrink-0 overflow-y-auto p-3 bg-[#1a1a2a]" style={{height: '100vh'}}>
        {selectedVenue ? (
          <VenueDetailPanel venue={selectedVenue} onBack={() => setSelectedVenue(null)} />
        ) : (
          <div>
            <h1 className="text-lg font-medium m-0 mb-2">Outdoor Rental Venues</h1>
            <p className="text-gray-400 text-sm m-0 mb-2">{venues.length} venues near Berkeley</p>
            <div className="flex flex-col gap-1">
              {venues.map(venue => {
                const firstImg = venue.Image || venue.Image2
                return (
                  <div key={venue.Name} onClick={() => setSelectedVenue(venue)}
                    className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-[#2a2a3a]">
                    {firstImg && <img src={firstImg} alt={venue.Name} className="w-12 h-9 object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{venue.Name}</div>
                      <div className="text-xs text-gray-400 truncate">{venue.Type} · {venue.Capacity}{venue.Price && venue.Price !== 'Contact city' && venue.Price !== 'Contact for pricing' ? ` · ${venue.Price}` : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutdoorRentalsPage
