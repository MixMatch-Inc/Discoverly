import type { ReactNode } from "react"
import { Text, type TextStyle } from "react-native"
import { colors, typography } from "../theme/tokens"

type Variant = keyof typeof typography

type TypographyProps = {
  children: ReactNode
  variant?: Variant
  color?: string
  style?: TextStyle
}

export function Typography({ children, variant = "body", color = colors.text, style }: TypographyProps) {
  return <Text style={[typography[variant], { color }, style]}>{children}</Text>
}
