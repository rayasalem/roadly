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
import { findNearby, getProvider, upsertProvider, type Provider, type Role } from '../store/providerStore.js';

/** Mock providers with locations near (lat, lng) when DB is unavailable so the map shows markers. */
function mockNearbyProviders(lat: number, lng: number, role?: Role): Provider[] {
  const now = new Date().toISOString();
  const base: Provider[] = [
    { id: 'mock_1', name: 'ميكانيكي تجريبي ١', phone: '', photo: null, role: 'mechanic', serviceType: 'mechanic', location: { latitude: lat + 0.004, longitude: lng + 0.002, lastUpdated: now }, isAvailable: true, rating: 4.5, verified: true, services: ['بطارية', 'إطارات'] },
    { id: 'mock_2', name: 'ميكانيكي تجريبي ٢', phone: '', photo: null, role: 'mechanic', serviceType: 'mechanic', location: { latitude: lat - 0.003, longitude: lng + 0.005, lastUpdated: now }, isAvailable: true, rating: 4.2, verified: true, services: ['زيت', 'فرامل'] },
    { id: 'mock_3', name: 'سائق سحب تجريبي', phone: '', photo: null, role: 'mechanic_tow', serviceType: 'tow', location: { latitude: lat + 0.006, longitude: lng - 0.004, lastUpdated: now }, isAvailable: true, rating: 4.8, verified: true, services: ['سحب'] },
    { id: 'mock_4', name: 'تأجير سيارات تجريبي', phone: '', photo: null, role: 'car_rental', serviceType: 'rental', location: { latitude: lat - 0.005, longitude: lng - 0.003, lastUpdated: now }, isAvailable: true, rating: 4.0, verified: true, services: ['تأجير'] },
    { id: 'mock_5', name: 'ورشة تجريبية', phone: '', photo: null, role: 'mechanic', serviceType: 'mechanic', location: { latitude: lat + 0.002, longitude: lng - 0.006, lastUpdated: now }, isAvailable: true, rating: 4.6, verified: true, services: [] },
  ];
  if (role === 'mechanic_tow') return base.filter((p) => p.role === 'mechanic_tow');
  if (role === 'car_rental') return base.filter((p) => p.role === 'car_rental');
  if (role === 'mechanic') return base.filter((p) => p.role === 'mechanic');
  return base;
}
import { getRatingsByProvider, getAverageRating } from '../store/ratingStore.js';
import { locationLimiter } from '../middleware/rateLimit.js';
import { sanitizeUserInput } from '../lib/sanitize.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

function toProviderRole(r: string): Role {
  if (r === 'mechanic_tow' || r === 'car_rental') return r as Role;
  return 'mechanic';
}

router.get('/me', authGuard, asyncHandler(async (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  let user: Awaited<ReturnType<typeof findUserById>>;
  let provider: Awaited<ReturnType<typeof getProvider>>;
  try {
    [user, provider] = await Promise.all([findUserById(payload.id), getProvider(payload.id)]);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[providers/me] DB failed:', e instanceof Error ? e.message : e);
    }
    const role = toProviderRole(payload.role as string);
    res.json({
      id: payload.id,
      name: payload.email ?? 'Provider',
      role: payload.role,
      phone: '',
      photo: null,
      serviceType: role === 'mechanic_tow' ? 'tow' : role === 'car_rental' ? 'rental' : 'mechanic',
      services: [],
      rating: 0,
      reviews: 0,
      email: payload.email,
      isAvailable: true,
      location: { latitude: 0, longitude: 0, lastUpdated: new Date().toISOString() },
      verified: true,
    });
    return;
  }
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
}));

router.patch('/me', authGuard, validateBodyJoi(updateProviderMeSchemaJoi), asyncHandler(async (req, res) => {
  const body = req.validated!.body as { name?: string; phone?: string; photo?: string | null; services?: string[] };
  const id = req.user!.id;
  const name = body.name != null ? sanitizeUserInput(body.name, 200) : undefined;
  const phone = body.phone != null ? sanitizeUserInput(String(body.phone), 50) : undefined;
  const services = Array.isArray(body.services) ? body.services.map((s) => sanitizeUserInput(String(s), 200)) : undefined;
  const provider = await upsertProvider(id, {
    id,
    name: name ?? req.user!.email,
    role: toProviderRole(req.user!.role as string),
    phone: phone ?? undefined,
    photo: body.photo ?? undefined,
    location: undefined,
    services,
  });
  res.json(provider);
}));

router.patch('/me/availability', authGuard, validateBodyJoi(updateAvailabilitySchemaJoi), asyncHandler(async (req, res) => {
  const payload = req.user;
  if (!payload || typeof payload.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { isAvailable } = req.validated!.body as { isAvailable: boolean };
  const id = payload.id;
  const existing = await getProvider(id);
  const provider = await upsertProvider(id, {
    id,
    name: existing?.name ?? payload.email,
    role: toProviderRole(payload.role as string),
    isAvailable,
  });
  res.json(provider);
}));

router.get('/me/ratings', authGuard, asyncHandler(async (req, res) => {
  const providerId = req.user!.id;
  const list = await getRatingsByProvider(providerId);
  const { average } = await getAverageRating(providerId);
  res.json({ items: list, total: list.length, averageRating: average });
}));

router.get('/nearby', optionalAuth, validateQueryJoi(nearbyQuerySchemaJoi), asyncHandler(async (req, res) => {
  const q = req.validated!.query as { lat: number; lng: number; radius?: number; role?: Role; available?: string; verified?: string; page?: number; limit?: number };
  const lat = q.lat;
  const lng = q.lng;
  const radiusKm = q.radius ?? 50;
  const role = q.role;
  const availableOnly = q.available !== 'false';
  const verifiedOnly = q.verified !== 'false';
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  let items: Provider[];
  let total: number;
  try {
    const result = await findNearby(lat, lng, {
      radiusKm,
      role,
      availableOnly,
      verifiedOnly,
      page,
      limit,
    });
    items = result.items;
    total = result.total;
  } catch (err) {
    // DB not connected or migrations not run: return mock providers so map shows markers
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[providers/nearby] findNearby failed (is DB running?):', err instanceof Error ? err.message : err);
    }
    const mock = mockNearbyProviders(lat, lng, role);
    const start = (page - 1) * limit;
    items = mock.slice(start, start + limit);
    total = mock.length;
  }
  res.json({ items, total, page, limit });
}));

router.get('/:id', authGuard, asyncHandler(async (req, res) => {
  const provider = await getProvider(req.params.id);
  if (!provider) {
    res.status(404).json({ message: 'Provider not found' });
    return;
  }
  const { average, count } = await getAverageRating(req.params.id);
  res.json({ ...provider, rating: average || provider.rating, reviewCount: count });
}));

router.get('/:id/ratings', authGuard, asyncHandler(async (req, res) => {
  const list = await getRatingsByProvider(req.params.id);
  res.json({ items: list, total: list.length });
}));

router.patch('/me/location', authGuard, locationLimiter, validateBodyJoi(updateLocationSchemaJoi), asyncHandler(async (req, res) => {
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
  const provider = await upsertProvider(id, {
    id,
    name: payload.email,
    role: toProviderRole(payload.role as string),
    location,
    isAvailable: true,
  });
  res.json(provider);
}));

router.post('/location', authGuard, locationLimiter, validateBodyJoi(locationBodySchemaJoi), asyncHandler(async (req, res) => {
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
  const provider = await upsertProvider(id, {
    id,
    name: payload.email,
    role: toProviderRole(payload.role as string),
    location,
    isAvailable: true,
  });
  res.json(provider);
}));

export default router;
