'use client';

import { useRouter } from 'next/navigation';
import { loginSchema } from '@discoverly/shared';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      schema={loginSchema}
      onSubmit={async (input) => {
        await login(input);
        router.push('/');
      }}
    />
  );
}
