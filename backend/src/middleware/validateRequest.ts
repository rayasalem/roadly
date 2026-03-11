/**
 * Validates request body/query/params with Zod or Joi. Returns 400 with consistent error format.
 * Attaches parsed data to req.validated (e.g. req.validated.body).
 */
import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import type Joi from 'joi';

declare global {
  namespace Express {
    interface Request {
      validated?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}

/** Zod-based body validation (legacy) */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.validated = req.validated ?? {};
      req.validated.body = result.data;
      next();
      return;
    }
    const first = result.error.errors[0];
    const message = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
    res.status(400).json({ message, errors: result.error.flatten() });
  };
}

/** Zod-based query validation (legacy) */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (result.success) {
      req.validated = req.validated ?? {};
      req.validated.query = result.data;
      next();
      return;
    }
    const first = result.error.errors[0];
    const message = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
    res.status(400).json({ message, errors: result.error.flatten() });
  };
}

/** Joi-based body validation */
export function validateBodyJoi(schema: Joi.Schema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req.body, { stripUnknown: true });
      req.validated = req.validated ?? {};
      req.validated.body = value;
      next();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Validation failed';
      const details = err && typeof err === 'object' && 'details' in err ? (err as { details: unknown }).details : undefined;
      res.status(400).json({ message: detail, ...(details && { errors: details }) });
    }
  };
}

/** Joi-based query validation (coerces types) */
export function validateQueryJoi(schema: Joi.Schema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req.query, { stripUnknown: true, convert: true });
      req.validated = req.validated ?? {};
      req.validated.query = value;
      next();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Validation failed';
      const details = err && typeof err === 'object' && 'details' in err ? (err as { details: unknown }).details : undefined;
      res.status(400).json({ message: detail, ...(details && { errors: details }) });
    }
  };
}

/** Joi-based path params validation */
export function validateParamsJoi(schema: Joi.Schema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req.params, { stripUnknown: true });
      req.validated = req.validated ?? {};
      req.validated.params = value;
      next();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Validation failed';
      res.status(400).json({ message: detail });
    }
  };
}
