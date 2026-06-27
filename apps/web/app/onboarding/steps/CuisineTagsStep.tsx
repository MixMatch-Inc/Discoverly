'use client';

import { CUISINE_TAGS, type CuisineTag } from '@discoverly/shared';
import { TagMultiSelect } from '../../../components/TagMultiSelect';

interface Props {
  selected: CuisineTag[];
  onChange: (tags: CuisineTag[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CuisineTagsStep({ selected, onChange, onNext, onBack }: Props) {
  const canProceed = selected.length >= 1;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Cuisine Tags</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Choose 1–5 tags that best describe your restaurant.
      </p>

      <TagMultiSelect
        options={CUISINE_TAGS}
        selected={selected}
        onChange={(tags) => onChange(tags as CuisineTag[])}
        max={5}
        label="Cuisine"
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
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
