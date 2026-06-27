interface Restaurant {
  name: string;
  description: string;
  cuisineTags: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
}

export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {restaurant.coverImageUrl ? (
        <img
          src={restaurant.coverImageUrl}
          alt={`${restaurant.name} cover`}
          style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '8px' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '240px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '-40px', paddingLeft: '1.5rem', gap: '1rem' }}>
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt={`${restaurant.name} logo`}
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', background: '#fff' }}
          />
        ) : (
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #fff',
            background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#6b7280',
          }}>
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ paddingBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{restaurant.name}</h1>
        </div>
      </div>

      {restaurant.cuisineTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '1rem', paddingLeft: '1.5rem' }}>
          {restaurant.cuisineTags.map((tag) => (
            <span key={tag} style={{ background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', color: '#374151' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {restaurant.description && (
        <p style={{ color: '#6b7280', marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          {restaurant.description}
        </p>
      )}
    </div>
  );
}
