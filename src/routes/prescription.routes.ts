import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatient,
  fillPrescription,
  refillPrescription
} from '../controllers/prescription.controller.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllPrescriptions)
  .post(protect, restrictTo('doctor', 'admin', 'pharmacist'), createPrescription);

router
  .route('/:id')
  .get(protect, getPrescriptionById)
  .put(protect, restrictTo('doctor', 'admin'), updatePrescription)
  .delete(protect, restrictTo('admin'), deletePrescription);

router
  .route('/patient/:patientId')
  .get(protect, getPrescriptionsByPatient);

router
  .route('/:id/fill')
  .post(protect, restrictTo('pharmacist', 'admin'), fillPrescription);

router
  .route('/:id/refill')
  .post(protect, restrictTo('pharmacist', 'admin'), refillPrescription);

export default router;

