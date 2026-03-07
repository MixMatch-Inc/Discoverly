import { useMemo, useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import * as Haptics from "expo-haptics"
import { useCartStore } from "../../src/store/useCartStore"

type DiscoverCard = {
  id: string
  name: string
  restaurant: string
  price: number
}

const mockCards: DiscoverCard[] = [
  { id: "food-1", name: "Spicy Smash Burger", restaurant: "Flare Grill", price: 13.5 },
  { id: "food-2", name: "Truffle Fries", restaurant: "North Bite", price: 7.25 },
  { id: "food-3", name: "Mango Chicken Bowl", restaurant: "Citrus Kitchen", price: 12.9 },
  { id: "food-4", name: "Pepperoni Fire Pizza", restaurant: "Stone Oven Co", price: 15.0 },
]

export default function DiscoverScreen() {
  const [cards, setCards] = useState<DiscoverCard[]>(mockCards)
  const addItem = useCartStore((state) => state.addItem)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const overlayScale = useRef(new Animated.Value(0.9)).current

  const top = cards[0]
  const remaining = cards.length

  const animateMatchOverlay = () => {
    overlayOpacity.setValue(0)
    overlayScale.setValue(0.9)

    Animated.sequence([
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(overlayScale, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const onSwipe = async (action: "like" | "pass") => {
    if (!top) return
    setCards((prev) => prev.slice(1))

    if (action === "like") {
      addItem({ id: top.id, name: top.name, price: top.price })
      animateMatchOverlay()
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const subtitle = useMemo(() => {
    if (!top) return "No more cards. Pull to refresh soon."
    return `${top.restaurant} • $${top.price.toFixed(2)}`
  }, [top])

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.matchOverlay,
          {
            opacity: overlayOpacity,
            transform: [{ scale: overlayScale }],
          },
        ]}
      >
        <Text style={styles.matchTitle}>Matched!</Text>
        <Text style={styles.matchSubtitle}>Added to Cart</Text>
      </Animated.View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{top?.name ?? "All Caught Up"}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => void onSwipe("pass")} style={[styles.button, styles.passButton]}>
          <Text style={styles.buttonText}>Pass</Text>
        </Pressable>
        <Pressable onPress={() => void onSwipe("like")} style={[styles.button, styles.likeButton]}>
          <Text style={styles.buttonText}>Like</Text>
        </Pressable>
      </View>

      <Text style={styles.remaining}>{remaining} cards remaining</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    minHeight: 220,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  cardSubtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    minWidth: 130,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  passButton: {
    backgroundColor: "#E53935",
  },
  likeButton: {
    backgroundColor: "#2E7D32",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  remaining: {
    marginTop: 16,
    color: "#667085",
  },
  matchOverlay: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    zIndex: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  matchSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#14532D",
  },
})
