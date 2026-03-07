import { Link } from "expo-router"
import { Text, View } from "react-native"

export default function RegisterScreen() {
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
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Create Account</Text>
      <Text>Create your account and start matching meals instantly.</Text>
      <Link href="/(auth)/login">Back To Login</Link>
    </View>
  )
}
