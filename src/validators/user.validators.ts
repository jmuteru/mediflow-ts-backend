import { body, param } from 'express-validator';

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
  body('firstName').optional().isString().trim().notEmpty().withMessage('First name must be a non-empty string'),
  body('lastName').optional().isString().trim().notEmpty().withMessage('Last name must be a non-empty string'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'doctor', 'nurse', 'pharmacist', 'biller']).withMessage('Invalid role')
];
