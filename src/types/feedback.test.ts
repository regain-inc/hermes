/**
 * Tests for Clinician Feedback types
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2-4.3
 */

import { describe, expect, it } from 'bun:test';
import { createIsoDateTime } from '../utils/datetime';
import { createTraceContext } from '../utils/trace';
import type { SubjectRef } from './core';
import { CURRENT_HERMES_VERSION } from './core';
import {
  type ActiveOverride,
  CLINICIAN_ACTIONS,
  CLINICIAN_ROLES,
  type ClinicianFeedbackEvent,
  type ClinicianOverrideHistory,
  type ClinicianRationale,
  type ClinicianRef,
  MAX_ACTIVE_OVERRIDES,
  MAX_RATIONALE_SUMMARY_LENGTH,
  MAX_UNRESOLVED_CONFLICTS,
  type ModifiedAction,
  RATIONALE_CATEGORIES,
  RESPONSE_TIME_BUCKETS,
} from './feedback';
import type { HealthStateSnapshotRef } from './snapshot';

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

function createTestClinicianRef(): ClinicianRef {
  return {
    clinician_id: 'clin_test_123',
    role: 'attending',
    specialty: 'cardiology',
  };
}

function createTestRationale(): ClinicianRationale {
  return {
    summary: 'Patient has documented allergy to ACE inhibitors',
    category: 'contraindication',
    confidence: 'high',
    contraindication_details: {
      condition_code: 'T88.6',
      severity: 'absolute',
    },
  };
}

// =============================================================================
// ClinicianAction Tests
// =============================================================================

describe('ClinicianAction', () => {
  it('should have all expected actions', () => {
    expect(CLINICIAN_ACTIONS).toContain('accepted');
    expect(CLINICIAN_ACTIONS).toContain('modified');
    expect(CLINICIAN_ACTIONS).toContain('rejected');
    expect(CLINICIAN_ACTIONS).toContain('deferred');
    expect(CLINICIAN_ACTIONS).toHaveLength(4);
  });
});

// =============================================================================
// RationaleCategory Tests
// =============================================================================

describe('RationaleCategory', () => {
  it('should have all expected categories', () => {
    expect(RATIONALE_CATEGORIES).toContain('contraindication');
    expect(RATIONALE_CATEGORIES).toContain('drug_interaction');
    expect(RATIONALE_CATEGORIES).toContain('patient_preference');
    expect(RATIONALE_CATEGORIES).toContain('clinical_judgment');
    expect(RATIONALE_CATEGORIES).toContain('missing_context');
    expect(RATIONALE_CATEGORIES).toContain('protocol_not_applicable');
    expect(RATIONALE_CATEGORIES).toContain('demographic_consideration');
    expect(RATIONALE_CATEGORIES).toContain('recent_adverse_event');
    expect(RATIONALE_CATEGORIES).toContain('comorbidity_conflict');
    expect(RATIONALE_CATEGORIES).toContain('insurance_formulary');
    expect(RATIONALE_CATEGORIES).toContain('other');
    expect(RATIONALE_CATEGORIES).toHaveLength(11);
  });
});

// =============================================================================
// ClinicianRole Tests
// =============================================================================

describe('ClinicianRole', () => {
  it('should have all expected roles', () => {
    expect(CLINICIAN_ROLES).toContain('attending');
    expect(CLINICIAN_ROLES).toContain('specialist');
    expect(CLINICIAN_ROLES).toContain('primary_care');
    expect(CLINICIAN_ROLES).toContain('nurse_practitioner');
    expect(CLINICIAN_ROLES).toContain('physician_assistant');
    expect(CLINICIAN_ROLES).toContain('other');
    expect(CLINICIAN_ROLES).toHaveLength(6);
  });
});

// =============================================================================
// ActiveOverride Tests
// =============================================================================

describe('ActiveOverride', () => {
  it('should create a valid active override', () => {
    const override: ActiveOverride = {
      original_trace_id: 'trace_123',
      action: 'rejected',
      occurred_at: createIsoDateTime(),
      clinician_role: 'attending',
      clinician_specialty: 'cardiology',
      rationale_summary: 'Patient has contraindication',
      rationale_category: 'contraindication',
      confidence: 'high',
      is_permanent: true,
    };

    expect(override.action).toBe('rejected');
    expect(override.is_permanent).toBe(true);
  });

  it('should support override applicability scope', () => {
    const override: ActiveOverride = {
      original_trace_id: 'trace_456',
      action: 'modified',
      occurred_at: createIsoDateTime(),
      rationale_summary: 'Patient prefers alternative',
      rationale_category: 'patient_preference',
      applies_to: {
        medication_class: 'ACE_INHIBITOR',
        intervention_kind: 'MEDICATION_ORDER_PROPOSAL',
      },
      valid_until: createIsoDateTime(),
    };

    expect(override.applies_to?.medication_class).toBe('ACE_INHIBITOR');
  });
});

// =============================================================================
// ClinicianOverrideHistory Tests
// =============================================================================

describe('ClinicianOverrideHistory', () => {
  it('should create a valid override history', () => {
    const history: ClinicianOverrideHistory = {
      total_overrides: 5,
      recent_overrides_30d: 2,
      override_rate_trend: 'stable',
      active_overrides: [],
    };

    expect(history.total_overrides).toBe(5);
    expect(history.recent_overrides_30d).toBe(2);
  });

  it('should support unresolved conflicts', () => {
    const history: ClinicianOverrideHistory = {
      total_overrides: 10,
      recent_overrides_30d: 4,
      active_overrides: [],
      unresolved_conflicts: [
        {
          conflict_id: 'conflict_001',
          override_trace_ids: ['trace_1', 'trace_2'],
          conflict_type: 'disagreement',
          requires_resolution: true,
          recommended_action: 'Review with attending physician',
        },
      ],
    };

    expect(history.unresolved_conflicts).toHaveLength(1);
    expect(history.unresolved_conflicts?.[0].requires_resolution).toBe(true);
  });

  it('should support care handoff metadata', () => {
    const history: ClinicianOverrideHistory = {
      total_overrides: 3,
      recent_overrides_30d: 1,
      active_overrides: [],
      last_handoff: {
        occurred_at: createIsoDateTime(),
        from_organization_id: 'org_a',
        to_organization_id: 'org_b',
        overrides_transferred: 3,
        notes: 'Transferred during care transition',
      },
    };

    expect(history.last_handoff?.overrides_transferred).toBe(3);
  });
});

// =============================================================================
// Size Bounds Tests
// =============================================================================

describe('Size Bounds', () => {
  it('should define normative size limits', () => {
    expect(MAX_ACTIVE_OVERRIDES).toBe(50);
    expect(MAX_UNRESOLVED_CONFLICTS).toBe(10);
    expect(MAX_RATIONALE_SUMMARY_LENGTH).toBe(500);
  });
});

// =============================================================================
// ClinicianFeedbackEvent Tests
// =============================================================================

describe('ClinicianFeedbackEvent', () => {
  it('should create a valid accepted feedback event', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const event: ClinicianFeedbackEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'clinician_feedback',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      original_trace_id: 'trace_original_123',
      original_proposal_id: 'prop_med_001',
      snapshot_ref: createTestSnapshot(),
      action: 'accepted',
      occurred_at: createIsoDateTime(),
      response_time_seconds: 45,
      clinician_ref: createTestClinicianRef(),
      rationale: {
        summary: 'Proposal aligns with clinical guidelines',
        category: 'clinical_judgment',
        confidence: 'high',
      },
      audit_redaction: {
        summary: 'Clinician accepted proposal',
        action: 'accepted',
        category: 'clinical_judgment',
        response_time_bucket: '<1min',
      },
    };

    expect(event.message_type).toBe('clinician_feedback');
    expect(event.action).toBe('accepted');
    expect(event.response_time_seconds).toBe(45);
  });

  it('should create a valid rejected feedback event with contraindication', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const event: ClinicianFeedbackEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'clinician_feedback',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      original_trace_id: 'trace_original_456',
      original_proposal_id: 'prop_med_002',
      snapshot_ref: createTestSnapshot(),
      action: 'rejected',
      occurred_at: createIsoDateTime(),
      clinician_ref: createTestClinicianRef(),
      rationale: createTestRationale(),
      applies_to: {
        medication_class: 'ACE_INHIBITOR',
        is_permanent: true,
      },
      audit_redaction: {
        summary: 'Clinician rejected due to contraindication',
        action: 'rejected',
        category: 'contraindication',
      },
    };

    expect(event.action).toBe('rejected');
    expect(event.rationale.category).toBe('contraindication');
    expect(event.applies_to?.is_permanent).toBe(true);
  });

  it('should create a valid modified feedback event', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const modifiedAction: ModifiedAction = {
      intervention_kind: 'MEDICATION_ORDER_PROPOSAL',
      summary: 'Prescribed alternative medication',
      medication_change: {
        original_proposal_summary: 'Titrate lisinopril to 20mg',
        actual_action_summary: 'Started losartan 50mg instead',
        reason_for_alternative: 'Patient tolerates ARB better',
      },
    };

    const event: ClinicianFeedbackEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'clinician_feedback',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      original_trace_id: 'trace_original_789',
      original_proposal_id: 'prop_med_003',
      snapshot_ref: createTestSnapshot(),
      action: 'modified',
      occurred_at: createIsoDateTime(),
      clinician_ref: createTestClinicianRef(),
      rationale: {
        summary: 'Alternative medication better tolerated',
        category: 'patient_preference',
        confidence: 'medium',
      },
      modified_action: modifiedAction,
      audit_redaction: {
        summary: 'Clinician modified proposal',
        action: 'modified',
        category: 'patient_preference',
      },
    };

    expect(event.action).toBe('modified');
    expect(event.modified_action?.medication_change?.reason_for_alternative).toBe(
      'Patient tolerates ARB better'
    );
  });

  it('should support conflict detection', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const event: ClinicianFeedbackEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'clinician_feedback',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      original_trace_id: 'trace_conflict_001',
      original_proposal_id: 'prop_med_004',
      snapshot_ref: createTestSnapshot(),
      action: 'accepted',
      occurred_at: createIsoDateTime(),
      clinician_ref: {
        clinician_id: 'clin_specialist_001',
        role: 'specialist',
        specialty: 'nephrology',
      },
      rationale: {
        summary: 'Patient can now tolerate this medication',
        category: 'clinical_judgment',
        confidence: 'high',
      },
      conflicts_with_prior_feedback: {
        prior_trace_id: 'trace_prior_001',
        prior_action: 'rejected',
        conflict_type: 'reversal',
        resolution_note: 'Updated renal function allows medication use',
      },
      audit_redaction: {
        summary: 'Conflict with prior feedback',
        action: 'accepted',
        category: 'clinical_judgment',
      },
    };

    expect(event.conflicts_with_prior_feedback?.conflict_type).toBe('reversal');
    expect(event.conflicts_with_prior_feedback?.prior_action).toBe('rejected');
  });

  it('should support demographic context for bias monitoring', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const event: ClinicianFeedbackEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'clinician_feedback',
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      original_trace_id: 'trace_demo_001',
      original_proposal_id: 'prop_med_005',
      snapshot_ref: createTestSnapshot(),
      action: 'rejected',
      occurred_at: createIsoDateTime(),
      clinician_ref: createTestClinicianRef(),
      rationale: {
        summary: 'Dose adjustment needed for renal function',
        category: 'demographic_consideration',
        confidence: 'high',
      },
      demographic_context: {
        age_group: 'geriatric',
        relevant_demographics: ['chronic_kidney_disease', 'heart_failure'],
      },
      audit_redaction: {
        summary: 'Rejected with demographic context',
        action: 'rejected',
        category: 'demographic_consideration',
      },
    };

    expect(event.demographic_context?.age_group).toBe('geriatric');
    expect(event.demographic_context?.relevant_demographics).toContain('chronic_kidney_disease');
  });
});

// =============================================================================
// Response Time Bucket Tests
// =============================================================================

describe('ResponseTimeBucket', () => {
  it('should have all expected buckets', () => {
    expect(RESPONSE_TIME_BUCKETS).toContain('<1min');
    expect(RESPONSE_TIME_BUCKETS).toContain('1-5min');
    expect(RESPONSE_TIME_BUCKETS).toContain('5-15min');
    expect(RESPONSE_TIME_BUCKETS).toContain('15-60min');
    expect(RESPONSE_TIME_BUCKETS).toContain('>60min');
    expect(RESPONSE_TIME_BUCKETS).toHaveLength(5);
  });
});
