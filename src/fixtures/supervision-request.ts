/**
 * SupervisionRequest fixtures for testing and examples.
 * @module fixtures/supervision-request
 */

import type { IsoDateTime } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';
import type { SupervisionRequest } from '../types/supervision';

/**
 * Helper to create IsoDateTime values.
 */
function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * Minimal valid SupervisionRequest fixture.
 * Contains only required fields with a single patient message proposal.
 */
export const minimalSupervisionRequest: SupervisionRequest = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_request',
  trace: {
    trace_id: 'tr-001',
    created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
    producer: {
      system: 'deutsch',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  snapshot: {
    snapshot_id: 'snap-001',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr'],
  },
  proposals: [
    {
      proposal_id: 'prop-001',
      kind: 'PATIENT_MESSAGE',
      created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
      message_markdown: 'Please check your blood pressure today.',
      audit_redaction: {
        summary: 'Patient message about blood pressure check',
      },
    },
  ],
  audit_redaction: {
    summary: 'Supervision request with 1 proposal',
    proposal_summaries: ['Patient message about blood pressure check'],
  },
};

/**
 * Full SupervisionRequest with all optional fields populated.
 * Demonstrates the complete data model.
 */
export const fullSupervisionRequest: SupervisionRequest = {
  ...minimalSupervisionRequest,
  trace: {
    ...minimalSupervisionRequest.trace,
    span_id: 'sp-001',
    producer: {
      ...minimalSupervisionRequest.trace.producer,
      ruleset_version: 'cvd-spec-0.1.0',
      model_version: 'gpt-5.2-2026-01-15',
    },
  },
  snapshot: {
    ...minimalSupervisionRequest.snapshot,
    snapshot_hash: 'm8hP4l9Qyq9w9n0qB8p0bKqH0a7lq9hY2uT5h6k1e2c=',
    snapshot_uri: 'phi://snapshots/snap-001',
    quality: {
      missing_signals: [],
      conflicting_signals: [],
    },
  },
  idempotency_key: 'idem-001',
  request_timestamp: isoDateTime('2026-01-25T10:00:00.000Z'),
  input_risk: {
    attachments_present: false,
    flags: [],
  },
  notes: 'Routine check',
};

/**
 * SupervisionRequest with medication proposal.
 * Demonstrates high-risk clinical proposal with HTV score and evidence.
 */
export const medicationSupervisionRequest: SupervisionRequest = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_request',
  trace: {
    trace_id: 'tr-med-001',
    created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
    producer: {
      system: 'deutsch',
      service_version: '1.0.0',
      ruleset_version: 'cvd-spec-0.1.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  snapshot: {
    snapshot_id: 'snap-med-001',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr', 'wearable'],
  },
  idempotency_key: 'idem-med-001',
  request_timestamp: isoDateTime('2026-01-25T10:00:00.000Z'),
  proposals: [
    {
      proposal_id: 'prop-med-001',
      kind: 'MEDICATION_ORDER_PROPOSAL',
      created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
      medication: {
        name: 'Lisinopril',
        rxnorm_code: '197884',
      },
      change: {
        change_type: 'titrate',
        from_dose: '10 mg daily',
        to_dose: '20 mg daily',
      },
      clinician_protocol_ref: 'protocol://org-ta3-alpha/cvd/hf-gdmt/v1.0.0',
      claim_type: 'treatment_rec',
      htv_score: {
        interdependence: 0.9,
        specificity: 0.85,
        parsimony: 0.8,
        falsifiability: 0.9,
        composite: 0.8625,
      },
      evidence_refs: [
        {
          evidence_id: 'ev-001',
          evidence_type: 'guideline',
          citation: 'AHA/ACC HF Guidelines 2024, Section 7.2',
          evidence_grade: 'systematic_review',
        },
      ],
      falsification_criteria: {
        claim_id: 'prop-med-001',
        refutation_conditions: [
          'If serum potassium > 5.5 mEq/L post-titration',
          'If serum creatinine increases > 30% from baseline',
          'If symptomatic hypotension occurs',
        ],
        observation_window_days: 14,
        outcome_measures: ['serum_potassium', 'serum_creatinine', 'blood_pressure'],
        refutation_action: 'route_to_clinician',
      },
      uncertainty_calibration: {
        level: 'low',
        score: 0.15,
        drivers: [],
      },
      audit_redaction: {
        summary: 'ACE-I titration proposal per GDMT protocol',
      },
    },
  ],
  audit_redaction: {
    summary: 'Medication supervision request',
    proposal_summaries: ['ACE-I titration proposal per GDMT protocol'],
  },
};

/**
 * SupervisionRequest with triage/routing proposal.
 * Demonstrates urgent routing to specialist.
 */
export const triageSupervisionRequest: SupervisionRequest = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_request',
  trace: {
    trace_id: 'tr-triage-001',
    created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
    producer: {
      system: 'deutsch',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-67890',
    organization_id: 'org-ta3-alpha',
  },
  snapshot: {
    snapshot_id: 'snap-triage-001',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr', 'patient_reported'],
  },
  proposals: [
    {
      proposal_id: 'prop-triage-001',
      kind: 'TRIAGE_ROUTE',
      created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
      urgency: 'urgent',
      route_to: 'cardiologist',
      reason: 'Patient reports new-onset chest pain with exertion',
      claim_type: 'escalation',
      htv_score: {
        interdependence: 0.85,
        specificity: 0.8,
        parsimony: 0.9,
        falsifiability: 0.85,
        composite: 0.85,
      },
      audit_redaction: {
        summary: 'Urgent cardiology referral for exertional chest pain',
      },
    },
  ],
  audit_redaction: {
    summary: 'Triage routing request',
    proposal_summaries: ['Urgent cardiology referral for exertional chest pain'],
  },
};

/**
 * SupervisionRequest with prior clinician overrides.
 * Demonstrates case reassessment workflow.
 */
export const requestWithPriorOverrides: SupervisionRequest = {
  ...minimalSupervisionRequest,
  trace: {
    ...minimalSupervisionRequest.trace,
    trace_id: 'tr-override-001',
  },
  relevant_prior_overrides: [
    {
      original_trace_id: 'tr-old-001',
      action: 'rejected',
      rationale_summary: 'Patient has documented ACE-I intolerance (angioedema)',
      rationale_category: 'contraindication',
      confidence: 'high',
      clinician_role: 'attending',
      applies_to: {
        medication_class: 'ACE_INHIBITOR',
      },
      age_days: 45,
      is_permanent: true,
    },
  ],
  audit_redaction: {
    ...minimalSupervisionRequest.audit_redaction,
    has_unresolved_conflicts: false,
  },
};

/**
 * SupervisionRequest with wellness mode.
 * Demonstrates non-clinical lifestyle recommendations.
 */
export const wellnessSupervisionRequest: SupervisionRequest = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_request',
  trace: {
    trace_id: 'tr-wellness-001',
    created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
    producer: {
      system: 'deutsch',
      service_version: '1.0.0',
    },
  },
  mode: 'wellness',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-wellness-001',
  },
  snapshot: {
    snapshot_id: 'snap-wellness-001',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['wearable', 'patient_reported'],
  },
  proposals: [
    {
      proposal_id: 'prop-lifestyle-001',
      kind: 'LIFESTYLE_MODIFICATION_PROPOSAL',
      created_at: isoDateTime('2026-01-25T10:00:00.000Z'),
      modification_type: 'physical_activity',
      recommendations: ['Walk 30 minutes daily', 'Consider low-impact exercises'],
      goals: ['10,000 steps per day'],
      claim_type: 'lifestyle_rec',
      audit_redaction: {
        summary: 'Lifestyle activity recommendation',
      },
    },
  ],
  audit_redaction: {
    summary: 'Wellness lifestyle recommendation',
    proposal_summaries: ['Lifestyle activity recommendation'],
  },
};
