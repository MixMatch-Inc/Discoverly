import { Redirect, Tabs } from "expo-router";

import { useAuthStore } from "../../src/store/useAuthStore";
import { useCartStore } from "../../src/store/useCartStore";

export default function TabsLayout() {
  const token = useAuthStore((state) => state.token);
  const itemCount = useCartStore((state) => state.items.length);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

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
  );
}
