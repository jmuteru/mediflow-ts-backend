import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('admin'), getAllUsers);

router.route('/:id')
  .get(restrictTo('admin'), getUser)
  .patch(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

export default router;

