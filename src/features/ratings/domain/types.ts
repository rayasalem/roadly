/**
 * Rating dimensions: overall, speed, quality, professionalism.
 */

export interface RatingDimensions {
  overall: number;
  speed: number;
  quality: number;
  professionalism: number;
}

export interface RequestRating {
  id: string;
  requestId: string;
  providerId: string;
  customerId: string;
  customerName?: string | null;
  /** 1-5 */
  rating: number;
  ratingSpeed?: number | null;
  ratingQuality?: number | null;
  ratingProfessionalism?: number | null;
  comment: string | null;
  createdAt: string;
  serviceType?: string | null;
}

export type RatingDimensionKey = 'overall' | 'speed' | 'quality' | 'professionalism';
