import { describe, expect, it } from 'bun:test';
import {
  CURRENT_HERMES_VERSION,
  MODES,
  PROPOSED_INTERVENTION_KINDS,
  REASON_CODES,
  SUPERVISION_DECISIONS,
} from './core';
import type {
  AuditRedactionBase,
  IsoDateTime,
  ProposedInterventionKind,
  ReasonCode,
  SubjectRef,
  SupervisionDecision,
  TraceContext,
  TraceProducer,
} from './core';

describe('Core Types', () => {
  describe('HermesVersion', () => {
    it('CURRENT_HERMES_VERSION should be valid semver', () => {
      expect(CURRENT_HERMES_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('CURRENT_HERMES_VERSION should be 1.6.0', () => {
      expect(CURRENT_HERMES_VERSION).toBe('1.6.0');
    });
  });

  describe('Mode', () => {
    it('MODES should contain exactly 2 values', () => {
      expect(MODES).toHaveLength(2);
    });

    it('MODES should contain wellness and advocate_clinical', () => {
      expect(MODES).toContain('wellness');
      expect(MODES).toContain('advocate_clinical');
    });
  });

  describe('ReasonCode', () => {
    it('REASON_CODES should contain all expected values', () => {
      const expectedCodes: ReasonCode[] = [
        'schema_invalid',
        'policy_violation',
        'insufficient_evidence',
        'high_uncertainty',
        'data_quality_warning',
        'patient_acuity_high',
        'risk_too_high',
        'drift_suspected',
        'needs_human_review',
        'approved_with_constraints',
        'low_htv_score',
        'weak_evidence_grade',
        'other',
      ];
      expect(REASON_CODES).toEqual(expectedCodes);
    });

    it('REASON_CODES should have 13 values', () => {
      expect(REASON_CODES).toHaveLength(13);
    });
  });

  describe('SupervisionDecision', () => {
    it('SUPERVISION_DECISIONS should contain all expected values', () => {
      const expectedDecisions: SupervisionDecision[] = [
        'APPROVED',
        'HARD_STOP',
        'ROUTE_TO_CLINICIAN',
        'REQUEST_MORE_INFO',
      ];
      expect(SUPERVISION_DECISIONS).toEqual(expectedDecisions);
    });

    it('SUPERVISION_DECISIONS should have 4 values', () => {
      expect(SUPERVISION_DECISIONS).toHaveLength(4);
    });
  });

  describe('ProposedInterventionKind', () => {
    it('PROPOSED_INTERVENTION_KINDS should contain all expected values', () => {
      const expectedKinds: ProposedInterventionKind[] = [
        'CARE_NAVIGATION',
        'TRIAGE_ROUTE',
        'MEDICATION_ORDER_PROPOSAL',
        'PATIENT_MESSAGE',
        'LIFESTYLE_MODIFICATION_PROPOSAL',
        'NUTRITION_PLAN_PROPOSAL',
        'BEHAVIORAL_INTERVENTION_PROPOSAL',
        'OTHER',
      ];
      expect(PROPOSED_INTERVENTION_KINDS).toEqual(expectedKinds);
    });

    it('PROPOSED_INTERVENTION_KINDS should have 8 values', () => {
      expect(PROPOSED_INTERVENTION_KINDS).toHaveLength(8);
    });
  });
});

describe('Type Definitions', () => {
  it('TraceProducer should have correct structure', () => {
    const producer: TraceProducer = {
      system: 'deutsch',
      service_version: '1.0.0',
      ruleset_version: '2.0.0',
      model_version: '3.0.0',
    };
    expect(producer.system).toBe('deutsch');
    expect(producer.service_version).toBe('1.0.0');
  });

  it('TraceContext should have correct structure', () => {
    const context: TraceContext = {
      trace_id: 'abc123',
      span_id: 'def456',
      parent_span_id: 'ghi789',
      created_at: '2024-01-01T00:00:00.000Z' as IsoDateTime,
      producer: {
        system: 'popper',
        service_version: '1.0.0',
      },
    };
    expect(context.trace_id).toBe('abc123');
    expect(context.producer.system).toBe('popper');
  });

  it('SubjectRef should have correct structure', () => {
    const subject: SubjectRef = {
      subject_type: 'patient',
      subject_id: 'patient-123',
      organization_id: 'org-456',
    };
    expect(subject.subject_type).toBe('patient');
    expect(subject.subject_id).toBe('patient-123');
  });

  it('AuditRedactionBase should have correct structure', () => {
    const audit: AuditRedactionBase = {
      summary: 'PHI-free summary of the action',
    };
    expect(audit.summary).toBe('PHI-free summary of the action');
  });
});
