import { Redirect } from "expo-router"
import { useAuthStore } from "../src/store/useAuthStore"

export default function IndexScreen() {
  const hydrated = useAuthStore((state) => state.hydrated)
  const token = useAuthStore((state) => state.token)

  if (!hydrated) {
    return null
  }

  return <Redirect href={token ? "/(tabs)/discover" : "/(auth)/login"} />
}
