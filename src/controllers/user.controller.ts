import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

const isAuthorized = (user: any) => {
  return true;
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    const users = await User.find({ isActive: true }).select('-password');
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (error) {
    next(new AppError('Error fetching users', 500));
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new AppError('No user found with that ID', 404));
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return next(new AppError('No user found with that ID', 404));
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return next(new AppError('No user found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};


