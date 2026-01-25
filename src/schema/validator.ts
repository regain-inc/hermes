/**
 * Hermes JSON Schema Validator
 * @see 03-hermes-specs/02-hermes-contracts.md - Section 14 (Conformance)
 * @module schema/validator
 */

import addFormats from 'ajv-formats';
import Ajv from 'ajv/dist/2020';
import type { HermesMessage } from '../types/messages';
import hermesSchema from './hermes-message.schema.json';

/**
 * Validation error detail.
 */
export interface ValidationErrorDetail {
  /** JSON path to the error location */
  path: string;
  /** Error message */
  message: string;
}

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether the message is valid */
  valid: boolean;
  /** Validation errors if invalid */
  errors?: ValidationErrorDetail[];
}

/**
 * Create AJV instance with Hermes schema.
 * Uses JSON Schema draft-2020-12 for compatibility with Hermes schema.
 */
function createAjv(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    strict: false, // Relax strict mode for draft-2020-12 compatibility
  });
  addFormats(ajv);
  ajv.addSchema(hermesSchema);
  return ajv;
}

const ajv = createAjv();

/**
 * Validate a Hermes message against the schema.
 * @param message - The message to validate (unknown type for runtime validation)
 * @returns Validation result with errors if invalid
 * @see 03-hermes-specs/02-hermes-contracts.md - Section 14
 */
export function validateHermesMessage(message: unknown): ValidationResult {
  const validate = ajv.getSchema(hermesSchema.$id);
  if (!validate) {
    throw new Error('Hermes schema not found');
  }

  const valid = validate(message);

  if (valid) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: (validate.errors ?? []).map((err) => ({
      path: err.instancePath || '/',
      message: err.message ?? 'Unknown error',
    })),
  };
}

/**
 * Validation error with details.
 * Thrown when parseHermesMessage encounters an invalid message.
 */
export class HermesValidationError extends Error {
  /** Validation error details */
  public readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    const errorSummary = errors.map((e) => `${e.path}: ${e.message}`).join(', ');
    super(`Hermes validation failed: ${errorSummary}`);
    this.name = 'HermesValidationError';
    this.errors = errors;
  }
}

/**
 * Validate and parse a Hermes message.
 * Throws HermesValidationError if validation fails.
 * @param message - The message to validate and parse
 * @returns The validated message typed as HermesMessage
 * @throws {HermesValidationError} If validation fails
 */
export function parseHermesMessage(message: unknown): HermesMessage {
  const result = validateHermesMessage(message);
  if (!result.valid) {
    throw new HermesValidationError(result.errors ?? []);
  }
  return message as HermesMessage;
}

/**
 * Type guard to check if a message is a valid Hermes message.
 * @param message - The message to check
 * @returns True if the message is a valid Hermes message
 */
export function isValidHermesMessage(message: unknown): message is HermesMessage {
  return validateHermesMessage(message).valid;
}
