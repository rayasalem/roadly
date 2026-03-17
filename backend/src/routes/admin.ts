import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { validateBodyJoi, validateParamsJoi } from '../middleware/validateRequest.js';
import { adminBlockSchemaJoi, adminVerifySchemaJoi, idParamSchemaJoi } from '../validation/joiSchemas.js';
import { normalizePagination, paginate } from '../lib/pagination.js';
import { getAllUsers, setUserBlocked } from '../store/authStore.js';
import { getAllProviders, setProviderVerified } from '../store/providerStore.js';
import {
  countRequestsByStatus,
  getRequestCountsByDay,
  listAllRequestsForAdmin,
  listRecentRequestsWithNames,
  type ServiceType,
  type RequestStatus,
} from '../store/requestStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authGuard);
router.use(adminLimiter);

function requireAdmin(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin only' });
    return;
  }
  next();
}

function mapMechanicStatus(s: RequestStatus): 'new' | 'on_the_way' | 'in_garage' {
  if (s === 'pending') return 'new';
  if (s === 'on_the_way') return 'on_the_way';
  return 'in_garage';
}

function mapTowStatus(s: RequestStatus): 'active' | 'queued' {
  if (s === 'pending' && true) return 'queued';
  return 'active';
}

router.get('/dashboard', requireAdmin, asyncHandler(async (_req, res) => {
  const users = await getAllUsers();
  const providers = await getAllProviders();
  const { active, completed, pending } = await countRequestsByStatus();
  const activeProviders = providers.filter((p) => p.isAvailable && p.location && (p.location.latitude !== 0 || p.location.longitude !== 0)).length;
  const chartData = await getRequestCountsByDay(7);
  const [mechanicRequests, towRequests, rentalRequests] = await Promise.all([
    listRecentRequestsWithNames('mechanic' as ServiceType, 20),
    listRecentRequestsWithNames('tow' as ServiceType, 20),
    listRecentRequestsWithNames('rental' as ServiceType, 20),
  ]);
  const mechanics = providers.filter((p) => p.role === 'mechanic');
  const tow = providers.filter((p) => p.role === 'mechanic_tow');
  const rental = providers.filter((p) => p.role === 'car_rental');
  res.json({
    stats: {
      users: users.length,
      providers: providers.length,
      requests: active + completed + pending,
      revenue: '0',
      mechanicsCount: mechanics.length,
      towCount: tow.length,
      rentalCount: rental.length,
      activeProviders,
      activeRequests: active,
      completedServices: completed,
      pendingRequests: pending,
    },
    chartData,
    mechanicPanel: {
      stats: {
        jobsToday: completed,
        activeRequests: active,
        avgRating: '0',
      },
      requests: mechanicRequests.map((r) => ({
        id: r.id,
        title: r.serviceType,
        customerName: r.customerName,
        distance: '-',
        eta: r.etaMinutes != null ? `${r.etaMinutes} min` : '-',
        status: mapMechanicStatus(r.status),
        mechanicName: r.providerName ?? undefined,
      })),
    },
    towPanel: {
      stats: { active, waiting: pending, fleet: tow.length },
      requests: towRequests.map((r) => ({
        id: r.id,
        title: r.serviceType,
        customerName: r.customerName,
        distance: '-',
        vehicle: '-',
        status: mapTowStatus(r.status),
      })),
    },
    rentalPanel: {
      stats: { total: 0, available: 0, rented: 0, maintenance: 0 },
      vehicles: [],
    },
    providers: {
      mechanic: mechanics.map((p) => ({
        id: p.id,
        name: p.name,
        role: 'mechanic' as const,
        status: p.verified ? 'verified' : 'pending',
        requestsCount: 0,
      })),
      tow: tow.map((p) => ({
        id: p.id,
        name: p.name,
        role: 'tow' as const,
        status: p.verified ? 'verified' : 'pending',
        requestsCount: 0,
      })),
      rental: rental.map((p) => ({
        id: p.id,
        name: p.name,
        role: 'rental' as const,
        status: p.verified ? 'verified' : 'pending',
        requestsCount: 0,
      })),
    },
  });
}));

router.get('/users', requireAdmin, asyncHandler(async (req, res) => {
  const list = await getAllUsers();
  const safe = list.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, blocked: u.blocked, createdAt: u.createdAt }));
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  res.json(paginate(safe, page, limit));
}));

router.patch('/users/:id/block', requireAdmin, validateParamsJoi(idParamSchemaJoi), validateBodyJoi(adminBlockSchemaJoi), asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { blocked } = req.validated!.body as { blocked: boolean };
  const user = await setUserBlocked(id, blocked);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    blocked: user.blocked,
    createdAt: user.createdAt,
  });
}));

router.get('/providers', requireAdmin, asyncHandler(async (req, res) => {
  const list = await getAllProviders();
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  res.json(paginate(list, page, limit));
}));

router.patch('/providers/:id/verify', requireAdmin, validateParamsJoi(idParamSchemaJoi), validateBodyJoi(adminVerifySchemaJoi), asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { verified } = req.validated!.body as { verified: boolean };
  const provider = await setProviderVerified(id, verified);
  if (!provider) {
    res.status(404).json({ message: 'Provider not found' });
    return;
  }
  res.json(provider);
}));

router.get('/requests', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query as { page?: string; limit?: string; status?: string; serviceType?: string };
  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20));
  const status = query.status as RequestStatus | undefined;
  const serviceType = query.serviceType as ServiceType | undefined;
  const validStatuses: RequestStatus[] = ['pending', 'accepted', 'on_the_way', 'completed', 'cancelled'];
  const validTypes: ServiceType[] = ['mechanic', 'tow', 'rental', 'battery', 'tire', 'oil_change'];
  const result = await listAllRequestsForAdmin({
    page,
    limit,
    ...(status && validStatuses.includes(status) && { status }),
    ...(serviceType && validTypes.includes(serviceType) && { serviceType }),
  });
  res.json(result);
}));

export default router;
