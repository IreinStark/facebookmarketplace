import { NextResponse } from 'next/server'

// Known locations used in the app with coordinates
const locationData = [
  { name: 'Lefkosa', lat: 35.1856, lng: 33.3823, region: 'Central' },
  { name: 'Girne', lat: 35.3414, lng: 33.3152, region: 'Northern' },
  { name: 'Famagusta', lat: 35.1264, lng: 33.9378, region: 'Eastern' },
  { name: 'Iskele', lat: 35.2833, lng: 33.9167, region: 'Eastern' },
  { name: 'Guzelyurt', lat: 35.2042, lng: 33.0292, region: 'Western' },
  { name: 'Lapta', lat: 35.3333, lng: 33.1833, region: 'Northern' },
  { name: 'Alsancak', lat: 35.3167, lng: 33.2167, region: 'Northern' },
  { name: 'Catalkoy', lat: 35.35, lng: 33.3833, region: 'Northern' },
  { name: 'Esentepe', lat: 35.3667, lng: 33.5167, region: 'Northern' },
  { name: 'Bogaz', lat: 35.3833, lng: 33.6167, region: 'Northern' },
  { name: 'Dipkarpaz', lat: 35.6, lng: 34.3833, region: 'Karpaz' },
  { name: 'Yeni Iskele', lat: 35.2667, lng: 33.9333, region: 'Eastern' },
]

function findNearestLocation(lat: number, lng: number): string {
  let nearestName = 'All Locations'
  let bestScore = Number.POSITIVE_INFINITY
  for (const loc of locationData) {
    const dLat = lat - loc.lat
    const dLng = lng - loc.lng
    const score = dLat * dLat + dLng * dLng
    if (score < bestScore) {
      bestScore = score
      nearestName = loc.name
    }
  }
  return nearestName
}

export async function GET(request: Request) {
  // Try platform headers (e.g., Vercel)
  try {
    const city = (request.headers.get('x-vercel-ip-city') || '').toString()
    const latHeader = request.headers.get('x-vercel-ip-latitude')
    const lngHeader = request.headers.get('x-vercel-ip-longitude')

    if (latHeader && lngHeader) {
      const lat = parseFloat(latHeader)
      const lng = parseFloat(lngHeader)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const nearest = findNearestLocation(lat, lng)
        return NextResponse.json({ city, lat, lon: lng, nearest })
      }
    }
  } catch {}

  // Fallback: external IP geolocation service
  try {
    const res = await fetch('https://ipapi.co/json', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const lat = Number(data.latitude)
      const lng = Number(data.longitude)
      const city = (data.city || '').toString()
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const nearest = findNearestLocation(lat, lng)
        return NextResponse.json({ city, lat, lon: lng, nearest })
      }
      // If no lat/lng, try to map by city name directly
      const candidate = locationData.find(l => l.name.toLowerCase() === city.toLowerCase())
      if (candidate) {
        return NextResponse.json({ city, lat: candidate.lat, lon: candidate.lng, nearest: candidate.name })
      }
    }
  } catch {}

  // Graceful default
  return NextResponse.json({ city: '', lat: null, lon: null, nearest: 'All Locations' })
}

