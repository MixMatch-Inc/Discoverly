'use client';

import type { CuisineTag } from '@discoverly/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StepIndicator } from '../../components/StepIndicator';
import { useAuth } from '../../lib/auth-context';
import { BasicInfoStep, type BasicInfo } from './steps/BasicInfoStep';
import { BrandAssetsStep, type BrandAssets } from './steps/BrandAssetsStep';
import { CuisineTagsStep } from './steps/CuisineTagsStep';
import { ReviewStep } from './steps/ReviewStep';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const STEP_LABELS = ['Basic Info', 'Brand', 'Cuisine', 'Review'];

type Step = 0 | 1 | 2 | 3;

export default function OnboardingPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    description: '',
    city: '',
    country: '',
  });

  const [assets, setAssets] = useState<BrandAssets>({
    logoUrl: null,
    coverImageUrl: null,
  });

  const [cuisineTags, setCuisineTags] = useState<CuisineTag[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !token) return null;

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_URL}/api/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: basicInfo.name,
          description: basicInfo.description || undefined,
          address: { city: basicInfo.city, country: basicInfo.country },
          cuisineTags,
          logoUrl: assets.logoUrl,
          coverImageUrl: assets.coverImageUrl,
        }),
      });

      if (res.status === 409) {
        router.replace('/dashboard');
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? 'Something went wrong');
      }

      router.replace('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '0 1rem' }}>
      <StepIndicator steps={STEP_LABELS} current={step} />

      {step === 0 && (
        <BasicInfoStep
          data={basicInfo}
          onNext={(data) => {
            setBasicInfo(data);
            setStep(1);
          }}
        />
      )}

      {step === 1 && (
        <BrandAssetsStep
          data={assets}
          token={token}
          onChange={setAssets}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <CuisineTagsStep
          selected={cuisineTags}
          onChange={setCuisineTags}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <ReviewStep
          basicInfo={basicInfo}
          assets={assets}
          cuisineTags={cuisineTags}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          submitting={submitting}
          error={submitError}
        />
      )}
    </div>
  );
}
