import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useRouter } from "expo-router"
import { Controller, useForm } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { Button, Input, Typography } from "../../src/components"
import { useAuthStore } from "../../src/store/useAuthStore"
import { colors, spacing } from "../../src/theme/tokens"
import { type RegisterFormValues, registerSchema } from "../../src/validation/auth"

export default function RegisterScreen() {
  const router = useRouter()
  const setToken = useAuthStore((state) => state.setToken)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async ({ email }: RegisterFormValues) => {
    const token = `session_${email.toLowerCase()}`
    setToken(token)
    router.replace("/(tabs)/discover")
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: colors.background,
        gap: spacing.md,
        padding: spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Typography variant="h1">Create Account</Typography>
      <Typography variant="body" color={colors.muted}>
        Create your account to start discovering meals instantly.
      </Typography>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Full Name"
            placeholder="Alex Carter"
            autoCapitalize="words"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.fullName?.message}
          />
        )}
      />
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
            placeholder="Minimum 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <Button label="Sign Up" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Link href="/(auth)/login">Back To Login</Link>
    </ScrollView>
  )
}
