import { create } from "zustand"

export type CartItem = {
  id: string
  name: string
  price: number
  restaurantName?: string
  imageUrl?: string
  quantity?: number
}

export type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((entry) => entry.id === item.id)
      if (!existing) {
        return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] }
      }

      return {
        items: state.items.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: (entry.quantity ?? 1) + 1 } : entry,
        ),
      }
    }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] }),
}))
