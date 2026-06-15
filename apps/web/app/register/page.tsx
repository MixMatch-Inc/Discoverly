'use client';

import { useRouter } from 'next/navigation';
import { registerSchema } from '@discoverly/shared';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <AuthForm
      title="Create account"
      submitLabel="Create account"
      schema={registerSchema}
      onSubmit={async (input) => {
        await register(input);
        router.push('/');
      }}
    />
  );
}
