const express = require('express');
const {
  getAllMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication
} = require('../controllers/medication.controller');
// Temporary invoice controller import
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  processPayment
} = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
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

// Temporary invoice routes (workaround for billing)
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

module.exports = router;