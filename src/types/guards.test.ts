import { describe, expect, it } from 'bun:test';
import {
  HERMES_VERSION_PATTERN,
  isHermesVersion,
  isIsoDateTime,
  isMode,
  isProposedInterventionKind,
  isReasonCode,
  isSubjectRef,
  isSupervisionDecision,
  isTraceProducer,
} from './guards';

describe('Type Guards', () => {
  describe('isHermesVersion', () => {
    it('should return true for valid semver strings', () => {
      expect(isHermesVersion('1.0.0')).toBe(true);
      expect(isHermesVersion('1.6.0')).toBe(true);
      expect(isHermesVersion('10.20.30')).toBe(true);
      expect(isHermesVersion('0.0.1')).toBe(true);
    });

    it('should return false for invalid semver strings', () => {
      expect(isHermesVersion('1.0')).toBe(false);
      expect(isHermesVersion('1')).toBe(false);
      expect(isHermesVersion('v1.0.0')).toBe(false);
      expect(isHermesVersion('1.0.0-alpha')).toBe(false);
      expect(isHermesVersion('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isHermesVersion(null)).toBe(false);
      expect(isHermesVersion(undefined)).toBe(false);
      expect(isHermesVersion(123)).toBe(false);
      expect(isHermesVersion({})).toBe(false);
    });
  });

  describe('isMode', () => {
    it('should return true for valid modes', () => {
      expect(isMode('wellness')).toBe(true);
      expect(isMode('advocate_clinical')).toBe(true);
    });

    it('should return false for invalid modes', () => {
      expect(isMode('clinical')).toBe(false);
      expect(isMode('WELLNESS')).toBe(false);
      expect(isMode('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isMode(null)).toBe(false);
      expect(isMode(undefined)).toBe(false);
      expect(isMode(123)).toBe(false);
    });
  });

  describe('isReasonCode', () => {
    it('should return true for valid reason codes', () => {
      expect(isReasonCode('schema_invalid')).toBe(true);
      expect(isReasonCode('policy_violation')).toBe(true);
      expect(isReasonCode('high_uncertainty')).toBe(true);
      expect(isReasonCode('other')).toBe(true);
    });

    it('should return false for invalid reason codes', () => {
      expect(isReasonCode('invalid_code')).toBe(false);
      expect(isReasonCode('SCHEMA_INVALID')).toBe(false);
      expect(isReasonCode('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isReasonCode(null)).toBe(false);
      expect(isReasonCode(undefined)).toBe(false);
    });
  });

  describe('isSupervisionDecision', () => {
    it('should return true for valid decisions', () => {
      expect(isSupervisionDecision('APPROVED')).toBe(true);
      expect(isSupervisionDecision('HARD_STOP')).toBe(true);
      expect(isSupervisionDecision('ROUTE_TO_CLINICIAN')).toBe(true);
      expect(isSupervisionDecision('REQUEST_MORE_INFO')).toBe(true);
    });

    it('should return false for invalid decisions', () => {
      expect(isSupervisionDecision('approved')).toBe(false);
      expect(isSupervisionDecision('REJECT')).toBe(false);
      expect(isSupervisionDecision('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isSupervisionDecision(null)).toBe(false);
      expect(isSupervisionDecision(undefined)).toBe(false);
    });
  });

  describe('isProposedInterventionKind', () => {
    it('should return true for valid intervention kinds', () => {
      expect(isProposedInterventionKind('CARE_NAVIGATION')).toBe(true);
      expect(isProposedInterventionKind('TRIAGE_ROUTE')).toBe(true);
      expect(isProposedInterventionKind('PATIENT_MESSAGE')).toBe(true);
      expect(isProposedInterventionKind('OTHER')).toBe(true);
    });

    it('should return false for invalid intervention kinds', () => {
      expect(isProposedInterventionKind('care_navigation')).toBe(false);
      expect(isProposedInterventionKind('UNKNOWN')).toBe(false);
      expect(isProposedInterventionKind('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isProposedInterventionKind(null)).toBe(false);
      expect(isProposedInterventionKind(undefined)).toBe(false);
    });
  });

  describe('isTraceProducer', () => {
    it('should return true for valid TraceProducer', () => {
      expect(
        isTraceProducer({
          system: 'deutsch',
          service_version: '1.0.0',
        })
      ).toBe(true);

      expect(
        isTraceProducer({
          system: 'popper',
          service_version: '2.0.0',
          ruleset_version: '1.0.0',
          model_version: '3.0.0',
        })
      ).toBe(true);

      expect(
        isTraceProducer({
          system: 'gateway',
          service_version: '1.0.0',
        })
      ).toBe(true);

      expect(
        isTraceProducer({
          system: 'other',
          service_version: '1.0.0',
        })
      ).toBe(true);
    });

    it('should return false for invalid TraceProducer', () => {
      expect(isTraceProducer({})).toBe(false);
      expect(isTraceProducer({ system: 'deutsch' })).toBe(false);
      expect(isTraceProducer({ system: 'invalid', service_version: '1.0.0' })).toBe(false);
      expect(isTraceProducer({ system: 'deutsch', service_version: 123 })).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isTraceProducer(null)).toBe(false);
      expect(isTraceProducer(undefined)).toBe(false);
      expect(isTraceProducer('string')).toBe(false);
    });
  });

  describe('isSubjectRef', () => {
    it('should return true for valid SubjectRef', () => {
      expect(
        isSubjectRef({
          subject_type: 'patient',
          subject_id: 'patient-123',
        })
      ).toBe(true);

      expect(
        isSubjectRef({
          subject_type: 'patient',
          subject_id: 'patient-456',
          organization_id: 'org-789',
        })
      ).toBe(true);
    });

    it('should return false for invalid SubjectRef', () => {
      expect(isSubjectRef({})).toBe(false);
      expect(isSubjectRef({ subject_type: 'patient' })).toBe(false);
      expect(isSubjectRef({ subject_type: 'doctor', subject_id: '123' })).toBe(false);
      expect(isSubjectRef({ subject_type: 'patient', subject_id: 123 })).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isSubjectRef(null)).toBe(false);
      expect(isSubjectRef(undefined)).toBe(false);
      expect(isSubjectRef('string')).toBe(false);
    });
  });

  describe('isIsoDateTime', () => {
    it('should return true for valid ISO datetime strings', () => {
      expect(isIsoDateTime('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(isIsoDateTime('2024-12-31T23:59:59.999Z')).toBe(true);
      expect(isIsoDateTime('2024-01-01T00:00:00+00:00')).toBe(true);
      expect(isIsoDateTime('2024-01-01T00:00:00-05:00')).toBe(true);
      expect(isIsoDateTime('2024-01-01T00:00:00Z')).toBe(true);
    });

    it('should return false for invalid datetime strings', () => {
      expect(isIsoDateTime('2024-01-01')).toBe(false);
      expect(isIsoDateTime('2024-01-01T00:00:00')).toBe(false);
      expect(isIsoDateTime('not-a-date')).toBe(false);
      expect(isIsoDateTime('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isIsoDateTime(null)).toBe(false);
      expect(isIsoDateTime(undefined)).toBe(false);
      expect(isIsoDateTime(new Date())).toBe(false);
    });
  });

  describe('HERMES_VERSION_PATTERN', () => {
    it('should be a valid regex', () => {
      expect(HERMES_VERSION_PATTERN).toBeInstanceOf(RegExp);
    });

    it('should match semver pattern', () => {
      expect(HERMES_VERSION_PATTERN.test('1.0.0')).toBe(true);
      expect(HERMES_VERSION_PATTERN.test('v1.0.0')).toBe(false);
    });
  });
});
