import { prisma } from '../lib/prisma.js';

export interface Rating {
  id: string;
  providerId: string;
  customerId: string;
  requestId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export async function addRating(
  providerId: string,
  customerId: string,
  requestId: string,
  rating: number,
  comment?: string | null
): Promise<Rating> {
  const value = Math.min(5, Math.max(1, Math.round(rating)));
  const r = await prisma.rating.create({
    data: {
      providerId,
      customerId,
      requestId,
      rating: value,
      comment: comment ?? null,
    },
  });
  return {
    id: r.id,
    providerId: r.providerId,
    customerId: r.customerId,
    requestId: r.requestId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getRatingsByProvider(providerId: string): Promise<Rating[]> {
  const list = await prisma.rating.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((r) => ({
    id: r.id,
    providerId: r.providerId,
    customerId: r.customerId,
    requestId: r.requestId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getAverageRating(
  providerId: string
): Promise<{ average: number; count: number }> {
  const list = await prisma.rating.findMany({
    where: { providerId },
    select: { rating: true },
  });
  if (list.length === 0) return { average: 0, count: 0 };
  const sum = list.reduce((a, r) => a + r.rating, 0);
  return { average: sum / list.length, count: list.length };
}

export async function hasRatedRequest(
  customerId: string,
  requestId: string
): Promise<boolean> {
  const r = await prisma.rating.findFirst({
    where: { customerId, requestId },
  });
  return r != null;
}
