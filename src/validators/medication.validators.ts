import { body, param } from 'express-validator';

export const createMedicationValidator = [
  body('name').isString().trim().notEmpty().withMessage('Medication name is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('dosage').isString().notEmpty().withMessage('Dosage is required'),
  body('frequency').isString().notEmpty().withMessage('Frequency is required'),
  body('route').isIn(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'other']).withMessage('Invalid route'),
  body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
  body('patient').isString().notEmpty().withMessage('Patient ID is required'),
  body('prescribedBy').isString().notEmpty().withMessage('Prescriber ID is required')
];

export const updateMedicationValidator = [
  param('id').isMongoId().withMessage('Valid medication ID is required'),
  body('dosage').optional().isString().notEmpty(),
  body('frequency').optional().isString().notEmpty(),
  body('status').optional().isIn(['active', 'completed', 'discontinued'])
];
