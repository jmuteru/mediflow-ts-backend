import { body, param } from 'express-validator';

export const createAppointmentValidator = [
  body('patient').isString().notEmpty().withMessage('Patient ID is required'),
  body('provider').isString().notEmpty().withMessage('Provider ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).withMessage('Time must be in HH:MM AM/PM format'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('type').isIn(['Annual Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Other']).withMessage('Invalid appointment type'),
  body('location').isString().notEmpty().withMessage('Location is required'),
  body('reason').isString().notEmpty().withMessage('Reason is required')
];

export const updateAppointmentValidator = [
  param('id').isMongoId().withMessage('Valid appointment ID is required'),
  body('date').optional().isISO8601().toDate(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/),
  body('duration').optional().isInt({ min: 15, max: 180 }),
  body('type').optional().isIn(['Annual Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Other']),
  body('location').optional().isString().notEmpty(),
  body('reason').optional().isString().notEmpty()
];
