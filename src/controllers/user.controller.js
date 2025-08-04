const User = require('../models/user.model');
const AppError = require('../utils/appError');

// TODO: Remove doctor role permissions in production - for testing purposes only
const isAuthorized = (user) => {
  // Temporarily allow all authenticated users for testing
  return true;
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // TODO: Remove doctor role check in production - for testing purposes only
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const users = await User.find({ isActive: true }).select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    next(new AppError('Error fetching users', 500));
  }
};

exports.getUser = async (req, res, next) => {
  try {
    // TODO: Remove doctor role check in production - for testing purposes only
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // TODO: Remove doctor role check in production - for testing purposes only
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // TODO: Remove doctor role check in production - for testing purposes only
    if (!isAuthorized(req.user)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 