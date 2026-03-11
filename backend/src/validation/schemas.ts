/**
 * Zod schemas for API request validation.
 * Use with validateRequest middleware to return 400/422 and consistent error messages.
 */
import { z } from 'zod';

const roleEnum = z.enum(['user', 'mechanic', 'mechanic_tow', 'car_rental', 'admin']);
const serviceTypeEnum = z.enum(['mechanic', 'tow', 'rental', 'battery', 'tire', 'oil_change']);
const requestStatusEnum = z.enum(['pending', 'accepted', 'on_the_way', 'completed', 'cancelled']);

const coordSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** POST /auth/register */
export const registerSchema = z.object({
  name: z.string().min(1, 'Name required').max(200).trim(),
  email: z.string().email('Invalid email').max(320),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: roleEnum.optional().default('user'),
});

/** POST /auth/login */
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

/** POST /auth/refresh */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

/** POST /requests – create service request */
export const createRequestSchema = z.object({
  serviceType: serviceTypeEnum,
  origin: coordSchema,
  destination: coordSchema.optional().nullable(),
  providerId: z.string().min(1).optional().nullable(),
});

/** PATCH /requests/:id/status */
export const updateRequestStatusSchema = z.object({
  status: requestStatusEnum,
});

/** POST /requests/:id/rate */
export const rateRequestSchema = z.object({
  rating: z.number().min(1).max(5).int(),
  comment: z.string().max(500).optional().nullable(),
});

/** PATCH /providers/me/location */
export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type RateRequestInput = z.infer<typeof rateRequestSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
