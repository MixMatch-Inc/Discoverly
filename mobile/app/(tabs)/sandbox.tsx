import { ScrollView, View } from "react-native"
import { Button, Card, Input, Typography } from "../../src/components"
import { colors, spacing } from "../../src/theme/tokens"

export default function SandboxScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        backgroundColor: colors.background,
        gap: spacing.lg,
      }}
    >
      <Typography variant="h1">Component Sandbox</Typography>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="h2">Typography</Typography>
          <Typography variant="h1">H1 Discoverly</Typography>
          <Typography variant="h2">H2 Taste the Match</Typography>
          <Typography variant="h3">H3 Fresh picks nearby</Typography>
          <Typography variant="body">Body copy for content and supporting descriptions.</Typography>
          <Typography variant="caption" color={colors.muted}>
            Caption and helper content
          </Typography>
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="h2">Buttons</Typography>
          <Button label="Primary Button" />
          <Button label="Secondary Button" variant="secondary" />
          <Button label="Outlined Button" variant="outlined" />
          <Button label="Loading Button" loading />
          <Button label="Disabled Button" disabled />
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="h2">Inputs</Typography>
          <Input label="Empty Input" placeholder="Enter email" />
          <Input label="Focused Input" placeholder="Focused state" forceFocused />
          <Input label="Filled Input" value="hello@discoverly.app" editable={false} />
          <Input label="Error Input" placeholder="name@domain.com" error="Invalid email address" />
        </View>
      </Card>
    </ScrollView>
  )
}
