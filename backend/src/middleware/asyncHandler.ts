/**
 * Wraps async route handlers so unhandled rejections are passed to errorHandler.
 * Use for any route that returns a Promise (e.g. async (req, res) => { ... }).
 */
import type { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
