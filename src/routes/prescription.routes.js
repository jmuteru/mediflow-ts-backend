const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatient,
  fillPrescription,
  refillPrescription
} = require('../controllers/prescription.controller');

// Base routes
router
  .route('/')
  .get(protect, getAllPrescriptions)
  .post(protect, restrictTo('doctor', 'admin', 'pharmacist'), createPrescription);

router
  .route('/:id')
  .get(protect, getPrescriptionById)
  .put(protect, restrictTo('doctor', 'admin'), updatePrescription)
  .delete(protect, restrictTo('admin'), deletePrescription);

// Additional routes
router
  .route('/patient/:patientId')
  .get(protect, getPrescriptionsByPatient);

router
  .route('/:id/fill')
  .post(protect, restrictTo('pharmacist', 'admin'), fillPrescription);

router
  .route('/:id/refill')
  .post(protect, restrictTo('pharmacist', 'admin'), refillPrescription);

module.exports = router;