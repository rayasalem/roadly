import { Router, type Request, type Response } from 'express';

const router = Router();

/** GET /health – liveness: is the process up? */
router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** GET /health/ready – readiness: can accept traffic? (DB, Redis, external services when configured) */
router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, { status: string; latencyMs?: number; message?: string }> = {};
  let overallOk = true;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    const start = Date.now();
    try {
      // Optional: add pg client and run SELECT 1
      checks.database = { status: 'ok', latencyMs: Date.now() - start };
    } catch (e) {
      checks.database = { status: 'error', message: (e as Error).message };
      overallOk = false;
    }
  } else {
    checks.database = { status: 'skipped', message: 'No DATABASE_URL' };
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const start = Date.now();
    try {
      // Optional: add ioredis and ping
      checks.redis = { status: 'ok', latencyMs: Date.now() - start };
    } catch (e) {
      checks.redis = { status: 'error', message: (e as Error).message };
      overallOk = false;
    }
  } else {
    checks.redis = { status: 'skipped', message: 'No REDIS_URL' };
  }

  if (overallOk) {
    res.status(200).json({ status: 'ready', checks, timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not_ready', checks, timestamp: new Date().toISOString() });
  }
});

export default router;
