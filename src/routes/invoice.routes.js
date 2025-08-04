const express = require('express');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatient,
  getInvoicesByStatus,
  processPayment,
  getInvoiceStats
} = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Base routes
router
  .route('/')
  .get(getAllInvoices)
  .post(restrictTo('admin', 'doctor', 'pharmacist'), createInvoice);

// Statistics route
router.get('/stats', restrictTo('admin', 'doctor'), getInvoiceStats);

// Status-based routes
router.get('/status/:status', getInvoicesByStatus);

// Patient-based routes
router.get('/patient/:patientId', getInvoicesByPatient);

// Individual invoice routes
router
  .route('/:id')
  .get(getInvoiceById)
  .patch(restrictTo('admin', 'doctor', 'pharmacist'), updateInvoice)
  .delete(restrictTo('admin'), deleteInvoice);

// Payment processing route
router.patch('/:id/payment', restrictTo('admin', 'doctor', 'pharmacist'), processPayment);

module.exports = router;
