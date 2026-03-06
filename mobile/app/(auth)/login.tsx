import { Link } from "expo-router"
import { Text, View } from "react-native"

export default function LoginScreen() {
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
      <Text>Phase 1 auth UI scaffold.</Text>
      <Link href="/(tabs)/discover">Mock Sign In</Link>
      <Link href="/(auth)/register">Go To Register</Link>
    </View>
  )
}
