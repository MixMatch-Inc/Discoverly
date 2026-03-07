import { Pressable, StyleSheet, Text, View } from "react-native"
import { useCartStore } from "../../src/store/useCartStore"

export default function CartScreen() {
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Your Cart is Empty.</Text>
      </View>
    )
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Matched Items</Text>
      {items.map((item, index) => (
        <View key={`${item.id}-${index}`} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
      <Pressable style={styles.clearButton} onPress={clear}>
        <Text style={styles.clearText}>Clear Cart</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#F8F9FA",
  },
  emptyText: {
    flex: 1,
    textAlignVertical: "center",
    textAlign: "center",
    color: "#667085",
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  itemRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: {
    fontWeight: "600",
    color: "#111827",
  },
  itemPrice: {
    fontWeight: "700",
    color: "#111827",
  },
  totalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  clearButton: {
    marginTop: 16,
    backgroundColor: "#E53935",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  clearText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
})
