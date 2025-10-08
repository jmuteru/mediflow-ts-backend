import { body, param } from 'express-validator';

export const createInvoiceValidator = [
  body('patient').isString().notEmpty().withMessage('Patient ID is required'),
  body('provider').isString().notEmpty().withMessage('Provider ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid invoice date is required'),
  body('dueDate').isISO8601().toDate().withMessage('Valid due date is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('status').optional().isIn(['pending', 'in_progress', 'paid', 'overdue', 'cancelled'])
];

export const updateInvoiceValidator = [
  param('id').isMongoId().withMessage('Valid invoice ID is required'),
  body('amount').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'in_progress', 'paid', 'overdue', 'cancelled'])
];
