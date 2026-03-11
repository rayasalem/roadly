/**
 * Logs each request with method, url, requestId; on finish logs status and duration.
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as Request & { id?: string }).id ?? 'unknown';
  logger.info({
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    msg: 'request start',
  });
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      msg: 'request end',
    });
  });
  next();
}
