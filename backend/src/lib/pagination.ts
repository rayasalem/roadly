/**
 * Pagination helper: normalizes page/limit and slices array with total count.
 * Use for list endpoints until DB-backed pagination (skip/take) is in place.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function normalizePagination(query: PaginationParams): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Math.floor(Number(query.page)) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(query.limit)) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginate<T>(items: T[], page: number, limit: number): { items: T[]; total: number; page: number; limit: number } {
  const total = items.length;
  const skip = (page - 1) * limit;
  const sliced = items.slice(skip, skip + limit);
  return { items: sliced, total, page, limit };
}
