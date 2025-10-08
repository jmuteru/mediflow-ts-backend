import { body, param } from 'express-validator';

export const createPatientValidator = [
  body('firstName').isString().trim().notEmpty().withMessage('First name is required'),
  body('lastName').isString().trim().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('contact.phone').isString().notEmpty().withMessage('Phone is required'),
  body('contact.email').optional().isEmail().withMessage('Valid email is required'),
  body('address.street').isString().notEmpty().withMessage('Street is required'),
  body('address.city').isString().notEmpty().withMessage('City is required'),
  body('address.state').isString().notEmpty().withMessage('State is required'),
  body('address.zipCode').isString().notEmpty().withMessage('ZIP code is required'),
  body('address.country').isString().notEmpty().withMessage('Country is required'),
  body('emergencyContact.name').isString().notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.relationship').isString().notEmpty().withMessage('Emergency contact relationship is required'),
  body('emergencyContact.phone').isString().notEmpty().withMessage('Emergency contact phone is required')
];

export const updatePatientValidator = [
  param('id').isMongoId().withMessage('Valid patient ID is required'),
  body('firstName').optional().isString().trim().notEmpty(),
  body('lastName').optional().isString().trim().notEmpty(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('contact.phone').optional().isString().notEmpty(),
  body('contact.email').optional().isEmail(),
  body('address.street').optional().isString().notEmpty(),
  body('address.city').optional().isString().notEmpty(),
  body('address.state').optional().isString().notEmpty(),
  body('address.zipCode').optional().isString().notEmpty(),
  body('address.country').optional().isString().notEmpty(),
  body('emergencyContact.name').optional().isString().notEmpty(),
  body('emergencyContact.relationship').optional().isString().notEmpty(),
  body('emergencyContact.phone').optional().isString().notEmpty()
];
