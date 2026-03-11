import rateLimit from 'express-rate-limit';

/** Auth routes: 20 attempts per 15 min */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts' },
});

/** Global API: 100 req per 1 min */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests' },
});

/** Admin routes: stricter limit */
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { message: 'Too many admin requests' },
});

/** Provider location updates: prevent spam */
export const locationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { message: 'Too many location updates' },
});
