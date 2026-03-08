import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { mockFoodItems, type MockFoodItem } from "../../src/mocks/foods";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DISTANCE = SCREEN_WIDTH * 1.3;
const STACK_SIZE = 3;

type SwipeDirection = "left" | "right";

export default function DiscoverScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const cards = useMemo(() => mockFoodItems.slice(activeIndex), [activeIndex]);
  const visibleCards = cards.slice(0, STACK_SIZE);

  const consumeTopCard = (direction: SwipeDirection) => {
    const current = mockFoodItems[activeIndex];
    if (!current) {
      return;
    }

    if (direction === "right") {
      console.log(`Swiped Right: [${current.id}]`);
    } else {
      console.log(`Swiped Left: [${current.id}]`);
    }

    setActiveIndex((prev) => prev + 1);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isAnimating.value) {
        return;
      }

      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.18;
    })
    .onEnd(() => {
      if (isAnimating.value) {
        return;
      }

      if (translateX.value > SWIPE_THRESHOLD) {
        isAnimating.value = true;
        translateX.value = withTiming(
          SWIPE_OUT_DISTANCE,
          { duration: 220 },
          (finished) => {
            if (finished) {
              translateX.value = 0;
              translateY.value = 0;
              isAnimating.value = false;
              runOnJS(consumeTopCard)("right");
            }
          },
        );
        return;
      }

      if (translateX.value < -SWIPE_THRESHOLD) {
        isAnimating.value = true;
        translateX.value = withTiming(
          -SWIPE_OUT_DISTANCE,
          { duration: 220 },
          (finished) => {
            if (finished) {
              translateX.value = 0;
              translateY.value = 0;
              isAnimating.value = false;
              runOnJS(consumeTopCard)("left");
            }
          },
        );
        return;
      }

      translateX.value = withSpring(0, {
        damping: 18,
        stiffness: 160,
        mass: 0.9,
      });
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 160,
        mass: 0.9,
      });
    });

  const onButtonSwipe = (direction: SwipeDirection) => {
    if (isAnimating.value || cards.length === 0) {
      return;
    }

    isAnimating.value = true;
    const toValue =
      direction === "right" ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
    translateX.value = withTiming(toValue, { duration: 220 }, (finished) => {
      if (finished) {
        translateX.value = 0;
        translateY.value = 0;
        isAnimating.value = false;
        runOnJS(consumeTopCard)(direction);
      }
    });
  };

  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No More Cards</Text>
        <Text style={styles.emptySubtitle}>
          You have reviewed all mock dishes.
        </Text>
        <Pressable style={styles.resetButton} onPress={() => setActiveIndex(0)}>
          <Text style={styles.resetLabel}>Reset Stack</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.stackContainer}>
          {visibleCards
            .map((card, index) => ({ card, index }))
            .reverse()
            .map(({ card, index }) => {
              const isTop = index === 0;
              return (
                <SwipeCard
                  key={card.id}
                  card={card}
                  depth={index}
                  isTop={isTop}
                  tx={translateX}
                  ty={translateY}
                />
              );
            })}
        </View>
      </GestureDetector>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.nopeButton]}
          onPress={() => onButtonSwipe("left")}
        >
          <Text style={styles.actionLabel}>Pass</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => onButtonSwipe("right")}
        >
          <Text style={styles.actionLabel}>Like</Text>
        </Pressable>
      </View>
    </View>
  );
}

type SwipeCardProps = {
  card: MockFoodItem;
  depth: number;
  isTop: boolean;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
};

function SwipeCard({ card, depth, isTop, tx, ty }: SwipeCardProps) {
  const cardStyle = useAnimatedStyle(() => {
    const dragAbs = Math.abs(tx.value);
    const baseScale = 1 - depth * 0.04;
    const nextScaleBoost =
      depth === 1
        ? interpolate(
            dragAbs,
            [0, SWIPE_THRESHOLD],
            [0, 0.04],
            Extrapolation.CLAMP,
          )
        : 0;

    return {
      transform: [
        { translateX: isTop ? tx.value : 0 },
        { translateY: isTop ? ty.value : depth * 12 },
        {
          rotate: isTop
            ? `${interpolate(tx.value, [-SWIPE_OUT_DISTANCE, 0, SWIPE_OUT_DISTANCE], [-13, 0, 13], Extrapolation.CLAMP)}deg`
            : "0deg",
        },
        { scale: baseScale + nextScaleBoost },
      ],
      zIndex: 100 - depth,
    };
  });

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(
          tx.value,
          [40, SWIPE_THRESHOLD],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0,
    transform: [
      {
        scale: isTop
          ? interpolate(
              tx.value,
              [40, SWIPE_THRESHOLD],
              [0.8, 1],
              Extrapolation.CLAMP,
            )
          : 0.8,
      },
    ],
  }));

  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(
          tx.value,
          [-40, -SWIPE_THRESHOLD],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0,
    transform: [
      {
        scale: isTop
          ? interpolate(
              tx.value,
              [-40, -SWIPE_THRESHOLD],
              [0.8, 1],
              Extrapolation.CLAMP,
            )
          : 0.8,
      },
    ],
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Image source={card.imageUrl} style={styles.image} contentFit="cover" />

      <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
        <Text style={styles.stampLabel}>LIKE</Text>
      </Animated.View>
      <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
        <Text style={styles.stampLabel}>NOPE</Text>
      </Animated.View>

      <View style={styles.cardBody}>
        <Text style={styles.foodName}>{card.name}</Text>
        <Text style={styles.meta}>{card.restaurant}</Text>
        <Text style={styles.meta}>${card.price.toFixed(2)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    padding: 18,
  },
  stackContainer: {
    width: "100%",
    maxWidth: 380,
    height: 540,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: 500,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  image: {
    width: "100%",
    height: "82%",
  },
  cardBody: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  meta: {
    color: "#4B5563",
    fontSize: 14,
  },
  stamp: {
    position: "absolute",
    top: 28,
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  likeStamp: {
    right: 24,
    borderColor: "#1FAF62",
  },
  nopeStamp: {
    left: 24,
    borderColor: "#EF4444",
  },
  stampLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.7,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 22,
  },
  actionButton: {
    minWidth: 138,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nopeButton: {
    backgroundColor: "#E53935",
  },
  likeButton: {
    backgroundColor: "#1FAF62",
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "#6B7280",
  },
  resetButton: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resetLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
