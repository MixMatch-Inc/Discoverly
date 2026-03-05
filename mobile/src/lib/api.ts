import { useAuthStore } from "../store/useAuthStore"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000"
const DEMO_USER_ID = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? "660000000000000000000001"

export type DiscoverItem = {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  imageUrl: string
  restaurantName: string
  distanceMeters: number
}

type DiscoverResponse = {
  items: DiscoverItem[]
  cursor: string | null
}

function getAuthHeaders() {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchDiscoverFeed(params: {
  longitude: number
  latitude: number
  cursor?: string | null
}) {
  const query = new URLSearchParams({
    longitude: String(params.longitude),
    latitude: String(params.latitude),
  })

  if (params.cursor) {
    query.set("cursor", params.cursor)
  }

  const response = await fetch(`${API_BASE_URL}/api/foods/discover?${query.toString()}`, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch discover feed: ${response.status}`)
  }

  return (await response.json()) as DiscoverResponse
}

export async function sendSwipe(params: { foodId: string; action: "like" | "pass" }) {
  const response = await fetch(`${API_BASE_URL}/api/swipe`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
      "x-user-id": DEMO_USER_ID,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error(`Failed to send swipe: ${response.status}`)
  }
}
