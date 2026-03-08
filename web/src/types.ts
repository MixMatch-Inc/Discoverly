export type FoodItem = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_active?: boolean
}

export type FoodPayload = {
  name: string
  description: string
  price: number
  image_url: string
}
