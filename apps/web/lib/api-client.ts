import type { AuthResponse, LoginInput, RegisterInput } from '@discoverly/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message);
  }

  return data as TResponse;
}

export const authApi = {
  register(input: RegisterInput): Promise<AuthResponse> {
    return postJson<AuthResponse>('/auth/register', input);
  },

  login(input: LoginInput): Promise<AuthResponse> {
    return postJson<AuthResponse>('/auth/login', input);
  },
};
