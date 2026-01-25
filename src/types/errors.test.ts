/**
 * Tests for Hermes Error types
 */

import { describe, expect, it } from 'bun:test';
import { createTraceContext } from '../utils/trace';
import { CURRENT_HERMES_VERSION } from './core';
import { HERMES_ERROR_CODES, HERMES_ERROR_DESCRIPTIONS, type HermesError } from './errors';

// =============================================================================
// HermesErrorCode Tests
// =============================================================================

describe('HermesErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(HERMES_ERROR_CODES).toContain('invalid_schema');
    expect(HERMES_ERROR_CODES).toContain('unsupported_version');
    expect(HERMES_ERROR_CODES).toContain('unauthorized');
    expect(HERMES_ERROR_CODES).toContain('rate_limited');
    expect(HERMES_ERROR_CODES).toContain('internal_error');
    expect(HERMES_ERROR_CODES).toHaveLength(5);
  });
});

// =============================================================================
// Error Descriptions Tests
// =============================================================================

describe('HERMES_ERROR_DESCRIPTIONS', () => {
  it('should have descriptions for all error codes', () => {
    for (const code of HERMES_ERROR_CODES) {
      expect(HERMES_ERROR_DESCRIPTIONS[code]).toBeDefined();
      expect(typeof HERMES_ERROR_DESCRIPTIONS[code]).toBe('string');
    }
  });
});

// =============================================================================
// HermesError Tests
// =============================================================================

describe('HermesError', () => {
  it('should create a valid invalid_schema error', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      trace,
      code: 'invalid_schema',
      message: 'The proposals field is required',
      details: {
        field: 'proposals',
        error: 'required',
      },
    };

    expect(error.message_type).toBe('error');
    expect(error.code).toBe('invalid_schema');
    expect(error.details?.field).toBe('proposals');
  });

  it('should create a valid unsupported_version error', () => {
    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      code: 'unsupported_version',
      message: 'Version 0.9.0 is not supported. Minimum supported version is 1.0.0',
      details: {
        requested_version: '0.9.0',
        min_supported_version: '1.0.0',
      },
    };

    expect(error.code).toBe('unsupported_version');
    expect(error.trace).toBeUndefined(); // May be absent if request was malformed
  });

  it('should create a valid unauthorized error', () => {
    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      code: 'unauthorized',
      message: 'Invalid signature: verification failed',
      details: {
        reason: 'signature_mismatch',
        key_id: 'key_123',
      },
    };

    expect(error.code).toBe('unauthorized');
    expect(error.details?.reason).toBe('signature_mismatch');
  });

  it('should create a valid rate_limited error', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      trace,
      code: 'rate_limited',
      message: 'Rate limit exceeded. Retry after 60 seconds',
      details: {
        retry_after_seconds: 60,
        current_rate: 1000,
        limit: 500,
      },
    };

    expect(error.code).toBe('rate_limited');
    expect(error.details?.retry_after_seconds).toBe(60);
  });

  it('should create a valid internal_error', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      trace,
      code: 'internal_error',
      message: 'An unexpected error occurred while processing the request',
      details: {
        error_id: 'err_xyz_123',
        support_reference: 'Please contact support with this error_id',
      },
    };

    expect(error.code).toBe('internal_error');
    expect(error.details?.error_id).toBeDefined();
  });

  it('should allow error without trace when request is too malformed', () => {
    const error: HermesError = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'error',
      code: 'invalid_schema',
      message: 'Could not parse request body as JSON',
    };

    expect(error.trace).toBeUndefined();
    expect(error.details).toBeUndefined();
  });
});
