'use client'
import { useState, useEffect } from 'react'

export type Venue = {
  Name: string
  Location: string
  Address: string
  Type: string
  Capacity: string
  Contact: string
  BookingUrl: string
  Lat: string
  Lng: string
  Image: string
  Image2: string
  Image3: string
  Image4: string
  Image5: string
  Image6: string
  Price: string
}

const VenueDetailPanel = ({venue, onBack}: {venue: Venue, onBack: () => void}) => {
  const [expandedImg, setExpandedImg] = useState<string | null>(null)
  const imageUrls = [venue.Image, venue.Image2, venue.Image3, venue.Image4, venue.Image5, venue.Image6]
    .filter(url => url && url.trim().length > 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedImg) setExpandedImg(null)
        else onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expandedImg, onBack])
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onBack} className="text-gray-400 hover:text-white cursor-pointer" style={{fontSize: '14px'}}>← All Venues</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-medium m-0 mb-1">{venue.Name}</h2>
        {venue.BookingUrl && (
          <a href={venue.BookingUrl} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm">{venue.BookingUrl.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>
        )}
        <table className="text-sm mt-2 mb-2">
          <tbody>
            {venue.Location && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Location:</td><td>{venue.Location}</td></tr>}
            {venue.Address && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Address:</td><td>{venue.Address}</td></tr>}
            {venue.Type && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Type:</td><td>{venue.Type}</td></tr>}
            {venue.Capacity && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Capacity:</td><td>{venue.Capacity}</td></tr>}
            {venue.Price && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Price:</td><td>{venue.Price}</td></tr>}
            {venue.Contact && <tr><td className="text-gray-400 pr-2 align-top whitespace-nowrap">Contact:</td><td>{venue.Contact}</td></tr>}
          </tbody>
        </table>
        {imageUrls.length > 0 && (
          <div className="flex flex-col gap-1">
            {imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`${venue.Name} photo ${i + 1}`}
                className="w-full object-cover cursor-pointer"
                style={{height: '200px'}}
                onClick={() => setExpandedImg(url)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ))}
          </div>
        )}
      </div>
      {expandedImg && (
        <div onClick={() => setExpandedImg(null)}
          style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer', padding: '20px'}}>
          <img src={expandedImg} alt={venue.Name} style={{maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain'}} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default VenueDetailPanel
