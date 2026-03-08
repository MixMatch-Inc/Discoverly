import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "../theme/tokens";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          ...shadows.soft,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
