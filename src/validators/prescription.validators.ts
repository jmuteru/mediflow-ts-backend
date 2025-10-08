import { body, param } from 'express-validator';

export const createPrescriptionValidator = [
  body('patient').isString().notEmpty().withMessage('Patient ID is required'),
  body('medication').isString().notEmpty().withMessage('Medication ID is required'),
  body('prescribedBy').isString().notEmpty().withMessage('Prescriber ID is required'),
  body('dateIssued').isISO8601().toDate().withMessage('Valid date issued is required'),
  body('quantity').isString().notEmpty().withMessage('Quantity is required'),
  body('refillsAllowed').isInt({ min: 0 }).withMessage('Refills allowed must be a non-negative integer'),
  body('instructions').isString().notEmpty().withMessage('Instructions are required')
];

export const updatePrescriptionValidator = [
  param('id').isMongoId().withMessage('Valid prescription ID is required'),
  body('dosage').optional().isString().notEmpty(),
  body('frequency').optional().isString().notEmpty(),
  body('duration').optional().isString().notEmpty()
];
