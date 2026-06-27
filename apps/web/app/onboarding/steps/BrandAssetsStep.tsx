'use client';

import { ImageUploader } from '../../../components/ImageUploader';

export interface BrandAssets {
  logoUrl: string | null;
  coverImageUrl: string | null;
}

interface Props {
  data: BrandAssets;
  token: string;
  onChange: (data: BrandAssets) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BrandAssetsStep({ data, token, onChange, onNext, onBack }: Props) {
  const canProceed = data.logoUrl !== null;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Brand Assets</h2>

      <ImageUploader
        label="Logo"
        value={data.logoUrl}
        onUploaded={(url) => onChange({ ...data, logoUrl: url })}
        token={token}
        required
      />

      <ImageUploader
        label="Cover Image"
        value={data.coverImageUrl}
        onUploaded={(url) => onChange({ ...data, coverImageUrl: url })}
        token={token}
      />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={onBack} style={{ background: '#e5e7eb', color: '#111' }}>
          Back
        </button>
        <button type="button" onClick={onNext} disabled={!canProceed}>
          Next
        </button>
      </div>
    </div>
  );
}
