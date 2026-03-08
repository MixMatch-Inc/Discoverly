import { useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { useAuthStore } from "../../src/store/useAuthStore"

export default function ProfileScreen() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  const onLogout = async () => {
    await logout()
    router.replace("/(auth)/login")
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>User Profile & Wallet.</Text>
      <Text>{user?.email ?? "No user loaded"}</Text>
      <Text>{token ? "Token hydrated" : "No token found"}</Text>
      <Pressable
        onPress={() => void onLogout()}
        style={{ backgroundColor: "#E53935", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
      </Pressable>
    </View>
  )
}
