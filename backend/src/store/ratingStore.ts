/**
 * Rating and review system for providers.
 * Stores ratings per request (customer rates provider after service).
 */
export interface Rating {
  id: string;
  providerId: string;
  customerId: string;
  requestId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
}

const ratings = new Map<string, Rating>();
let idCounter = 1;
const nextId = () => `rating_${idCounter++}`;

export function addRating(
  providerId: string,
  customerId: string,
  requestId: string,
  rating: number,
  comment?: string | null
): Rating {
  const id = nextId();
  const r: Rating = {
    id,
    providerId,
    customerId,
    requestId,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment: comment ?? null,
    createdAt: new Date().toISOString(),
  };
  ratings.set(id, r);
  return r;
}

export function getRatingsByProvider(providerId: string): Rating[] {
  return Array.from(ratings.values()).filter((r) => r.providerId === providerId);
}

export function getAverageRating(providerId: string): { average: number; count: number } {
  const list = getRatingsByProvider(providerId);
  if (list.length === 0) return { average: 0, count: 0 };
  const sum = list.reduce((a, r) => a + r.rating, 0);
  return { average: sum / list.length, count: list.length };
}

export function hasRatedRequest(customerId: string, requestId: string): boolean {
  return Array.from(ratings.values()).some(
    (r) => r.customerId === customerId && r.requestId === requestId
  );
}
