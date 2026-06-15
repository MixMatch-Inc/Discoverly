import type { ErrorRequestHandler } from 'express';
import type { ZodError, ZodIssue } from 'zod';
import { AppError } from '../errors/app-error';
import { logger } from '../logger/logger';

function isZodError(err: unknown): err is ZodError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: string }).name === 'ZodError' &&
    Array.isArray((err as { issues?: unknown }).issues)
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isZodError(err)) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((issue: ZodIssue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error('Unhandled error', { error: err instanceof Error ? err.message : err });
  res.status(500).json({ message: 'Internal server error' });
};
