import { Router } from 'express';
import { authGuard, optionalAuth } from '../middleware/auth.js';
import { validateBodyJoi, validateQueryJoi } from '../middleware/validateRequest.js';
import {
  updateLocationSchemaJoi,
  locationBodySchemaJoi,
  updateProviderMeSchemaJoi,
  nearbyQuerySchemaJoi,
  updateAvailabilitySchemaJoi,
} from '../validation/joiSchemas.js';
import { findUserById } from '../store/authStore.js';
import { findNearby, getProvider, upsertProvider, type Role } from '../store/providerStore.js';
import { getRatingsByProvider, getAverageRating } from '../store/ratingStore.js';
import { locationLimiter } from '../middleware/rateLimit.js';
import { sanitizeUserInput } from '../lib/sanitize.js';

const router = Router();

function toProviderRole(r: string): Role {
  if (r === 'mechanic_tow' || r === 'car_rental') return r as Role;
  return 'mechanic';
}

router.get('/me', authGuard, (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const user = findUserById(payload.id);
  const provider = getProvider(payload.id);
  const role = toProviderRole(payload.role as string);
  const services = provider?.services ?? [];
  res.json({
    id: payload.id,
    name: user?.name ?? payload.email,
    role: payload.role,
    phone: provider?.phone ?? '',
    photo: provider?.photo ?? null,
    serviceType: provider?.serviceType ?? (role === 'mechanic_tow' ? 'tow' : role === 'car_rental' ? 'rental' : 'mechanic'),
    services,
    rating: provider?.rating ?? 0,
    reviews: 0,
    email: payload.email,
    isAvailable: provider?.isAvailable ?? true,
    location: provider?.location ?? null,
    verified: provider?.verified ?? true,
  });
});

router.patch('/me', authGuard, validateBodyJoi(updateProviderMeSchemaJoi), (req, res) => {
  const body = req.validated!.body as { name?: string; phone?: string; photo?: string | null; services?: string[] };
  const id = req.user!.id;
  const name = body.name != null ? sanitizeUserInput(body.name, 200) : undefined;
  const phone = body.phone != null ? sanitizeUserInput(String(body.phone), 50) : undefined;
  const services = Array.isArray(body.services) ? body.services.map((s) => sanitizeUserInput(String(s), 200)) : undefined;
  const provider = upsertProvider(id, {
    id,
    name: name ?? req.user!.email,
    role: toProviderRole(req.user!.role as string),
    phone: phone ?? undefined,
    photo: body.photo ?? undefined,
    location: undefined,
    services,
  });
  res.json(provider);
});

router.patch('/me/availability', authGuard, validateBodyJoi(updateAvailabilitySchemaJoi), (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { isAvailable } = req.validated!.body as { isAvailable: boolean };
  const id = payload.id;
  const existing = getProvider(id);
  const provider = upsertProvider(id, {
    id,
    name: existing?.name ?? payload.email,
    role: toProviderRole(payload.role as string),
    isAvailable,
  });
  res.json(provider);
});

router.get('/nearby', optionalAuth, validateQueryJoi(nearbyQuerySchemaJoi), (req, res) => {
  const q = req.validated!.query as { lat: number; lng: number; radius?: number; role?: Role; available?: string; verified?: string; page?: number; limit?: number };
  const lat = q.lat;
  const lng = q.lng;
  const radiusKm = q.radius ?? 50;
  const role = q.role;
  const availableOnly = q.available !== 'false';
  const verifiedOnly = q.verified !== 'false';
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const { items, total } = findNearby(lat, lng, {
    radiusKm,
    role,
    availableOnly,
    verifiedOnly,
    page,
    limit,
  });
  res.json({ items, total, page, limit });
});

router.get('/:id', authGuard, (req, res) => {
  const provider = getProvider(req.params.id);
  if (!provider) {
    res.status(404).json({ message: 'Provider not found' });
    return;
  }
  const { average, count } = getAverageRating(req.params.id);
  res.json({ ...provider, rating: average || provider.rating, reviewCount: count });
});

/** GET /providers/:id/ratings – list reviews for a provider */
router.get('/:id/ratings', authGuard, (req, res) => {
  const list = getRatingsByProvider(req.params.id);
  res.json({ items: list, total: list.length });
});

/** Update current provider location (lat/lng). Enables map visibility when available and verified. */
router.patch('/me/location', authGuard, locationLimiter, validateBodyJoi(updateLocationSchemaJoi), (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { latitude, longitude } = req.validated!.body as { latitude: number; longitude: number };
  const id = payload.id;
  const location = {
    latitude,
    longitude,
    lastUpdated: new Date().toISOString(),
  };
  const provider = upsertProvider(id, {
    id,
    name: payload.email,
    role: toProviderRole(payload.role as string),
    location,
    isAvailable: true,
  });
  res.json(provider);
});

/** POST /providers/location: same as PATCH /me/location, body { lat, lng } or { latitude, longitude } */
router.post('/location', authGuard, locationLimiter, validateBodyJoi(locationBodySchemaJoi), (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const body = req.validated!.body as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  const latitude = body.latitude ?? body.lat;
  const longitude = body.longitude ?? body.lng;
  const id = payload.id;
  const location = {
    latitude: latitude!,
    longitude: longitude!,
    lastUpdated: new Date().toISOString(),
  };
  const provider = upsertProvider(id, {
    id,
    name: payload.email,
    role: toProviderRole(payload.role as string),
    location,
    isAvailable: true,
  });
  res.json(provider);
});

export default router;
