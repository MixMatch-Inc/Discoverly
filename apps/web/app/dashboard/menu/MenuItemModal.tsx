'use client';

import { DIETARY_TAGS } from '@discoverly/shared';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ImageUploader } from '../../../components/ImageUploader';
import { TagMultiSelect } from '../../../components/TagMultiSelect';

const foodItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().max(300).optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().trim().min(1, 'Category is required').max(50),
  dietaryTags: z.array(z.string()).max(10).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
});

export interface FoodItemFormData {
  name: string;
  description: string;
  priceDollars: string;
  category: string;
  dietaryTags: string[];
  imageUrls: string[];
}

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietaryTags: string[];
  imageUrls: string[];
  isAvailable: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  editItem: FoodItem | null;
  token: string;
  categories: string[];
}

//const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const EMPTY_FORM: FoodItemFormData = {
  name: '',
  description: '',
  priceDollars: '',
  category: '',
  dietaryTags: [],
  imageUrls: [],
};

export function MenuItemModal({ open, onClose, onSave, editItem, token, categories }: Props) {
  const [form, setForm] = useState<FoodItemFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description ?? '',
        priceDollars: (editItem.price / 100).toFixed(2),
        category: editItem.category,
        dietaryTags: editItem.dietaryTags ?? [],
        imageUrls: editItem.imageUrls ?? [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [editItem, open]);

  if (!open) return null;

  function update<K extends keyof FoodItemFormData>(field: K, value: FoodItemFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const priceCents = Math.round(parseFloat(form.priceDollars) * 100);

    const result = foodItemSchema.safeParse({
      name: form.name,
      description: form.description || undefined,
      price: isNaN(priceCents) ? -1 : priceCents,
      category: form.category,
      dietaryTags: form.dietaryTags.length ? form.dietaryTags : undefined,
      imageUrls: form.imageUrls.length ? form.imageUrls : undefined,
    });

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
    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflow: 'auto', padding: '1.5rem',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>{editItem ? 'Edit Item' : 'Add Item'}</h2>

        {submitError && (
          <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{submitError}</p>
        )}

        <div className="field">
          <label>Name *</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} />
          {errors['name'] && <p className="field-error">{errors['name']}</p>}
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            maxLength={300}
            rows={2}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
          />
        </div>

        <div className="field">
          <label>Price ($) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.priceDollars}
            onChange={(e) => update('priceDollars', e.target.value)}
          />
          {errors['price'] && <p className="field-error">{errors['price']}</p>}
        </div>

        <div className="field">
          <label>Category *</label>
          <input
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          {errors['category'] && <p className="field-error">{errors['category']}</p>}
        </div>

        <TagMultiSelect
          options={[...DIETARY_TAGS]}
          selected={form.dietaryTags}
          onChange={(tags) => update('dietaryTags', tags)}
          max={10}
          label="Dietary Tags"
        />

        <div style={{ marginTop: '1rem' }}>
          <ImageUploader
            label="Image"
            value={form.imageUrls[0] ?? null}
            onUploaded={(url) => update('imageUrls', [...form.imageUrls, url].slice(0, 5))}
            token={token}
          />
          {form.imageUrls.length > 1 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {form.imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`Upload ${i + 1}`} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} disabled={submitting} style={{ background: '#e5e7eb', color: '#111' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editItem ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </div>
    </div>
  );
}
