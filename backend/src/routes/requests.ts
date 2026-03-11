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

const router = Router();
router.use(authGuard);

router.post('/', validateBodyJoi(createRequestSchemaJoi), (req, res) => {
  try {
    const { serviceType, origin, destination, providerId } = req.validated!.body as {
      serviceType: string;
      origin: { latitude: number; longitude: number };
      destination?: { latitude: number; longitude: number } | null;
      providerId?: string | null;
    };
    const userId = req.user!.id;
    const reqEntity = createRequest(userId, serviceType as Parameters<typeof createRequest>[1], origin, destination ?? undefined, providerId ?? undefined);
    res.status(201).json(reqEntity);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : 'Failed' });
  }
});

/** GET /requests/provider – list requests for the current provider. Query: page, limit. */
router.get('/provider', (req, res) => {
  const providerId = req.user!.id;
  const list = listRequestsByProvider(providerId);
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(list, page, limit);
  res.json(result);
});

/** GET /requests/customer – list requests for the current user as customer. Query: page, limit. */
router.get('/customer', (req, res) => {
  const customerId = req.user!.id;
  const list = listRequestsByCustomer(customerId);
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(list, page, limit);
  res.json(result);
});

router.get('/:id', validateParamsJoi(idParamSchemaJoi), (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const reqEntity = getRequestById(id);
  if (!reqEntity) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  if (reqEntity.customerId !== req.user!.id && reqEntity.providerId !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  res.json(reqEntity);
});

router.patch('/:id/status', validateParamsJoi(idParamSchemaJoi), validateBodyJoi(updateRequestStatusSchemaJoi), (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { status } = req.validated!.body as { status: RequestStatus };
  const reqEntity = getRequestById(id);
  if (!reqEntity) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }
  const userId = req.user!.id;
  if (reqEntity.customerId !== userId && reqEntity.providerId !== userId) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  let etaMinutes: number | null = null;
  if (status === 'on_the_way' && reqEntity.providerId) {
    const provider = getProvider(reqEntity.providerId);
    if (provider?.location) {
      etaMinutes = computeEtaMinutes(
        { latitude: provider.location.latitude, longitude: provider.location.longitude },
        reqEntity.origin
      );
    }
  }
  const updated = updateRequestStatus(
    id,
    status,
    status === 'accepted' || status === 'on_the_way' ? userId : undefined,
    etaMinutes ?? undefined
  );
  if (updated) {
    if (status === 'accepted') {
      createNotification(
        reqEntity.customerId,
        'request_accepted',
        'Request accepted',
        'Your service request has been accepted. The provider is preparing.',
        { requestId: id }
      );
    } else if (status === 'on_the_way') {
      createNotification(
        reqEntity.customerId,
        'provider_on_way',
        'Provider on the way',
        etaMinutes ? `ETA ${etaMinutes} min` : 'Your provider is on the way.',
        { requestId: id, etaMinutes: etaMinutes ?? undefined }
      );
    } else if (status === 'completed') {
      createNotification(
        reqEntity.customerId,
        'service_completed',
        'Service completed',
        'Your service has been completed. Thank you!',
        { requestId: id }
      );
    }
  }
  res.json(updated);
});

/** POST /requests/:id/rate – customer rates provider after service (1-5 + optional comment) */
router.post('/:id/rate', validateParamsJoi(idParamSchemaJoi), validateBodyJoi(rateRequestSchemaJoi), (req, res) => {
  const requestId = (req.validated!.params as { id: string }).id;
  const reqEntity = getRequestById(requestId);
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
  if (hasRatedRequest(userId, requestId)) {
    res.status(409).json({ message: 'Already rated this request' });
    return;
  }
  const { rating, comment } = req.validated!.body as { rating: number; comment?: string | null };
  const safeComment = comment != null && comment !== '' ? sanitizeUserInput(comment, 500) : null;
  const r = addRating(reqEntity.providerId, userId, requestId, rating, safeComment);
  res.status(201).json(r);
});

export default router;
