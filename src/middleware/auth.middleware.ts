import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
const { verify } = jwt;
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

interface JwtPayloadWithIssuedAt {
  id: string;
  iat?: number;
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = verify(token, (process.env.JWT_SECRET || 'your-secret-key') as Secret) as JwtPayloadWithIssuedAt;

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    if (currentUser.changedPasswordAfter && decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};


