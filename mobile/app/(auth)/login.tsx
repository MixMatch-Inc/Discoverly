import { Link, useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { useAuthStore } from "../../src/store/useAuthStore"

export default function LoginScreen() {
  const router = useRouter()
  const setToken = useAuthStore((state) => state.setToken)

  const onSignIn = () => {
    setToken("session_token")
    router.replace("/(tabs)/discover")
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        gap: 12,
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Welcome Back</Text>
      <Text>Sign in to discover dishes curated for your taste.</Text>
      <Pressable
        onPress={onSignIn}
        style={{ backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Sign In</Text>
      </Pressable>
      <Link href="/(auth)/register">Go To Register</Link>
    </View>
  )
}
