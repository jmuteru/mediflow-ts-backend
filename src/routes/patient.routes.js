const express = require('express');
const {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patient.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getAllPatients)
  .post(restrictTo('admin', 'doctor'), createPatient);

router
  .route('/:id')
  .get(getPatient)
  .patch(restrictTo('admin', 'doctor'), updatePatient)
  .delete(restrictTo('admin'), deletePatient);

module.exports = router; 