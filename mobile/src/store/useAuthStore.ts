import * as SecureStore from "expo-secure-store"
import { create } from "zustand"

const TOKEN_KEY = "discoverly.auth.token"
const USER_KEY = "discoverly.auth.user"

export type AuthUser = {
  id: string
  email: string
  role: "user" | "restaurant" | "admin"
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  hydrated: boolean
  hydrate: () => Promise<void>
  login: (payload: { token: string; user: AuthUser }) => Promise<void>
  setToken: (token: string | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ])

      let user: AuthUser | null = null
      if (userRaw) {
        try {
          user = JSON.parse(userRaw) as AuthUser
        } catch {
          user = null
        }
      }

      set({
        token: token ?? null,
        user,
        hydrated: true,
      })
    } catch {
      set({
        token: null,
        user: null,
        hydrated: true,
      })
    }
  },
  login: async ({ token, user }) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ])
    set({
      token,
      user,
    })
  },
  setToken: (token) => {
    void (async () => {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token)
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
      }
    })()
    set({ token })
  },
  logout: async () => {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)])
    set({ token: null, user: null })
  },
}))
