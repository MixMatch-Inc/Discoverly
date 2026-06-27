import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MenuSection } from './MenuSection';
import { RestaurantHero } from './RestaurantHero';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineTags: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
}

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietaryTags: string[];
  imageUrls: string[];
}

async function fetchRestaurant(id: string): Promise<Restaurant | null> {
  const res = await fetch(`${API_URL}/api/restaurants/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const body = (await res.json()) as { data: Restaurant };
  return body.data;
}

async function fetchFoodItems(restaurantId: string): Promise<FoodItem[]> {
  const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/food-items`, { cache: 'no-store' });
  if (!res.ok) return [];
  const body = (await res.json()) as { data: FoodItem[] };
  return body.data;
}

function groupByCategory(items: FoodItem[]): { category: string; items: FoodItem[] }[] {
  const map = new Map<string, FoodItem[]>();
  for (const item of items) {
    const existing = map.get(item.category) ?? [];
    existing.push(item);
    map.set(item.category, existing);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await fetchRestaurant(id);
  if (!restaurant) return { title: 'Not Found' };
  return {
    title: `${restaurant.name} — Discoverly`,
    description: restaurant.description || `Explore ${restaurant.name} on Discoverly`,
  };
}

export default async function RestaurantProfilePage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await fetchRestaurant(id);
  if (!restaurant) notFound();

  const items = await fetchFoodItems(restaurant._id);
  const grouped = groupByCategory(items);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <RestaurantHero restaurant={restaurant} />

      {grouped.length > 1 && (
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {grouped.map(({ category }) => (
            <a
              key={category}
              href={`#category-${category}`}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '999px', background: '#f3f4f6',
                color: '#374151', fontSize: '0.85rem', textDecoration: 'none', textTransform: 'capitalize',
              }}
            >
              {category}
            </a>
          ))}
        </nav>
      )}

      {grouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Menu coming soon</p>
        </div>
      ) : (
        grouped.map(({ category, items }) => (
          <MenuSection key={category} category={category} items={items} />
        ))
      )}
    </div>
  );
}
