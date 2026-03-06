import { Text, View } from "react-native"

export default function SandboxScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Component Sandbox</Text>
      <Text style={{ marginTop: 8 }}>Typography, Button, Input, and Card previews will live here.</Text>
    </View>
  )
}
