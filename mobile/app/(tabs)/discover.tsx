import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { Image as ExpoImage } from "expo-image"
import { fetchDiscoverFeed, sendSwipe, type DiscoverItem } from "../../src/lib/api"

const DISCOVERY_COORDINATES = {
  longitude: -73.99,
  latitude: 40.73,
}

const PREFETCH_THRESHOLD = 3

export default function DiscoverScreen() {
  const [cards, setCards] = useState<DiscoverItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [prefetching, setPrefetching] = useState(false)

  const prefetchImages = useCallback(async (items: DiscoverItem[]) => {
    const urls = items.map((item) => item.imageUrl).filter(Boolean)
    if (urls.length > 0) {
      await ExpoImage.prefetch(urls)
    }
  }, [])

  const loadPage = useCallback(
    async (nextCursor?: string | null, append = false) => {
      const result = await fetchDiscoverFeed({
        ...DISCOVERY_COORDINATES,
        cursor: nextCursor,
      })

      await prefetchImages(result.items)

      setCards((prev) => (append ? [...prev, ...result.items] : result.items))
      setCursor(result.cursor)
    },
    [prefetchImages],
  )

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        await loadPage(null, false)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [loadPage])

  const maybePrefetchNext = useCallback(
    async (remaining: number) => {
      if (remaining > PREFETCH_THRESHOLD || !cursor || prefetching) {
        return
      }

      setPrefetching(true)
      try {
        await loadPage(cursor, true)
      } finally {
        setPrefetching(false)
      }
    },
    [cursor, loadPage, prefetching],
  )

  const handleSwipe = useCallback(
    async (action: "like" | "pass") => {
      const top = cards[0]
      if (!top) {
        return
      }

      setCards((prev) => prev.slice(1))
      void sendSwipe({ foodId: top.id, action }).catch(() => {})

      const remaining = cards.length - 1
      await maybePrefetchNext(remaining)
    },
    [cards, maybePrefetchNext],
  )

  const stack = useMemo(() => cards.slice(0, 3), [cards])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.caption}>Loading discovery feed...</Text>
      </View>
    )
  }

  if (cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No more items nearby</Text>
        <Text style={styles.caption}>Try again in a moment.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.stackWrap}>
        {stack
          .map((item, index) => ({ item, index }))
          .reverse()
          .map(({ item, index }) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  top: index * 10,
                  transform: [{ scale: 1 - index * 0.03 }],
                },
              ]}
            >
              <ExpoImage source={item.imageUrl} style={styles.image} contentFit="cover" />
              <View style={styles.cardBody}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.meta}>{item.restaurantName}</Text>
                <Text style={styles.meta}>
                  ${item.price.toFixed(2)} • {(item.distanceMeters / 1000).toFixed(1)}km
                </Text>
              </View>
            </View>
          ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.passBtn]} onPress={() => void handleSwipe("pass")}>
          <Text style={styles.buttonText}>Pass</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.likeBtn]} onPress={() => void handleSwipe("like")}>
          <Text style={styles.buttonText}>Like</Text>
        </Pressable>
      </View>

      {prefetching ? <Text style={styles.caption}>Prefetching next cards...</Text> : null}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  caption: {
    color: "#666",
  },
  stackWrap: {
    width: "100%",
    maxWidth: 380,
    height: 520,
    position: "relative",
    marginBottom: 20,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: 500,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "78%",
  },
  cardBody: {
    padding: 14,
    gap: 4,
  },
  foodName: {
    fontSize: 20,
    fontWeight: "700",
  },
  meta: {
    color: "#555",
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
  passBtn: {
    backgroundColor: "#E53935",
  },
  likeBtn: {
    backgroundColor: "#2E7D32",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
})
