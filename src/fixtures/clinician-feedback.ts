/**
 * ClinicianFeedbackEvent fixtures for testing and examples.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 * @module fixtures/clinician-feedback
 */

import type { IsoDateTime } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';
import type { ClinicianFeedbackEvent } from '../types/feedback';

/**
 * Helper to create IsoDateTime values.
 */
function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * Accepted feedback fixture.
 * Clinician approved Deutsch's proposal as-is.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export const acceptedFeedback: ClinicianFeedbackEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'clinician_feedback',
  trace: {
    trace_id: 'tr-fb-accept-001',
    created_at: isoDateTime('2026-01-25T10:30:00.000Z'),
    producer: {
      system: 'gateway',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  original_trace_id: 'tr-med-001',
  original_proposal_id: 'prop-med-001',
  snapshot_ref: {
    snapshot_id: 'snap-med-001',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr', 'wearable'],
  },
  action: 'accepted',
  occurred_at: isoDateTime('2026-01-25T10:30:00.000Z'),
  response_time_seconds: 1800,
  clinician_ref: {
    clinician_id: 'clin-001',
    role: 'attending',
    specialty: 'cardiology',
  },
  rationale: {
    summary: 'Proposal aligns with current GDMT protocol and patient status',
    category: 'clinical_judgment',
    confidence: 'high',
  },
  audit_redaction: {
    summary: 'Clinician accepted medication proposal',
    action: 'accepted',
    category: 'clinical_judgment',
    response_time_bucket: '15-60min',
  },
};

/**
 * Rejected feedback fixture with permanent contraindication.
 * Clinician rejected due to patient-specific safety concern.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export const rejectedPermanentFeedback: ClinicianFeedbackEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'clinician_feedback',
  trace: {
    trace_id: 'tr-fb-reject-001',
    created_at: isoDateTime('2026-01-25T10:15:00.000Z'),
    producer: {
      system: 'gateway',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-67890',
    organization_id: 'org-ta3-alpha',
  },
  original_trace_id: 'tr-med-002',
  original_proposal_id: 'prop-med-002',
  snapshot_ref: {
    snapshot_id: 'snap-med-002',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr'],
  },
  action: 'rejected',
  occurred_at: isoDateTime('2026-01-25T10:15:00.000Z'),
  response_time_seconds: 900,
  clinician_ref: {
    clinician_id: 'clin-002',
    role: 'attending',
    specialty: 'cardiology',
  },
  rationale: {
    summary: 'Patient has documented ACE-I intolerance (angioedema history)',
    category: 'contraindication',
    confidence: 'high',
    contraindication_details: {
      condition_code: 'T78.3',
      severity: 'absolute',
    },
  },
  applies_to: {
    medication_class: 'ACE_INHIBITOR',
    is_permanent: true,
  },
  audit_redaction: {
    summary: 'Clinician rejected due to absolute contraindication',
    action: 'rejected',
    category: 'contraindication',
    response_time_bucket: '5-15min',
  },
};

/**
 * Modified feedback fixture.
 * Clinician modified the proposal with an alternative.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export const modifiedFeedback: ClinicianFeedbackEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'clinician_feedback',
  trace: {
    trace_id: 'tr-fb-modify-001',
    created_at: isoDateTime('2026-01-25T11:00:00.000Z'),
    producer: {
      system: 'gateway',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-11111',
    organization_id: 'org-ta3-alpha',
  },
  original_trace_id: 'tr-med-003',
  original_proposal_id: 'prop-med-003',
  snapshot_ref: {
    snapshot_id: 'snap-med-003',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr'],
  },
  action: 'modified',
  occurred_at: isoDateTime('2026-01-25T11:00:00.000Z'),
  response_time_seconds: 600,
  clinician_ref: {
    clinician_id: 'clin-003',
    role: 'specialist',
    specialty: 'nephrology',
  },
  rationale: {
    summary: 'Reduced dose appropriate given current renal function',
    category: 'demographic_consideration',
    confidence: 'high',
  },
  modified_action: {
    intervention_kind: 'MEDICATION_ORDER_PROPOSAL',
    summary: 'Reduced starting dose from 10mg to 5mg',
    medication_change: {
      original_proposal_summary: 'Start lisinopril 10mg daily',
      actual_action_summary: 'Start lisinopril 5mg daily',
      reason_for_alternative: 'eGFR 35 warrants conservative initial dosing',
    },
  },
  applies_to: {
    medication_specific: 'lisinopril',
    valid_until: isoDateTime('2026-04-25T00:00:00.000Z'),
    re_evaluation_trigger: 'Repeat renal function in 3 months',
  },
  audit_redaction: {
    summary: 'Clinician modified dose due to renal function',
    action: 'modified',
    category: 'demographic_consideration',
    response_time_bucket: '5-15min',
  },
};

/**
 * Deferred feedback fixture.
 * Clinician needs more information before deciding.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export const deferredFeedback: ClinicianFeedbackEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'clinician_feedback',
  trace: {
    trace_id: 'tr-fb-defer-001',
    created_at: isoDateTime('2026-01-25T10:05:00.000Z'),
    producer: {
      system: 'gateway',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-22222',
    organization_id: 'org-ta3-alpha',
  },
  original_trace_id: 'tr-med-004',
  original_proposal_id: 'prop-med-004',
  snapshot_ref: {
    snapshot_id: 'snap-med-004',
    created_at: isoDateTime('2026-01-25T09:55:00.000Z'),
    sources: ['ehr'],
  },
  action: 'deferred',
  occurred_at: isoDateTime('2026-01-25T10:05:00.000Z'),
  response_time_seconds: 300,
  clinician_ref: {
    clinician_id: 'clin-004',
    role: 'primary_care',
  },
  rationale: {
    summary: 'Awaiting recent potassium level before proceeding with ACE-I titration',
    category: 'missing_context',
    confidence: 'medium',
  },
  audit_redaction: {
    summary: 'Clinician deferred pending lab results',
    action: 'deferred',
    category: 'missing_context',
    response_time_bucket: '1-5min',
  },
};

/**
 * Feedback with conflict.
 * Demonstrates disagreement with prior clinician decision.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export const conflictingFeedback: ClinicianFeedbackEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'clinician_feedback',
  trace: {
    trace_id: 'tr-fb-conflict-001',
    created_at: isoDateTime('2026-01-25T14:00:00.000Z'),
    producer: {
      system: 'gateway',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-33333',
    organization_id: 'org-ta3-alpha',
  },
  original_trace_id: 'tr-med-005',
  original_proposal_id: 'prop-med-005',
  snapshot_ref: {
    snapshot_id: 'snap-med-005',
    created_at: isoDateTime('2026-01-25T13:55:00.000Z'),
    sources: ['ehr'],
  },
  action: 'accepted',
  occurred_at: isoDateTime('2026-01-25T14:00:00.000Z'),
  response_time_seconds: 300,
  clinician_ref: {
    clinician_id: 'clin-005',
    role: 'specialist',
    specialty: 'cardiology',
  },
  rationale: {
    summary: 'Benefits outweigh risks; prior rejection overly conservative',
    category: 'clinical_judgment',
    confidence: 'high',
  },
  conflicts_with_prior_feedback: {
    prior_trace_id: 'tr-fb-reject-prior-001',
    prior_action: 'rejected',
    conflict_type: 'reversal',
    resolution_note: 'Specialist overrides primary care decision with documented rationale',
  },
  audit_redaction: {
    summary: 'Specialist accepted proposal, reversing prior rejection',
    action: 'accepted',
    category: 'clinical_judgment',
    response_time_bucket: '1-5min',
  },
};
