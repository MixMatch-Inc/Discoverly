import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Image as ExpoImage } from "expo-image"
import { fetchDiscoverFeed, sendSwipe, type DiscoverItem } from "../../src/lib/api"
import { FoodDetailsSheet } from "../../src/components/FoodDetailsSheet"

const DISCOVERY_COORDINATES = {
  longitude: -73.99,
  latitude: 40.73,
}

const PREFETCH_THRESHOLD = 3
const SWIPE_OUT_DISTANCE = Dimensions.get("window").width + 80

export default function DiscoverScreen() {
  const [cards, setCards] = useState<DiscoverItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [prefetching, setPrefetching] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<DiscoverItem | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const modalAnim = useRef(new Animated.Value(0)).current
  const topCardX = useRef(new Animated.Value(0)).current

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
      setLoadError(null)
    },
    [prefetchImages],
  )

  const loadInitialPage = useCallback(async () => {
    setLoading(true)
    try {
      await loadPage(null, false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load discover feed"
      setLoadError(message)
      setCards([])
      setCursor(null)
    } finally {
      setLoading(false)
    }
  }, [loadPage])

  useEffect(() => {
    let active = true

    ;(async () => {
      await loadInitialPage()
      if (!active) {
        return
      }
    })()

    return () => {
      active = false
    }
  }, [loadInitialPage])

  const maybePrefetchNext = useCallback(
    async (remaining: number) => {
      if (remaining > PREFETCH_THRESHOLD || !cursor || prefetching) {
        return
      }

      setPrefetching(true)
      try {
        await loadPage(cursor, true)
      } catch {
        // Keep current cards available if prefetch fails.
      } finally {
        setPrefetching(false)
      }
    },
    [cursor, loadPage, prefetching],
  )

  const hideModal = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (!modalVisible) {
        resolve()
        return
      }

      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false)
        setSelectedCard(null)
        resolve()
      })
    })
  }, [modalAnim, modalVisible])

  const showModal = useCallback(
    (card: DiscoverItem) => {
      setSelectedCard(card)
      setModalVisible(true)
      modalAnim.setValue(0)
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start()
    },
    [modalAnim],
  )

  const animateSwipeOut = useCallback((direction: 1 | -1) => {
    return new Promise<void>((resolve) => {
      Animated.timing(topCardX, {
        toValue: direction * SWIPE_OUT_DISTANCE,
        duration: 230,
        useNativeDriver: true,
      }).start(() => {
        topCardX.setValue(0)
        resolve()
      })
    })
  }, [topCardX])

  const handleSwipe = useCallback(
    async (action: "like" | "pass") => {
      const top = cards[0]
      if (!top) {
        return
      }

      await hideModal()
      await animateSwipeOut(action === "like" ? 1 : -1)

      setCards((prev) => prev.slice(1))
      void sendSwipe({ foodId: top.id, action }).catch(() => {})

      const remaining = cards.length - 1
      await maybePrefetchNext(remaining)
    },
    [animateSwipeOut, cards, hideModal, maybePrefetchNext],
  )

  const stack = useMemo(() => cards.slice(0, 3), [cards])

  const modalTranslateY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  })

  const modalBackdropOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  })

  const topCardRotate = topCardX.interpolate({
    inputRange: [-SWIPE_OUT_DISTANCE, 0, SWIPE_OUT_DISTANCE],
    outputRange: ["-10deg", "0deg", "10deg"],
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.caption}>Loading discovery feed...</Text>
      </View>
    )
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Could not load discovery feed</Text>
        <Text style={styles.caption}>{loadError}</Text>
        <Pressable style={[styles.button, styles.retryBtn]} onPress={() => void loadInitialPage()}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
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
          .map(({ item, index }) => {
            const isTop = index === 0
            const CardContainer = isTop ? Animated.View : View

            return (
              <CardContainer
                key={item.id}
                style={[
                  styles.card,
                  {
                    top: index * 10,
                    transform: [
                      { scale: 1 - index * 0.03 },
                      ...(isTop ? [{ translateX: topCardX }, { rotate: topCardRotate }] : []),
                    ],
                  },
                ]}
              >
                <Pressable style={styles.cardTap} onPress={() => showModal(item)}>
                  <ExpoImage source={item.imageUrl} style={styles.image} contentFit="cover" />
                  <View style={styles.cardBody}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.meta}>{item.restaurantName}</Text>
                    <Text style={styles.meta}>
                      ${item.price.toFixed(2)} • {(item.distanceMeters / 1000).toFixed(1)}km
                    </Text>
                  </View>
                </Pressable>
                <Pressable style={styles.infoButton} onPress={() => showModal(item)}>
                  <Text style={styles.infoButtonText}>Info</Text>
                </Pressable>
              </CardContainer>
            )
          })}
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

      <FoodDetailsSheet
        visible={modalVisible}
        card={selectedCard}
        onClose={() => {
          void hideModal()
        }}
        onSwipePass={() => {
          void handleSwipe("pass")
        }}
        onSwipeLike={() => {
          void handleSwipe("like")
        }}
        translateY={modalTranslateY}
        backdropOpacity={modalBackdropOpacity}
      />
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
    marginTop: 10,
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
  cardTap: {
    flex: 1,
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
  infoButton: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(17,24,39,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
  retryBtn: {
    marginTop: 12,
    backgroundColor: "#1D4ED8",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
})
