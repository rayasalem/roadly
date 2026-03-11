/**
 * Attaches a unique request ID to each request (res.locals.requestId and req.id).
 * Use for logging and error responses.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  (req as Request & { id: string }).id = id;
  res.setHeader('X-Request-ID', id);
  (res.locals as { requestId?: string }).requestId = id;
  next();
}
