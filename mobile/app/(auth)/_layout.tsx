import { Redirect, Stack } from "expo-router"
import { useAuthStore } from "../../src/store/useAuthStore"

export default function AuthLayout() {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Redirect href="/(tabs)/discover" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
