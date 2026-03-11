/**
 * Global error handler. Ensures consistent JSON and no stack leakage in production.
 * Use next(AppError(404, 'Not found')) for known HTTP errors.
 * Includes requestId in response when available; logs via structured logger.
 */
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProd = env.NODE_ENV === 'production';
  const requestId = (req as Request & { id?: string }).id;

  if (err instanceof AppError) {
    const body = {
      message: err.message,
      ...(requestId ? { requestId } : {}),
      ...(err.code && !isProd ? { code: err.code } : {}),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof Error) {
    logger.error({ err, requestId, msg: err.message });
    if (!isProd) {
      console.error(err);
    }
  }

  res.status(500).json({
    message: isProd ? 'Internal server error' : (err instanceof Error ? err.message : 'Unknown error'),
    ...(requestId ? { requestId } : {}),
  });
}
