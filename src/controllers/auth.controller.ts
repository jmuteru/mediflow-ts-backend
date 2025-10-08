import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
const { sign, verify } = jwt;
import User, { IUserDocument } from '../models/user.model.js';
import AppError from '../utils/appError.js';
import crypto from 'crypto';

const signToken = (id: string) => {
  const secret: Secret = (process.env.JWT_SECRET || 'your-secret-key');
  const expiresIn = (process.env.JWT_EXPIRES_IN || '90d') as SignOptions['expiresIn'];
  return sign({ id }, secret, { expiresIn });
};

const createSendToken = (user: IUserDocument, statusCode: number, res: Response) => {
  const token = signToken(String(user._id));
  const refreshSecret: Secret = (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
  const refreshToken = sign({ id: user._id }, refreshSecret, { expiresIn: '7d' });

  // do not leak password
  (user as any).password = undefined;

  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provided = (req as any).cookies?.refreshToken || req.body.refreshToken;

    if (!provided) {
      return next(new AppError('No refresh token provided', 401));
    }

    const decoded = verify(provided, (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as Secret) as { id: string };

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    createSendToken(currentUser, 200, res);
  } catch (_error) {
    return next(new AppError('Invalid refresh token', 401));
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    void resetURL; // placeholder for email send integration

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    if (!(await user.comparePassword(req.body.passwordCurrent))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};


