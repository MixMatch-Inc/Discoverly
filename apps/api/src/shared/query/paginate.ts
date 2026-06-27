import type { FilterQuery, Model, SortOrder } from 'mongoose';
import type { PaginatedResponse, PaginationParams } from './query.types.js';

interface PaginateOptions {
  sort?: Record<string, SortOrder>;
  scoreSort?: boolean;
}

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  params: PaginationParams,
  options: PaginateOptions = {},
): Promise<PaginatedResponse<T>> {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  let sort: Record<string, SortOrder | { $meta: string }> = options.sort ?? { createdAt: -1 };
  if (options.scoreSort) {
    sort = { score: { $meta: 'textScore' }, ...sort };
  }

  const [docs, total] = await Promise.all([
    model.find(filter, options.scoreSort ? { score: { $meta: 'textScore' } } : undefined)
      .sort(sort as Record<string, SortOrder>)
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: docs as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
