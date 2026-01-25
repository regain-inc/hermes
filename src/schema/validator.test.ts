/**
 * Conformance tests for Hermes JSON Schema validation.
 */

import { describe, expect, it } from 'bun:test';
import {
  HermesValidationError,
  isValidHermesMessage,
  parseHermesMessage,
  validateHermesMessage,
} from './validator';

// SupervisionRequest fixtures
import {
  fullSupervisionRequest,
  medicationSupervisionRequest,
  minimalSupervisionRequest,
  requestWithPriorOverrides,
  triageSupervisionRequest,
  wellnessSupervisionRequest,
} from '../fixtures/supervision-request';

// SupervisionResponse fixtures
import {
  approvedSupervisionResponse,
  approvedWithConstraintsResponse,
  hardStopSupervisionResponse,
  partialApprovalResponse,
  requestMoreInfoResponse,
  routeSupervisionResponse,
} from '../fixtures/supervision-response';

// ClinicianFeedback fixtures
import {
  acceptedFeedback,
  deferredFeedback,
  modifiedFeedback,
  rejectedPermanentFeedback,
} from '../fixtures/clinician-feedback';

// AuditEvent fixtures
import {
  safeModeEnabledEvent,
  supervisionRequestSentEvent,
  supervisionResponseDecidedEvent,
  validationFailedEvent,
} from '../fixtures/audit-event';

describe('Hermes Schema Validation', () => {
  describe('SupervisionRequest', () => {
    it('should validate minimal request', () => {
      const result = validateHermesMessage(minimalSupervisionRequest);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate full request with all optional fields', () => {
      const result = validateHermesMessage(fullSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should validate medication request with HTV score and evidence', () => {
      const result = validateHermesMessage(medicationSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should validate triage request', () => {
      const result = validateHermesMessage(triageSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should validate request with prior overrides', () => {
      const result = validateHermesMessage(requestWithPriorOverrides);
      expect(result.valid).toBe(true);
    });

    it('should validate wellness mode request', () => {
      const result = validateHermesMessage(wellnessSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid request (missing required field: proposals)', () => {
      const { proposals: _, ...invalid } = minimalSupervisionRequest;

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.message?.includes('required'))).toBe(true);
    });

    it('should reject invalid request (wrong message_type)', () => {
      const invalid = {
        ...minimalSupervisionRequest,
        message_type: 'invalid_type',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid request (empty proposals array)', () => {
      const invalid = {
        ...minimalSupervisionRequest,
        proposals: [],
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid request (bad hermes_version format)', () => {
      const invalid = {
        ...minimalSupervisionRequest,
        hermes_version: 'v1.0', // Should be "1.0.0"
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid request (invalid mode)', () => {
      const invalid = {
        ...minimalSupervisionRequest,
        mode: 'invalid_mode',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('SupervisionResponse', () => {
    it('should validate approved response', () => {
      const result = validateHermesMessage(approvedSupervisionResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate approved with constraints response', () => {
      const result = validateHermesMessage(approvedWithConstraintsResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate route response', () => {
      const result = validateHermesMessage(routeSupervisionResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate hard stop response', () => {
      const result = validateHermesMessage(hardStopSupervisionResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate request more info response', () => {
      const result = validateHermesMessage(requestMoreInfoResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate partial approval response with per-proposal decisions', () => {
      const result = validateHermesMessage(partialApprovalResponse);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid response (missing required field: decision)', () => {
      const { decision: _, ...invalid } = approvedSupervisionResponse;

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid response (invalid decision value)', () => {
      const invalid = {
        ...approvedSupervisionResponse,
        decision: 'INVALID_DECISION',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid response (invalid reason_code)', () => {
      const invalid = {
        ...routeSupervisionResponse,
        reason_codes: ['invalid_code'],
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('ClinicianFeedbackEvent', () => {
    it('should validate accepted feedback', () => {
      const result = validateHermesMessage(acceptedFeedback);
      expect(result.valid).toBe(true);
    });

    it('should validate rejected feedback with permanent contraindication', () => {
      const result = validateHermesMessage(rejectedPermanentFeedback);
      expect(result.valid).toBe(true);
    });

    it('should validate modified feedback', () => {
      const result = validateHermesMessage(modifiedFeedback);
      expect(result.valid).toBe(true);
    });

    it('should validate deferred feedback', () => {
      const result = validateHermesMessage(deferredFeedback);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid feedback (invalid action)', () => {
      const invalid = {
        ...acceptedFeedback,
        action: 'invalid_action',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('AuditEvent', () => {
    it('should validate supervision request sent event', () => {
      const result = validateHermesMessage(supervisionRequestSentEvent);
      expect(result.valid).toBe(true);
    });

    it('should validate supervision response decided event', () => {
      const result = validateHermesMessage(supervisionResponseDecidedEvent);
      expect(result.valid).toBe(true);
    });

    it('should validate safe mode enabled event', () => {
      const result = validateHermesMessage(safeModeEnabledEvent);
      expect(result.valid).toBe(true);
    });

    it('should validate validation failed event', () => {
      const result = validateHermesMessage(validationFailedEvent);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid audit event (invalid event_type)', () => {
      const invalid = {
        ...supervisionRequestSentEvent,
        event_type: 'INVALID_EVENT_TYPE',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('parseHermesMessage', () => {
    it('should parse valid supervision request', () => {
      const msg = parseHermesMessage(minimalSupervisionRequest);
      expect(msg.message_type).toBe('supervision_request');
    });

    it('should parse valid supervision response', () => {
      const msg = parseHermesMessage(approvedSupervisionResponse);
      expect(msg.message_type).toBe('supervision_response');
    });

    it('should throw HermesValidationError on invalid message', () => {
      expect(() => parseHermesMessage({})).toThrow(HermesValidationError);
    });

    it('should throw HermesValidationError with error details', () => {
      try {
        parseHermesMessage({ hermes_version: 'bad' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(HermesValidationError);
        const validationError = error as HermesValidationError;
        expect(validationError.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('isValidHermesMessage', () => {
    it('should return true for valid messages', () => {
      expect(isValidHermesMessage(minimalSupervisionRequest)).toBe(true);
      expect(isValidHermesMessage(approvedSupervisionResponse)).toBe(true);
      expect(isValidHermesMessage(acceptedFeedback)).toBe(true);
    });

    it('should return false for invalid messages', () => {
      expect(isValidHermesMessage({})).toBe(false);
      expect(isValidHermesMessage({ message_type: 'invalid' })).toBe(false);
      expect(isValidHermesMessage(null)).toBe(false);
      expect(isValidHermesMessage(undefined)).toBe(false);
    });

    it('should act as type guard', () => {
      const unknown: unknown = minimalSupervisionRequest;
      if (isValidHermesMessage(unknown)) {
        // TypeScript should now know this is a HermesMessage
        expect(unknown.hermes_version).toBeDefined();
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle null input', () => {
      const result = validateHermesMessage(null);
      expect(result.valid).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = validateHermesMessage(undefined);
      expect(result.valid).toBe(false);
    });

    it('should handle array input', () => {
      const result = validateHermesMessage([minimalSupervisionRequest]);
      expect(result.valid).toBe(false);
    });

    it('should handle primitive input', () => {
      expect(validateHermesMessage('string').valid).toBe(false);
      expect(validateHermesMessage(123).valid).toBe(false);
      expect(validateHermesMessage(true).valid).toBe(false);
    });
  });
});
