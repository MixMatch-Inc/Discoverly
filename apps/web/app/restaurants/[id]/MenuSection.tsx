import { FoodItemCard } from './FoodItemCard';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: string[];
  imageUrls: string[];
}

interface Props {
  category: string;
  items: FoodItem[];
}

export function MenuSection({ category, items }: Props) {
  return (
    <section id={`category-${category}`} style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'capitalize' }}>
        {category}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
      }}>
        {items.map((item) => (
          <FoodItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
