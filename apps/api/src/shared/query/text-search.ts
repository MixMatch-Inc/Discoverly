import type { FilterQuery } from 'mongoose';

export function applyTextSearch<T>(filter: FilterQuery<T>, query?: string): { filter: FilterQuery<T>; scoreSort: boolean } {
  if (!query || !query.trim()) {
    return { filter, scoreSort: false };
  }
  return {
    filter: { ...filter, $text: { $search: query.trim() } },
    scoreSort: true,
  };
}
