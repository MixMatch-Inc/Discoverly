interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: string[];
  imageUrls: string[];
}

const TAG_COLORS: Record<string, string> = {
  vegetarian: '#16a34a',
  vegan: '#15803d',
  'gluten-free': '#ca8a04',
  halal: '#2563eb',
  kosher: '#7c3aed',
  'dairy-free': '#0891b2',
  'nut-free': '#ea580c',
  'low-carb': '#dc2626',
};

export function FoodItemCard({ item }: { item: FoodItem }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      {item.imageUrls[0] ? (
        <img
          src={item.imageUrls[0]}
          alt={item.name}
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          No image
        </div>
      )}

      <div style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{item.name}</h3>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            ${(item.price / 100).toFixed(2)}
          </span>
        </div>

        {item.description && (
          <p style={{
            color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.5rem',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.description}
          </p>
        )}

        {item.dietaryTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                  color: '#fff',
                  background: TAG_COLORS[tag] ?? '#6b7280',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
