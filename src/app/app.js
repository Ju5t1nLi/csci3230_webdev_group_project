const API_BASE = 'http://localhost:3001/trips'

export async function fetchTrips() {
  const response = await fetch(API_BASE)
  if (!response.ok) throw new Error('Failed to fetch trips')
  return await response.json()
}

export async function createTrip(title) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      user: 'default'
    })
  })
  if (!response.ok) throw new Error('Failed to create trip')
  return await response.json()
}

export async function deleteTrip(tripId) {
  const response = await fetch(`${API_BASE}/${tripId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete trip')
  return await response.json()
}
