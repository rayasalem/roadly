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
app.use(helmet());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
const isDev = env.NODE_ENV !== 'production';
const productionOrigins = env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean);
// In dev: allow any origin so Expo Go / device (exp://, http from LAN) can connect
app.use(
  cors({
    origin: isDev
      ? true
      : productionOrigins.length > 0
        ? productionOrigins
        : ['https://roadmapapp.vercel.app'],
    credentials: true,
  })
);
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
