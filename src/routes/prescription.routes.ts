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
import { createPrescriptionValidator, updatePrescriptionValidator } from '../validators/prescription.validators.js';
import { handleValidationResult } from '../middleware/validationResult.js';

const router = express.Router();

/**
 * @openapi
 * /prescriptions:
 *   get:
 *     summary: Get all prescriptions
 *     tags:
 *       - Prescriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new prescription (doctor, admin, pharmacist)
 *     tags:
 *       - Prescriptions
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
 *               medication:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router
  .route('/')
  .get(protect, getAllPrescriptions)
  .post(protect, restrictTo('doctor', 'admin', 'pharmacist'), createPrescriptionValidator, handleValidationResult, createPrescription);
/**
 * @openapi
 * /prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID
 *     tags:
 *       - Prescriptions
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
 *         description: Prescription found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 *   put:
 *     summary: Update a prescription by ID (doctor, admin)
 *     tags:
 *       - Prescriptions
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
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 *   delete:
 *     summary: Delete a prescription by ID (admin only)
 *     tags:
 *       - Prescriptions
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
 *         description: Prescription deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router
  .route('/:id')
  .get(protect, getPrescriptionById)
  .put(protect, restrictTo('doctor', 'admin'), updatePrescriptionValidator, handleValidationResult, updatePrescription)
  .delete(protect, restrictTo('admin'), deletePrescription);
/**
 * @openapi
 * /prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescriptions by patient ID
 *     tags:
 *       - Prescriptions
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
 *         description: List of prescriptions for patient
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router
  .route('/patient/:patientId')
  .get(protect, getPrescriptionsByPatient);
/**
 * @openapi
 * /prescriptions/{id}/fill:
 *   post:
 *     summary: Fill a prescription (pharmacist, admin)
 *     tags:
 *       - Prescriptions
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
 *         description: Prescription filled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
router
  .route('/:id/fill')
  .post(protect, restrictTo('pharmacist', 'admin'), fillPrescription);
/**
 * @openapi
 * /prescriptions/{id}/refill:
 *   post:
 *     summary: Refill a prescription (pharmacist, admin)
 *     tags:
 *       - Prescriptions
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
 *         description: Prescription refilled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
router
  .route('/:id/refill')
  .post(protect, restrictTo('pharmacist', 'admin'), refillPrescription);

export default router;

