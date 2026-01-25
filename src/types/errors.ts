/**
 * Error types for Hermes protocol
 * Standard error envelope for rejecting messages.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 5
 * @module types/errors
 */

import type { HermesVersion, TraceContext } from './core';

// =============================================================================
// Section 5: Error Types
// =============================================================================

/**
 * Error codes for Hermes protocol.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 5
 * @see schema/hermes-message.schema.json — $defs.HermesErrorCode
 */
export type HermesErrorCode =
  | 'invalid_schema'
  | 'unsupported_version'
  | 'unauthorized'
  | 'rate_limited'
  | 'internal_error';

/**
 * All valid Hermes error codes as a readonly array for runtime validation.
 */
export const HERMES_ERROR_CODES: readonly HermesErrorCode[] = [
  'invalid_schema',
  'unsupported_version',
  'unauthorized',
  'rate_limited',
  'internal_error',
] as const;

/**
 * Error response when rejecting Hermes messages.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 5
 * @see schema/hermes-message.schema.json — $defs.HermesError
 */
export interface HermesError {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'error';

  /**
   * Trace context from the request (if available).
   * May be absent if the request was too malformed to extract trace info.
   */
  readonly trace?: TraceContext;

  /** Error code */
  readonly code: HermesErrorCode;
  /** Human-readable error message */
  readonly message: string;
  /** Additional error details */
  readonly details?: Readonly<Record<string, unknown>>;
}

// =============================================================================
// Error Code Descriptions
// =============================================================================

/**
 * Human-readable descriptions for error codes.
 */
export const HERMES_ERROR_DESCRIPTIONS: Record<HermesErrorCode, string> = {
  invalid_schema: 'The message does not conform to the expected schema',
  unsupported_version: 'The hermes_version is not supported by this implementation',
  unauthorized: 'The request lacks valid authentication credentials',
  rate_limited: 'Too many requests; please retry after the indicated delay',
  internal_error: 'An unexpected internal error occurred',
} as const;
