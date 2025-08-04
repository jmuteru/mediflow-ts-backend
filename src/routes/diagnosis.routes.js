const express = require('express');
const diagnosisController = require('../controllers/diagnosis.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all diagnoses
router.get('/', diagnosisController.getAllDiagnoses);

// Get diagnosis by ID
router.get('/:id', diagnosisController.getDiagnosisById);

// Create new diagnosis
router.post('/', diagnosisController.createDiagnosis);

// Update diagnosis
router.patch('/:id', diagnosisController.updateDiagnosis);

// Delete diagnosis (soft delete)
router.delete('/:id', diagnosisController.deleteDiagnosis);

// Get diagnoses by patient ID
router.get('/patient/:patientId', diagnosisController.getDiagnosesByPatient);

// Get diagnoses by appointment ID
router.get('/appointment/:appointmentId', diagnosisController.getDiagnosesByAppointment);

// Complete diagnosis
router.patch('/:id/complete', diagnosisController.completeDiagnosis);

module.exports = router; 