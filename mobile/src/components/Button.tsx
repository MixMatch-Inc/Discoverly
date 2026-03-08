import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type ViewStyle } from "react-native";

import { Typography } from "./Typography";
import { colors, radius, spacing } from "../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "outlined";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  style?: ViewStyle;
};

function getContainerStyle(
  variant: ButtonVariant,
  disabled: boolean,
): ViewStyle {
  if (variant === "outlined") {
    return {
      backgroundColor: colors.surface,
      borderColor: disabled ? colors.disabled : colors.crypto,
      borderWidth: 1.5,
    };
  }

  if (variant === "secondary") {
    return {
      backgroundColor: disabled ? colors.disabled : colors.crypto,
    };
  }

  return {
    backgroundColor: disabled ? colors.disabled : colors.primary,
  };
}

function getLabelColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) {
    return variant === "outlined" ? colors.muted : colors.surface;
  }

  if (variant === "outlined") {
    return colors.crypto;
  }

  if (variant === "secondary") {
    return colors.onCrypto;
  }

  return colors.onPrimary;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const labelColor = getLabelColor(variant, isDisabled);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
          opacity: pressed ? 0.9 : 1,
        },
        getContainerStyle(variant, isDisabled),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {leftIcon}
          <Typography
            variant="body"
            color={labelColor}
            style={{ fontWeight: "700" }}
          >
            {label}
          </Typography>
        </>
      )}
    </Pressable>
  );
}
