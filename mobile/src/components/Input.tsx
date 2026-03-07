import { useState } from "react"
import { Pressable, TextInput, View, type TextInputProps, type ViewStyle } from "react-native"
import { colors, radius, spacing } from "../theme/tokens"
import { Typography } from "./Typography"

type InputProps = TextInputProps & {
  label?: string
  error?: string
  forceFocused?: boolean
  containerStyle?: ViewStyle
  rightLabel?: string
  onRightPress?: () => void
}

export function Input({
  label,
  error,
  forceFocused = false,
  containerStyle,
  rightLabel,
  onRightPress,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const focused = forceFocused || isFocused

  return (
    <View style={[{ width: "100%", gap: spacing.xs }, containerStyle]}>
      {label ? <Typography variant="caption">{label}</Typography> : null}
      <View
        style={{
          minHeight: 52,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: error ? colors.error : focused ? colors.crypto : colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        }}
      >
        <TextInput
          placeholderTextColor={colors.muted}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            onBlur?.(event)
          }}
          style={{
            color: colors.text,
            flex: 1,
            paddingVertical: spacing.sm,
          }}
          {...props}
        />
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8}>
            <Typography variant="caption" color={colors.crypto}>
              {rightLabel}
            </Typography>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Typography variant="caption" color={colors.error}>
          {error}
        </Typography>
      ) : null}
    </View>
  )
}
