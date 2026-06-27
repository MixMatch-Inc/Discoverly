'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
  token: string;
  required?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export function ImageUploader({ label, value, onUploaded, token, required }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('image', file);

      const res = await fetch(`${API_URL}/api/uploads?folder=restaurants`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Upload failed');
      }

      const body = (await res.json()) as { data: { original: { url: string } } };
      onUploaded(body.data.original.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
        {label}{required && ' *'}
      </label>

      {value && (
        <img
          src={value}
          alt={label}
          style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
      >
        {uploading ? 'Uploading...' : value ? 'Replace' : 'Choose file'}
      </button>

      {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
