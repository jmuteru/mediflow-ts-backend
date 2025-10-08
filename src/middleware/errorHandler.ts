import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';

// Centralized error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      error: err,
      message: err.message,
      stack: err.stack
    });
    return;
  }

  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message: err.message
    });
    return;
  }

  // Unknown error
  // eslint-disable-next-line no-console
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

export default errorHandler;

