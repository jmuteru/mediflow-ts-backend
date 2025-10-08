import express from 'express';
import {
  getAllMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication
} from '../controllers/medication.controller.js';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  processPayment
} from '../controllers/invoice.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /medications:
 *   get:
 *     summary: Get all medications
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medications
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new medication (admin, doctor)
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               route:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               patient:
 *                 type: string
 *                 description: Patient ID
 *     responses:
 *       201:
 *         description: Medication created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router
  .route('/')
  .get(getAllMedications)
  .post(restrictTo('admin', 'doctor'), createMedication);
/**
 * @openapi
 * /medications/{id}:
 *   get:
 *     summary: Get a medication by ID
 *     tags:
 *       - Medications
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
 *         description: Medication found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medication not found
 *   patch:
 *     summary: Update a medication by ID (admin, doctor)
 *     tags:
 *       - Medications
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medication updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Medication not found
 *   delete:
 *     summary: Delete a medication by ID (admin, doctor, pharmacist)
 *     tags:
 *       - Medications
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
 *         description: Medication deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Medication not found
 */
router
  .route('/:id')
  .get(getMedication)
  .patch(restrictTo('admin', 'doctor'), updateMedication)
  .delete(restrictTo('admin', 'doctor', 'pharmacist'), deleteMedication);
/**
 * @openapi
 * /medications/billing/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new invoice (admin, doctor, pharmacist)
 *     tags:
 *       - Invoices
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
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router
  .route('/billing/invoices')
  .get(getAllInvoices)
  .post(restrictTo('admin', 'doctor', 'pharmacist'), createInvoice);
/**
 * @openapi
 * /medications/billing/invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags:
 *       - Invoices
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
 *         description: Invoice found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *   patch:
 *     summary: Update an invoice by ID (admin, doctor, pharmacist)
 *     tags:
 *       - Invoices
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
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 *   delete:
 *     summary: Delete an invoice by ID (admin only)
 *     tags:
 *       - Invoices
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
 *         description: Invoice deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
router
  .route('/billing/invoices/:id')
  .get(getInvoiceById)
  .patch(restrictTo('admin', 'doctor', 'pharmacist'), updateInvoice)
  .delete(restrictTo('admin'), deleteInvoice);
/**
 * @openapi
 * /medications/billing/invoices/{id}/payment:
 *   patch:
 *     summary: Process payment for an invoice (admin, doctor, pharmacist)
 *     tags:
 *       - Invoices
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
 *               paymentAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment processed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
router.patch('/billing/invoices/:id/payment', restrictTo('admin', 'doctor', 'pharmacist'), processPayment);

export default router;

