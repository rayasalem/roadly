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
import vehicleRoutes from './routes/vehicles.js';
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/uploads.js';

const app = express();

app.set('trust proxy', 1);

const isDev = env.NODE_ENV !== 'production';
const productionOrigins = env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean);
const baseDevOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8083',
  'http://127.0.0.1:8083',
  'http://localhost:8084',
  'http://127.0.0.1:8084',
  'http://localhost:19006',
  'http://localhost:19000',
  'http://127.0.0.1:19000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://roadmapapp.vercel.app',
];

/** Dev-only: allow Expo web / Metro from another machine on LAN (private IPv4 + port). */
function isLanDevOrigin(origin: string): boolean {
  if (!isDev) return false;
  return /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    origin.trim(),
  );
}
const baseProdOrigins =
  productionOrigins.length > 0 ? productionOrigins : ['https://roadmapapp.vercel.app'];
const allowedOrigins: string[] = Array.from(
  new Set(isDev ? baseDevOrigins : baseProdOrigins.concat('https://roadmapapp.vercel.app')),
);

function getCorsOrigin(req: express.Request): string {
  const origin = req.headers.origin;
  if (typeof origin === 'string') {
    if (allowedOrigins.includes(origin)) return origin;
    if (isLanDevOrigin(origin)) return origin;
  }
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
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (isLanDevOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

app.use(helmet());
app.use('/uploads', express.static('uploads'));
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/providers', providerRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', vehicleRoutes);
app.use('/', uploadRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);

app.use(errorHandler);

export { app };
