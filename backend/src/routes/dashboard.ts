import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { listPendingRequests, listRequestsByProvider, computeEtaMinutes } from '../store/requestStore.js';
import { getProvider } from '../store/providerStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authGuard);

router.get('/mechanic', requireRole('mechanic'), asyncHandler(async (req, res) => {
  const providerId = req.user!.id;
  let provider: Awaited<ReturnType<typeof getProvider>>;
  let pending: Awaited<ReturnType<typeof listPendingRequests>>;
  let myRequests: Awaited<ReturnType<typeof listRequestsByProvider>>;
  try {
    [provider, pending, myRequests] = await Promise.all([
      getProvider(providerId),
      listPendingRequests('mechanic'),
      listRequestsByProvider(providerId),
    ]);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dashboard/mechanic] DB failed:', e instanceof Error ? e.message : e);
    }
    res.json({
      stats: { jobsToday: 0, onTheWay: 0, rating: '0' },
      jobs: [],
      requesters: [],
    });
    return;
  }
  const pendingJobs = pending.map((r) => {
    const etaMin = provider?.location ? computeEtaMinutes(provider.location, r.origin) : null;
    return {
      id: r.id,
      requestId: r.id,
      title: r.description ? r.description.slice(0, 50) : 'Mechanic request',
      distance: '--',
      eta: etaMin != null ? `${etaMin} min` : '--',
      status: 'new' as const,
    };
  });
  const myJobs = myRequests.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: r.description ? r.description.slice(0, 50) : 'Mechanic request',
    distance: '--',
    eta: r.etaMinutes != null ? `${r.etaMinutes} min` : '--',
    status: (r.status === 'pending' ? 'new' : r.status === 'accepted' || r.status === 'on_the_way' ? r.status : 'in_garage') as 'new' | 'on_the_way' | 'in_garage',
  }));
  const jobs = [...myJobs, ...pendingJobs.filter((p) => !myJobs.some((m) => m.id === p.id))];
  const acceptedOrOtw = myRequests.filter((r) => r.status === 'accepted' || r.status === 'on_the_way');
  res.json({
    stats: {
      jobsToday: myRequests.length,
      onTheWay: acceptedOrOtw.length,
      rating: '0',
    },
    jobs,
    requesters: jobs.map((j) => ({
      id: j.id,
      customerName: 'Customer',
      serviceType: 'mechanic',
      time: '--',
      status: j.status,
    })),
  });
}));

router.get('/tow', requireRole('mechanic_tow'), asyncHandler(async (req, res) => {
  const providerId = req.user!.id;
  let provider: Awaited<ReturnType<typeof getProvider>>;
  let pending: Awaited<ReturnType<typeof listPendingRequests>>;
  let myRequests: Awaited<ReturnType<typeof listRequestsByProvider>>;
  try {
    [provider, pending, myRequests] = await Promise.all([
      getProvider(providerId),
      listPendingRequests('tow'),
      listRequestsByProvider(providerId),
    ]);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dashboard/tow] DB failed:', e instanceof Error ? e.message : e);
    }
    res.json({
      stats: { active: 0, waiting: 0, fleet: 0 },
      jobs: [],
      requesters: [],
    });
    return;
  }
  const pendingJobs = pending.map((r) => {
    const etaMin = provider?.location ? computeEtaMinutes(provider.location, r.origin) : null;
    return {
      id: r.id,
      requestId: r.id,
      title: r.description ? r.description.slice(0, 50) : 'Tow request',
      distance: '--',
      eta: etaMin != null ? `${etaMin} min` : '--',
      status: 'new' as const,
    };
  });
  const myJobs = myRequests.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: r.description ? r.description.slice(0, 50) : 'Tow request',
    distance: '--',
    eta: r.etaMinutes != null ? `${r.etaMinutes} min` : '--',
    status: (r.status === 'pending' ? 'new' : r.status) as 'new' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled',
  }));
  const jobs = [...myJobs, ...pendingJobs.filter((p) => !myJobs.some((m) => m.id === p.id))];
  res.json({
    stats: {
      active: myRequests.filter((r) => r.status === 'accepted' || r.status === 'on_the_way').length,
      waiting: pending.length,
      fleet: 0,
    },
    jobs,
    requesters: jobs.map((j) => ({
      id: j.id,
      customerName: 'Customer',
      serviceType: 'tow',
      time: '--',
      status: j.status,
    })),
  });
}));

router.get('/rental', requireRole('car_rental'), asyncHandler(async (req, res) => {
  const providerId = req.user!.id;
  let provider: Awaited<ReturnType<typeof getProvider>>;
  let pending: Awaited<ReturnType<typeof listPendingRequests>>;
  let myRequests: Awaited<ReturnType<typeof listRequestsByProvider>>;
  try {
    [provider, pending, myRequests] = await Promise.all([
      getProvider(providerId),
      listPendingRequests('rental'),
      listRequestsByProvider(providerId),
    ]);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dashboard/rental] DB failed:', e instanceof Error ? e.message : e);
    }
    res.json({
      stats: { total: 0, available: 0, rented: 0 },
      vehicles: [],
      upcomingBookings: [],
      jobs: [],
      requesters: [],
    });
    return;
  }
  const pendingJobs = pending.map((r) => {
    const etaMin = provider?.location ? computeEtaMinutes(provider.location, r.origin) : null;
    return {
      id: r.id,
      requestId: r.id,
      title: r.description ? r.description.slice(0, 50) : 'Rental request',
      distance: '--',
      eta: etaMin != null ? `${etaMin} min` : '--',
      status: 'new' as const,
    };
  });
  const myJobs = myRequests.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: r.description ? r.description.slice(0, 50) : 'Rental request',
    distance: '--',
    eta: r.etaMinutes != null ? `${r.etaMinutes} min` : '--',
    status: (r.status === 'pending' ? 'new' : r.status) as 'new' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled',
  }));
  const jobs = [...myJobs, ...pendingJobs.filter((p) => !myJobs.some((m) => m.id === p.id))];
  res.json({
    stats: { total: 0, available: 0, rented: 0 },
    vehicles: [],
    upcomingBookings: [],
    jobs,
    requesters: jobs.map((j) => ({
      id: j.id,
      customerName: 'Customer',
      serviceType: 'rental',
      time: '--',
      status: j.status,
    })),
  });
}));

export default router;
