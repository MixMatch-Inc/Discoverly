import { Animated, Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import type { DiscoverItem } from "../lib/api"

type FoodDetailsSheetProps = {
  visible: boolean
  card: DiscoverItem | null
  onClose: () => void
  onSwipePass: () => void
  onSwipeLike: () => void
  translateY: Animated.AnimatedInterpolation<string | number>
  backdropOpacity: Animated.AnimatedInterpolation<string | number>
}

export function FoodDetailsSheet(props: FoodDetailsSheetProps) {
  const { visible, card, onClose, onSwipePass, onSwipeLike, translateY, backdropOpacity } = props

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {card ? (
          <>
            <Text style={styles.modalTitle}>{card.name}</Text>
            <Text style={styles.modalMeta}>{card.restaurantName}</Text>
            <Text style={styles.modalMeta}>
              ${card.price.toFixed(2)} • {(card.distanceMeters / 1000).toFixed(1)}km
            </Text>
            <Text style={styles.modalBody}>{card.description}</Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.button, styles.passBtn]} onPress={onSwipePass}>
                <Text style={styles.buttonText}>Swipe Left</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.likeBtn]} onPress={onSwipeLike}>
                <Text style={styles.buttonText}>Swipe Right</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    minHeight: 260,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalMeta: {
    color: "#666",
    marginBottom: 4,
  },
  modalBody: {
    marginTop: 12,
    lineHeight: 22,
    color: "#222",
  },
  modalActions: {
    marginTop: 20,
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
