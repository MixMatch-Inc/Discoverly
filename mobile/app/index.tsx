import { Redirect } from "expo-router"
import { useAuthStore } from "../src/store/useAuthStore"

export default function IndexScreen() {
  const token = useAuthStore((state) => state.token)

  return <Redirect href={token ? "/(tabs)/discover" : "/(auth)/login"} />
}
