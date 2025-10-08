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

router
  .route('/')
  .get(getAllMedications)
  .post(restrictTo('admin', 'doctor'), createMedication);

router
  .route('/:id')
  .get(getMedication)
  .patch(restrictTo('admin', 'doctor'), updateMedication)
  .delete(restrictTo('admin', 'doctor', 'pharmacist'), deleteMedication);

router
  .route('/billing/invoices')
  .get(getAllInvoices)
  .post(restrictTo('admin', 'doctor', 'pharmacist'), createInvoice);

router
  .route('/billing/invoices/:id')
  .get(getInvoiceById)
  .patch(restrictTo('admin', 'doctor', 'pharmacist'), updateInvoice)
  .delete(restrictTo('admin'), deleteInvoice);

router.patch('/billing/invoices/:id/payment', restrictTo('admin', 'doctor', 'pharmacist'), processPayment);

export default router;

