import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { validateBodyJoi, validateParamsJoi } from '../middleware/validateRequest.js';
import { createRequestSchemaJoi, updateRequestStatusSchemaJoi, rateRequestSchemaJoi, idParamSchemaJoi } from '../validation/joiSchemas.js';
import { sanitizeUserInput } from '../lib/sanitize.js';
import { normalizePagination, paginate } from '../lib/pagination.js';
import {
  createRequest,
  getRequestById,
  updateRequestStatus,
  listRequestsByProvider,
  listRequestsByCustomer,
  computeEtaMinutes,
} from '../store/requestStore.js';
import type { RequestStatus } from '../store/requestStore.js';
import { getProvider } from '../store/providerStore.js';
import { createNotification } from '../store/notificationStore.js';
import { addRating, hasRatedRequest } from '../store/ratingStore.js';
import type { ServiceRequest } from '../store/requestStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/** In-memory store for synthetic requests (offline_*) so GET /requests/:id can return them when DB is down. */
const offlineRequests = new Map<string, ServiceRequest & { providerName?: string; providerLocation?: { latitude: number; longitude: number } }>();

/** Enrich request with provider name and location for customer-facing responses. */
async function enrichRequestWithProvider(req: ServiceRequest): Promise<ServiceRequest & { providerName?: string; providerLocation?: { latitude: number; longitude: number } }> {
  if (!req.providerId) return req;
  const provider = await getProvider(req.providerId);
  if (!provider) return req;
  return {
    ...req,
    providerName: provider.name,
    providerLocation: provider.location ? { latitude: provider.location.latitude, longitude: provider.location.longitude } : undefined,
  };
}

const router = Router();
router.use(authGuard);

router.post('/', validateBodyJoi(createRequestSchemaJoi), asyncHandler(async (req, res) => {
  const { serviceType, origin, destination, providerId, description } = req.validated!.body as {
    serviceType: string;
    origin: { latitude: number; longitude: number };
    destination?: { latitude: number; longitude: number } | null;
    providerId?: string | null;
    description?: string | null;
  };
  const userId = req.user!.id;
  try {
    const reqEntity = await createRequest(
      userId,
      serviceType as Parameters<typeof createRequest>[1],
      origin,
      destination ?? undefined,
      providerId ?? undefined,
      description ?? undefined
    );
    const enriched = await enrichRequestWithProvider(reqEntity);
    res.status(201).json(enriched);
    return;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[requests] createRequest failed (is DB running?):', e instanceof Error ? e.message : e);
    }
    const now = new Date().toISOString();
    const synthetic: ServiceRequest & { providerName?: string; providerLocation?: { latitude: number; longitude: number } } = {
      id: `offline_${Date.now()}`,
      customerId: userId,
      providerId: providerId ?? null,
      serviceType: serviceType as ServiceRequest['serviceType'],
      status: 'pending',
      origin,
      destination: destination ?? undefined,
      description: description ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
    offlineRequests.set(synthetic.id, synthetic);
    res.status(201).json(synthetic);
  }
}));

router.get('/provider', asyncHandler(async (req, res) => {
  const providerId = req.user!.id;
  const list = await listRequestsByProvider(providerId);
  const enriched = await Promise.all(list.map(enrichRequestWithProvider));
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(enriched, page, limit);
  res.json(result);
}));

router.get('/customer', asyncHandler(async (req, res) => {
  const customerId = req.user!.id;
  const list = await listRequestsByCustomer(customerId);
  const enriched = await Promise.all(list.map(enrichRequestWithProvider));
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(enriched, page, limit);
  res.json(result);
}));

router.get('/:id', validateParamsJoi(idParamSchemaJoi), asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const userId = req.user!.id;
  if (id.startsWith('offline_')) {
    const cached = offlineRequests.get(id);
    if (cached && cached.customerId === userId) {
      res.json(cached);
      return;
    }
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  let reqEntity: ServiceRequest | undefined;
  try {
    reqEntity = await getRequestById(id);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[requests] getRequestById failed:', e instanceof Error ? e.message : e);
    }
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  if (!reqEntity) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  const isOwner = reqEntity.customerId === userId || reqEntity.providerId === userId;
  const isProviderViewingPending =
    reqEntity.status === 'pending' &&
    reqEntity.providerId == null &&
    ['mechanic', 'mechanic_tow', 'car_rental'].includes((req.user!.role as string) ?? '');
  if (!isOwner && !isProviderViewingPending) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  const enriched = await enrichRequestWithProvider(reqEntity);
  res.json(enriched);
}));

router.patch('/:id/status', validateParamsJoi(idParamSchemaJoi), validateBodyJoi(updateRequestStatusSchemaJoi), asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { status } = req.validated!.body as { status: RequestStatus };
  const reqEntity = await getRequestById(id);
  if (!reqEntity) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  const userId = req.user!.id;
  const isOwner = reqEntity.customerId === userId || reqEntity.providerId === userId;
  const isProviderAcceptingPending =
    status === 'accepted' &&
    reqEntity.status === 'pending' &&
    reqEntity.providerId == null &&
    ['mechanic', 'mechanic_tow', 'car_rental'].includes((req.user!.role as string) ?? '');
  if (!isOwner && !isProviderAcceptingPending) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  let etaMinutes: number | null = null;
  if (status === 'on_the_way' && reqEntity.providerId) {
    const provider = await getProvider(reqEntity.providerId);
    if (provider?.location) {
      etaMinutes = computeEtaMinutes(
        { latitude: provider.location.latitude, longitude: provider.location.longitude },
        reqEntity.origin
      );
    }
  }
  const updated = await updateRequestStatus(
    id,
    status,
    status === 'accepted' || status === 'on_the_way' ? userId : undefined,
    etaMinutes ?? undefined
  );
  if (updated) {
    if (status === 'accepted') {
      await createNotification(
        reqEntity.customerId,
        'request_accepted',
        'Request accepted',
        'Your service request has been accepted. The provider is preparing.',
        { requestId: id }
      );
    } else if (status === 'on_the_way') {
      await createNotification(
        reqEntity.customerId,
        'provider_on_way',
        'Provider on the way',
        etaMinutes ? `ETA ${etaMinutes} min` : 'Your provider is on the way.',
        { requestId: id, etaMinutes: etaMinutes ?? undefined }
      );
    } else if (status === 'completed') {
      await createNotification(
        reqEntity.customerId,
        'service_completed',
        'Service completed',
        'Your service has been completed. Thank you!',
        { requestId: id }
      );
    }
  }
  const out = updated ? await enrichRequestWithProvider(updated) : updated;
  res.json(out);
}));

router.post('/:id/rate', validateParamsJoi(idParamSchemaJoi), validateBodyJoi(rateRequestSchemaJoi), asyncHandler(async (req, res) => {
  const requestId = (req.validated!.params as { id: string }).id;
  const reqEntity = await getRequestById(requestId);
  if (!reqEntity) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  const userId = req.user!.id;
  if (reqEntity.customerId !== userId) {
    res.status(403).json({ message: 'Only the customer can rate this request' });
    return;
  }
  if (reqEntity.status !== 'completed') {
    res.status(422).json({ message: 'Can only rate completed requests' });
    return;
  }
  if (!reqEntity.providerId) {
    res.status(422).json({ message: 'No provider to rate' });
    return;
  }
  const alreadyRated = await hasRatedRequest(userId, requestId);
  if (alreadyRated) {
    res.status(409).json({ message: 'Already rated this request' });
    return;
  }
  const { rating, comment } = req.validated!.body as { rating: number; comment?: string | null };
  const safeComment = comment != null && comment !== '' ? sanitizeUserInput(comment, 500) : null;
  const r = await addRating(reqEntity.providerId, userId, requestId, rating, safeComment);
  res.status(201).json(r);
}));

export default router;
