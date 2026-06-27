'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { MenuItemModal } from './MenuItemModal';
import { MenuItemTable } from './MenuItemTable';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

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

interface Restaurant {
  _id: string;
}

export default function MenuPage() {
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/restaurants/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const body = (await res.json()) as { data: Restaurant };
        setRestaurant(body.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const fetchItems = useCallback(async () => {
    if (!restaurant || !token) return;
    const res = await fetch(
      `${API_URL}/api/restaurants/${restaurant._id}/food-items?includeUnavailable=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      const body = (await res.json()) as { data: FoodItem[] };
      setItems(body.data);
    }
  }, [restaurant, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleSave(data: Record<string, unknown>) {
    if (!restaurant) return;

    const url = editItem
      ? `${API_URL}/api/restaurants/${restaurant._id}/food-items/${editItem._id}`
      : `${API_URL}/api/restaurants/${restaurant._id}/food-items`;

    const res = await fetch(url, {
      method: editItem ? 'PATCH' : 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? 'Save failed');
    }

    await fetchItems();
  }

  async function handleDelete(item: FoodItem) {
    if (!restaurant) return;
    const confirmed = window.confirm('Are you sure? This will hide the item from customers.');
    if (!confirmed) return;

    await fetch(`${API_URL}/api/restaurants/${restaurant._id}/food-items/${item._id}`, {
      method: 'DELETE',
      headers: headers(),
    });

    await fetchItems();
  }

  function handleToggled(itemId: string, isAvailable: boolean) {
    setItems((prev) => prev.map((i) => (i._id === itemId ? { ...i, isAvailable } : i)));
  }

  if (loading) return null;
  if (!restaurant) return <p style={{ color: '#6b7280' }}>No restaurant found. Complete onboarding first.</p>;

  const categories = [...new Set(items.map((i) => i.category))].sort();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.5rem' }}>Menu</h1>
          <span style={{ background: '#f3f4f6', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', color: '#6b7280' }}>
            {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          style={{ width: 'auto', padding: '0.5rem 1rem' }}
        >
          Add item
        </button>
      </div>

      <MenuItemTable
        items={items}
        restaurantId={restaurant._id}
        token={token!}
        onEdit={(item) => { setEditItem(item); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggled={handleToggled}
      />

      <MenuItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
        token={token!}
        categories={categories}
      />
    </div>
  );
}
