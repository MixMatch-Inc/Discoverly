'use client';

import { useState } from 'react';

interface Props {
  itemId: string;
  restaurantId: string;
  isAvailable: boolean;
  token: string;
  onToggled: (itemId: string, isAvailable: boolean) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export function AvailabilityToggle({ itemId, restaurantId, isAvailable, token, onToggled }: Props) {
  const [optimistic, setOptimistic] = useState(isAvailable);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !optimistic;
    setOptimistic(next);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/food-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: next }),
      });

      if (!res.ok) {
        setOptimistic(!next);
        return;
      }

      onToggled(itemId, next);
    } catch {
      setOptimistic(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={optimistic}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        background: optimistic ? '#10b981' : '#d1d5db',
        position: 'relative',
        cursor: loading ? 'wait' : 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: optimistic ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}
