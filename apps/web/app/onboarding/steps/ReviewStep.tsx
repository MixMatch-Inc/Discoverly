'use client';

import type { CuisineTag } from '@discoverly/shared';
import type { BasicInfo } from './BasicInfoStep';
import type { BrandAssets } from './BrandAssetsStep';

interface Props {
  basicInfo: BasicInfo;
  assets: BrandAssets;
  cuisineTags: CuisineTag[];
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
}

export function ReviewStep({ basicInfo, assets, cuisineTags, onSubmit, onBack, submitting, error }: Props) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Review & Launch</h2>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Restaurant</h3>
        <p style={{ fontWeight: 600 }}>{basicInfo.name}</p>
        {basicInfo.description && <p style={{ color: '#374151', fontSize: '0.9rem' }}>{basicInfo.description}</p>}
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{basicInfo.city}, {basicInfo.country}</p>
      </div>

      {assets.logoUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Logo</h3>
          <img src={assets.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
        </div>
      )}

      {assets.coverImageUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Cover</h3>
          <img src={assets.coverImageUrl} alt="Cover" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px' }} />
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Cuisine Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {cuisineTags.map((tag) => (
            <span key={tag} style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={onBack} disabled={submitting} style={{ background: '#e5e7eb', color: '#111' }}>
          Back
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Launching...' : 'Launch my restaurant'}
        </button>
      </div>
    </div>
  );
}
