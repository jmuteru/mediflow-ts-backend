import express from 'express';
import * as diagnosisController from '../controllers/diagnosis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /diagnoses:
 *   get:
 *     summary: Get all diagnoses
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diagnoses
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new diagnosis
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Diagnosis created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.get('/', diagnosisController.getAllDiagnoses);
router.post('/', diagnosisController.createDiagnosis);
/**
 * @openapi
 * /diagnoses/{id}:
 *   get:
 *     summary: Get a diagnosis by ID
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diagnosis found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagnosis not found
 *   patch:
 *     summary: Update a diagnosis by ID
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Diagnosis updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagnosis not found
 *   delete:
 *     summary: Delete a diagnosis by ID
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Diagnosis deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagnosis not found
 */
router.get('/:id', diagnosisController.getDiagnosisById);
router.patch('/:id', diagnosisController.updateDiagnosis);
router.delete('/:id', diagnosisController.deleteDiagnosis);
/**
 * @openapi
 * /diagnoses/patient/{patientId}:
 *   get:
 *     summary: Get diagnoses by patient ID
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of diagnoses for patient
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.get('/patient/:patientId', diagnosisController.getDiagnosesByPatient);
/**
 * @openapi
 * /diagnoses/appointment/{appointmentId}:
 *   get:
 *     summary: Get diagnoses by appointment ID
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of diagnoses for appointment
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.get('/appointment/:appointmentId', diagnosisController.getDiagnosesByAppointment);
/**
 * @openapi
 * /diagnoses/{id}/complete:
 *   patch:
 *     summary: Mark a diagnosis as complete
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diagnosis marked as complete
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagnosis not found
 */
router.patch('/:id/complete', diagnosisController.completeDiagnosis);

export default router;

