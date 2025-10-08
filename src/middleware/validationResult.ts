import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationResult(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: (e as any).param ?? (e as any).path ?? 'unknown', message: e.msg }))
    });
  }
  next();
}
