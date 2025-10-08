import express from 'express';
import {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patient.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllPatients)
  .post(restrictTo('admin', 'doctor'), createPatient);

router.route('/:id')
  .get(getPatient)
  .patch(restrictTo('admin', 'doctor'), updatePatient)
  .delete(restrictTo('admin'), deletePatient);

export default router;

