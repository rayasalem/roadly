/**
 * Express app instance. Used by index.ts to listen and by tests for integration.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLoggerMiddleware } from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import providerRoutes from './routes/providers.js';
import notificationRoutes from './routes/notifications.js';
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

const app = express();

app.set('trust proxy', 1);

const isDev = env.NODE_ENV !== 'production';
const productionOrigins = env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean);
const allowedOrigins: string[] = isDev
  ? ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://localhost:19006']
  : productionOrigins.length > 0
    ? productionOrigins
    : ['https://roadmapapp.vercel.app'];

function getCorsOrigin(req: express.Request): string {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && allowedOrigins.includes(origin)) return origin;
  return allowedOrigins[0] ?? 'http://localhost:8081';
}

function applyCorsHeaders(req: express.Request, res: express.Response): void {
  const origin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
}

// 1) Preflight: respond to OPTIONS for every path before any other middleware
app.options('*', (req, res) => {
  applyCorsHeaders(req, res);
  res.sendStatus(204);
});

// 2) CORS headers on every response (before helmet so they are not overridden)
app.use((req, res, next) => {
  applyCorsHeaders(req, res);
  next();
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, allowedOrigins[0]);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

app.use(helmet());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/providers', providerRoutes);
app.use('/notifications', notificationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);

app.use(errorHandler);

export { app };
