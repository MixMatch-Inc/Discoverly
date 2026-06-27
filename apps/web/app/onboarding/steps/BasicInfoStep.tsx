'use client';

import { useState } from 'react';
import { z } from 'zod';

const basicInfoSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
  city: z.string().trim().min(1, 'City is required'),
  country: z.string().trim().min(1, 'Country is required'),
});

export interface BasicInfo {
  name: string;
  description: string;
  city: string;
  country: string;
}

interface Props {
  data: BasicInfo;
  onNext: (data: BasicInfo) => void;
}

export function BasicInfoStep({ data, onNext }: Props) {
  const [form, setForm] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNext() {
    const result = basicInfoSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onNext(result.data as BasicInfo);
  }

  function update(field: keyof BasicInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Basic Information</h2>

      <div className="field">
        <label>Restaurant Name *</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
        {errors['name'] && <p className="field-error">{errors['name']}</p>}
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={500}
          rows={3}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
        />
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right' }}>
          {form.description.length}/500
        </span>
        {errors['description'] && <p className="field-error">{errors['description']}</p>}
      </div>

      <div className="field">
        <label>City *</label>
        <input value={form.city} onChange={(e) => update('city', e.target.value)} />
        {errors['city'] && <p className="field-error">{errors['city']}</p>}
      </div>

      <div className="field">
        <label>Country *</label>
        <input value={form.country} onChange={(e) => update('country', e.target.value)} />
        {errors['country'] && <p className="field-error">{errors['country']}</p>}
      </div>

      <button type="button" onClick={handleNext}>Next</button>
    </div>
  );
}
