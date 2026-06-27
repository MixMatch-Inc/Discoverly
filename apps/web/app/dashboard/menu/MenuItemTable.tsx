'use client';

import { AvailabilityToggle } from './AvailabilityToggle';

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
  items: FoodItem[];
  restaurantId: string;
  token: string;
  onEdit: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
  onToggled: (itemId: string, isAvailable: boolean) => void;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function MenuItemTable({ items, restaurantId, token, onEdit, onDelete, onToggled }: Props) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No items yet</p>
        <p>Add your first item to get started.</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}></th>
            <th style={{ padding: '0.5rem' }}>Name</th>
            <th style={{ padding: '0.5rem' }}>Category</th>
            <th style={{ padding: '0.5rem' }}>Price</th>
            <th style={{ padding: '0.5rem' }}>Available</th>
            <th style={{ padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6', opacity: item.isAvailable ? 1 : 0.5 }}>
              <td style={{ padding: '0.5rem' }}>
                {item.imageUrls[0] ? (
                  <img src={item.imageUrls[0]} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '4px' }} />
                )}
              </td>
              <td style={{ padding: '0.5rem', fontWeight: 500 }}>{item.name}</td>
              <td style={{ padding: '0.5rem', color: '#6b7280' }}>{item.category}</td>
              <td style={{ padding: '0.5rem' }}>{formatPrice(item.price)}</td>
              <td style={{ padding: '0.5rem' }}>
                <AvailabilityToggle
                  itemId={item._id}
                  restaurantId={restaurantId}
                  isAvailable={item.isAvailable}
                  token={token}
                  onToggled={onToggled}
                />
              </td>
              <td style={{ padding: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.5rem', width: 'auto', padding: '0.25rem' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', width: 'auto', padding: '0.25rem' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
