import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useRouter } from "expo-router"
import { Controller, useForm } from "react-hook-form"
import { View } from "react-native"
import { Button, Input, Typography } from "../../src/components"
import { useAuthStore } from "../../src/store/useAuthStore"
import { colors, spacing } from "../../src/theme/tokens"
import { type LoginFormValues, loginSchema } from "../../src/validation/auth"

export default function LoginScreen() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async ({ email }: LoginFormValues) => {
    const token = `session_${email.toLowerCase()}`
    await login({
      token,
      user: {
        id: "660000000000000000000001",
        email,
        role: "user",
      },
    })
    router.replace("/(tabs)/discover")
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.background,
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <Typography variant="h1">Welcome Back</Typography>
      <Typography variant="body" color={colors.muted}>
        Sign in to continue matching with dishes around you.
      </Typography>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email Address"
            placeholder="hello@discoverly.app"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Button label="Sign In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Link href="/(auth)/register">Go To Register</Link>
    </View>
  )
}
