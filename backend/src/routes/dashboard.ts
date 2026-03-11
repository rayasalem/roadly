import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { listPendingRequests } from '../store/requestStore.js';
import { listRequestsByProvider } from '../store/requestStore.js';

const router = Router();
router.use(authGuard);

router.get('/mechanic', requireRole('mechanic'), (req, res) => {
  const providerId = req.user!.id;
  const pending = listPendingRequests('mechanic');
  const myRequests = listRequestsByProvider(providerId);
  const pendingJobs = pending.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: 'Mechanic request',
    distance: '--',
    eta: '--',
    status: 'new' as const,
  }));
  const myJobs = myRequests.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: 'Mechanic request',
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
});

router.get('/tow', requireRole('mechanic_tow'), (req, res) => {
  const providerId = req.user!.id;
  const pending = listPendingRequests('tow');
  const myRequests = listRequestsByProvider(providerId);
  const pendingJobs = pending.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: 'Tow request',
    distance: '--',
    eta: '--',
    status: 'new' as const,
  }));
  const myJobs = myRequests.map((r) => ({
    id: r.id,
    requestId: r.id,
    title: 'Tow request',
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
});

router.get('/rental', requireRole('car_rental'), (_req, res) => {
  res.json({
    stats: { total: 0, available: 0, rented: 0 },
    vehicles: [],
    upcomingBookings: [],
  });
});

export default router;
