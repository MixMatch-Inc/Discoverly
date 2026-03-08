import type { FoodItem, FoodPayload } from "./types"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"

function withAuth(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function throwHttpError(response: Response): Promise<never> {
  const payload = (await parseJsonSafe(response)) as { message?: string } | null
  const message = payload?.message ?? `Request failed (${response.status})`
  throw new Error(message)
}

function normalizeFood(raw: Record<string, unknown>): FoodItem {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    price: Number(raw.price ?? 0),
    image_url: String(raw.image_url ?? raw.imageUrl ?? ""),
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : true,
  }
}

export async function listRestaurantFoods(token: string): Promise<FoodItem[]> {
  const response = await fetch(`${API_BASE}/api/restaurant/foods`, {
    headers: {
      ...withAuth(token),
    },
  })

  if (!response.ok) {
    await throwHttpError(response)
  }

  const payload = (await parseJsonSafe(response)) as
    | { items?: Record<string, unknown>[]; foods?: Record<string, unknown>[]; data?: Record<string, unknown>[] }
    | null

  const source = payload?.items ?? payload?.foods ?? payload?.data ?? []
  return source.map(normalizeFood).filter((item) => item.id && item.name)
}

export async function createFood(token: string, body: FoodPayload): Promise<FoodItem> {
  const response = await fetch(`${API_BASE}/api/restaurant/foods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    await throwHttpError(response)
  }

  const payload = (await parseJsonSafe(response)) as { item?: Record<string, unknown> } & Record<string, unknown>
  return normalizeFood((payload.item as Record<string, unknown>) ?? payload)
}

export async function updateFood(token: string, foodId: string, body: FoodPayload): Promise<FoodItem> {
  const response = await fetch(`${API_BASE}/api/restaurant/foods/${foodId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    await throwHttpError(response)
  }

  const payload = (await parseJsonSafe(response)) as { item?: Record<string, unknown> } & Record<string, unknown>
  return normalizeFood((payload.item as Record<string, unknown>) ?? payload)
}

export async function deleteFood(token: string, foodId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/restaurant/foods/${foodId}`, {
    method: "DELETE",
    headers: {
      ...withAuth(token),
    },
  })

  if (!response.ok) {
    await throwHttpError(response)
  }
}

export async function uploadFoodImage(token: string, file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: {
      ...withAuth(token),
    },
    body: formData,
  })

  if (!response.ok) {
    await throwHttpError(response)
  }

  const payload = (await parseJsonSafe(response)) as { url?: string; data?: { url?: string } } | null
  const url = payload?.url ?? payload?.data?.url
  if (!url) {
    throw new Error("Upload succeeded but URL was not returned")
  }
  return url
}
