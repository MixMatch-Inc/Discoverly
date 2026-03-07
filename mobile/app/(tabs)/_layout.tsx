import { Tabs } from "expo-router"
import { useCartStore } from "../../src/store/useCartStore"

export default function TabsLayout() {
  const itemCount = useCartStore((state) => state.items.length)

  return (
    <Tabs>
      <Tabs.Screen name="discover" options={{ title: "Discover" }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="sandbox" options={{ href: null }} />
    </Tabs>
  )
}
