import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatient,
  getInvoicesByStatus,
  processPayment,
  getInvoiceStats
} from '../controllers/invoice.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { createInvoiceValidator, updateInvoiceValidator } from '../validators/invoice.validators.js';
import { handleValidationResult } from '../middleware/validationResult.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllInvoices)
  .post(restrictTo('admin', 'doctor', 'pharmacist'), createInvoiceValidator, handleValidationResult, createInvoice);

router.get('/stats', restrictTo('admin', 'doctor'), getInvoiceStats);
router.get('/status/:status', getInvoicesByStatus);
router.get('/patient/:patientId', getInvoicesByPatient);

router.route('/:id')
  .get(getInvoiceById)
  .patch(restrictTo('admin', 'doctor', 'pharmacist'), updateInvoiceValidator, handleValidationResult, updateInvoice)
  .delete(restrictTo('admin'), deleteInvoice);

router.patch('/:id/payment', restrictTo('admin', 'doctor', 'pharmacist'), processPayment);

export default router;

