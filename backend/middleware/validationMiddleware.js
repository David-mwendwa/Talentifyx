import { body, validationResult } from 'express-validator';
import { BadRequestError } from '../errors/customErrors.js';

const withValidationErrors = (validateValues) => [
  validateValues,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError(errors.array().map((e) => e.msg).join(', '));
    }
    next();
  },
];

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('a valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
]);

export const validateLoginInput = withValidationErrors([
  body('email').isEmail().withMessage('a valid email is required'),
  body('password').notEmpty().withMessage('password is required'),
]);

export const validateProfileInput = withValidationErrors([
  body('name').optional().notEmpty().withMessage('name cannot be empty'),
  body('stack').optional().isArray().withMessage('stack must be an array'),
]);
