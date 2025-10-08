import express from 'express';
import * as diagnosisController from '../controllers/diagnosis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', diagnosisController.getAllDiagnoses);
router.get('/:id', diagnosisController.getDiagnosisById);
router.post('/', diagnosisController.createDiagnosis);
router.patch('/:id', diagnosisController.updateDiagnosis);
router.delete('/:id', diagnosisController.deleteDiagnosis);
router.get('/patient/:patientId', diagnosisController.getDiagnosesByPatient);
router.get('/appointment/:appointmentId', diagnosisController.getDiagnosesByAppointment);
router.patch('/:id/complete', diagnosisController.completeDiagnosis);

export default router;

