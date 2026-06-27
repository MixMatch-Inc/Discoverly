import type { FilterQuery } from 'mongoose';

const DEFAULT_RADIUS = 10_000;
const MAX_RADIUS = 50_000;

interface GeoParams {
  lat?: number;
  lng?: number;
  radius?: number;
}

export function applyGeoFilter<T>(filter: FilterQuery<T>, params: GeoParams): FilterQuery<T> {
  if (params.lat == null || params.lng == null) return filter;

  const radius = Math.min(Math.max(params.radius ?? DEFAULT_RADIUS, 1), MAX_RADIUS);

  return {
    ...filter,
    'address.location': {
      $near: {
        $geometry: { type: 'Point', coordinates: [params.lng, params.lat] },
        $maxDistance: radius,
      },
    },
  };
}
