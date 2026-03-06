import { useState } from "react"
import { TextInput, View, type TextInputProps, type ViewStyle } from "react-native"
import { colors, radius, spacing } from "../theme/tokens"
import { Typography } from "./Typography"

type InputProps = TextInputProps & {
  label?: string
  error?: string
  forceFocused?: boolean
  containerStyle?: ViewStyle
}

export function Input({ label, error, forceFocused = false, containerStyle, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const focused = forceFocused || isFocused

  return (
    <View style={[{ width: "100%", gap: spacing.xs }, containerStyle]}>
      {label ? <Typography variant="caption">{label}</Typography> : null}
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
          minHeight: 52,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: error ? colors.error : focused ? colors.crypto : colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
        {...props}
      />
      {error ? (
        <Typography variant="caption" color={colors.error}>
          {error}
        </Typography>
      ) : null}
    </View>
  )
}
