/**
 * Schema module - JSON Schema validation for Hermes messages
 * @module schema
 */

export {
  validateHermesMessage,
  parseHermesMessage,
  isValidHermesMessage,
  HermesValidationError,
} from './validator';

export type { ValidationResult, ValidationErrorDetail } from './validator';
