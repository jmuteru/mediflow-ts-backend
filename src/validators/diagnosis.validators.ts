import { body, param } from 'express-validator';

export const createDiagnosisValidator = [
  body('patient').isString().notEmpty().withMessage('Patient ID is required'),
  body('diagnosedBy').isString().notEmpty().withMessage('Diagnosing doctor ID is required'),
  body('appointment').isString().notEmpty().withMessage('Appointment ID is required'),
  body('diagnosisDate').optional().isISO8601().toDate(),
  body('primaryDiagnosis').isString().notEmpty().withMessage('Primary diagnosis is required'),
  body('symptoms').isString().notEmpty().withMessage('Symptoms are required'),
  body('severity').optional().isIn(['mild', 'moderate', 'severe', 'critical'])
];

export const updateDiagnosisValidator = [
  param('id').isMongoId().withMessage('Valid diagnosis ID is required'),
  body('primaryDiagnosis').optional().isString().notEmpty(),
  body('symptoms').optional().isString().notEmpty(),
  body('severity').optional().isIn(['mild', 'moderate', 'severe', 'critical'])
];
