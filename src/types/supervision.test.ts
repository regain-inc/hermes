/**
 * Tests for Supervision types
 */

import { describe, expect, it } from 'bun:test';
import { createIsoDateTime } from '../utils/datetime';
import { createTraceContext } from '../utils/trace';
import type { SubjectRef } from './core';
import { CURRENT_HERMES_VERSION } from './core';
import type { MedicationOrderProposal } from './proposals';
import type { HealthStateSnapshotRef } from './snapshot';
import type {
  InputRisk,
  PriorOverride,
  SupervisionRequest,
  SupervisionResponse,
} from './supervision';

// =============================================================================
// Test Fixtures
// =============================================================================

function createTestSnapshot(): HealthStateSnapshotRef {
  return {
    snapshot_id: 'snap_test_123',
    created_at: createIsoDateTime(),
    sources: ['ehr', 'wearable'],
  };
}

function createTestSubject(): SubjectRef {
  return {
    subject_type: 'patient',
    subject_id: 'patient_test_123',
    organization_id: 'org_test',
  };
}

function createTestMedicationProposal(): MedicationOrderProposal {
  return {
    proposal_id: 'prop_med_001',
    kind: 'MEDICATION_ORDER_PROPOSAL',
    created_at: createIsoDateTime(),
    medication: {
      name: 'lisinopril',
      rxnorm_code: '314076',
    },
    change: {
      change_type: 'titrate',
      from_dose: '10 mg daily',
      to_dose: '20 mg daily',
    },
    clinician_protocol_ref: 'protocol://org/hf-gdmt/v1',
    audit_redaction: {
      summary: 'Medication titration under protocol',
    },
  };
}

// =============================================================================
// InputRisk Tests
// =============================================================================

describe('InputRisk', () => {
  it('should allow empty input risk', () => {
    const inputRisk: InputRisk = {};
    expect(inputRisk).toBeDefined();
  });

  it('should allow all risk flags', () => {
    const inputRisk: InputRisk = {
      attachments_present: true,
      flags: ['phi_detected', 'prompt_injection_suspected', 'malware_suspected', 'other'],
      notes: 'Multiple risk indicators detected',
    };
    expect(inputRisk.flags).toHaveLength(4);
  });
});

// =============================================================================
// PriorOverride Tests
// =============================================================================

describe('PriorOverride', () => {
  it('should create a valid prior override', () => {
    const override: PriorOverride = {
      original_trace_id: 'trace_123',
      action: 'rejected',
      rationale_summary: 'Patient has documented allergy to ACE inhibitors',
      rationale_category: 'contraindication',
      age_days: 15,
      is_permanent: true,
    };
    expect(override.action).toBe('rejected');
    expect(override.rationale_category).toBe('contraindication');
  });

  it('should allow all rationale categories', () => {
    const categories = [
      'contraindication',
      'drug_interaction',
      'patient_preference',
      'clinical_judgment',
      'missing_context',
      'protocol_not_applicable',
      'demographic_consideration',
      'recent_adverse_event',
      'comorbidity_conflict',
      'insurance_formulary',
      'other',
    ] as const;

    for (const category of categories) {
      const override: PriorOverride = {
        original_trace_id: 'trace_123',
        action: 'modified',
        rationale_summary: 'Test',
        rationale_category: category,
        age_days: 1,
      };
      expect(override.rationale_category).toBe(category);
    }
  });
});

// =============================================================================
// SupervisionRequest Tests
// =============================================================================

describe('SupervisionRequest', () => {
  it('should create a valid supervision request', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const request: SupervisionRequest = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_request',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      proposals: [createTestMedicationProposal()],
      audit_redaction: {
        summary: 'Test supervision request',
        proposal_summaries: ['Medication titration'],
      },
    };

    expect(request.hermes_version).toBe(CURRENT_HERMES_VERSION);
    expect(request.message_type).toBe('supervision_request');
    expect(request.proposals).toHaveLength(1);
  });

  it('should support idempotency key for replay protection', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const request: SupervisionRequest = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_request',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      proposals: [createTestMedicationProposal()],
      idempotency_key: '01J0Y4K0P5GQ2Z8Z4W3C9Q9G7Q',
      request_timestamp: createIsoDateTime(),
      audit_redaction: {
        summary: 'Test request',
        proposal_summaries: ['Test'],
      },
    };

    expect(request.idempotency_key).toBeDefined();
    expect(request.request_timestamp).toBeDefined();
  });

  it('should support input risk flags', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const request: SupervisionRequest = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_request',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      proposals: [createTestMedicationProposal()],
      input_risk: {
        attachments_present: true,
        flags: ['phi_detected'],
      },
      audit_redaction: {
        summary: 'Test request',
        proposal_summaries: ['Test'],
      },
    };

    expect(request.input_risk?.attachments_present).toBe(true);
  });

  it('should support feedback metrics', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const request: SupervisionRequest = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_request',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      proposals: [createTestMedicationProposal()],
      feedback_metrics: {
        override_rate_30d: 0.15,
        override_rate_trend: 'stable',
        avg_response_time_seconds: 45,
      },
      audit_redaction: {
        summary: 'Test request',
        proposal_summaries: ['Test'],
      },
    };

    expect(request.feedback_metrics?.override_rate_30d).toBe(0.15);
  });
});

// =============================================================================
// SupervisionResponse Tests
// =============================================================================

describe('SupervisionResponse', () => {
  it('should create an APPROVED response', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const response: SupervisionResponse = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_response',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      decision: 'APPROVED',
      reason_codes: [],
      explanation: 'All proposals meet safety criteria.',
      audit_redaction: {
        summary: 'Approved',
        decision: 'APPROVED',
        reason_codes: [],
      },
    };

    expect(response.decision).toBe('APPROVED');
    expect(response.reason_codes).toHaveLength(0);
  });

  it('should create a ROUTE_TO_CLINICIAN response with constraints', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const response: SupervisionResponse = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_response',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      decision: 'ROUTE_TO_CLINICIAN',
      reason_codes: ['needs_human_review', 'high_uncertainty'],
      explanation: 'Medication titration requires clinician review.',
      approved_constraints: {
        must_route_after: createIsoDateTime(),
      },
      audit_redaction: {
        summary: 'Routed to clinician',
        decision: 'ROUTE_TO_CLINICIAN',
        reason_codes: ['needs_human_review', 'high_uncertainty'],
      },
    };

    expect(response.decision).toBe('ROUTE_TO_CLINICIAN');
    expect(response.reason_codes).toContain('needs_human_review');
    expect(response.approved_constraints).toBeDefined();
  });

  it('should support per-proposal decisions', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const response: SupervisionResponse = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_response',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      decision: 'ROUTE_TO_CLINICIAN',
      reason_codes: ['needs_human_review'],
      explanation: 'Partial approval: lifestyle approved, medication routed.',
      per_proposal_decisions: [
        {
          proposal_id: 'prop_med_001',
          decision: 'ROUTE_TO_CLINICIAN',
          reason_codes: ['needs_human_review'],
          explanation: 'Medication requires review',
        },
        {
          proposal_id: 'prop_lifestyle_001',
          decision: 'APPROVED',
          reason_codes: [],
        },
      ],
      audit_redaction: {
        summary: 'Partial approval',
        decision: 'ROUTE_TO_CLINICIAN',
        reason_codes: ['needs_human_review'],
      },
    };

    expect(response.per_proposal_decisions).toHaveLength(2);
    expect(response.per_proposal_decisions?.[0].decision).toBe('ROUTE_TO_CLINICIAN');
    expect(response.per_proposal_decisions?.[1].decision).toBe('APPROVED');
  });

  it('should support safe mode state', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const response: SupervisionResponse = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'supervision_response',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      snapshot: createTestSnapshot(),
      decision: 'HARD_STOP',
      reason_codes: ['policy_violation'],
      explanation: 'Safe mode is enabled.',
      safe_mode_state_used: {
        enabled: true,
        effective_at: createIsoDateTime(),
      },
      audit_redaction: {
        summary: 'Hard stop (safe mode)',
        decision: 'HARD_STOP',
        reason_codes: ['policy_violation'],
      },
    };

    expect(response.safe_mode_state_used?.enabled).toBe(true);
  });
});

// =============================================================================
// Decision Semantics Tests
// =============================================================================

describe('SupervisionDecision semantics', () => {
  it('should have correct decision ordering (most conservative first)', () => {
    const decisions = ['HARD_STOP', 'ROUTE_TO_CLINICIAN', 'REQUEST_MORE_INFO', 'APPROVED'] as const;

    // HARD_STOP is most conservative
    expect(decisions[0]).toBe('HARD_STOP');
    // APPROVED is least conservative
    expect(decisions[3]).toBe('APPROVED');
  });
});

// =============================================================================
// Reason Code Tests
// =============================================================================

describe('ReasonCode', () => {
  it('should support all defined reason codes', () => {
    const codes = [
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
    ] as const;

    expect(codes).toHaveLength(13);
  });
});
