/**
 * SupervisionResponse fixtures for testing and examples.
 * @module fixtures/supervision-response
 */

import type { IsoDateTime } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';
import type { SupervisionResponse } from '../types/supervision';

/**
 * Helper to create IsoDateTime values.
 */
function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * Approved response fixture.
 * Demonstrates successful supervision with no constraints.
 */
export const approvedSupervisionResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
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
  decision: 'APPROVED',
  reason_codes: [],
  explanation: 'All proposals meet safety criteria.',
  safe_mode_state_used: {
    enabled: false,
  },
  audit_redaction: {
    summary: 'Supervision approved',
    decision: 'APPROVED',
    reason_codes: [],
  },
};

/**
 * Approved with constraints response.
 * Demonstrates conditional approval with time-based routing.
 */
export const approvedWithConstraintsResponse: SupervisionResponse = {
  ...approvedSupervisionResponse,
  trace: {
    ...approvedSupervisionResponse.trace,
    trace_id: 'tr-constrained-001',
  },
  decision: 'APPROVED',
  reason_codes: ['approved_with_constraints'],
  explanation: 'Approved with monitoring requirement.',
  approved_constraints: {
    must_route_after: isoDateTime('2026-01-26T10:00:00.000Z'),
    allowed_actions: ['PATIENT_MESSAGE', 'CARE_NAVIGATION'],
  },
  audit_redaction: {
    summary: 'Supervision approved with constraints',
    decision: 'APPROVED',
    reason_codes: ['approved_with_constraints'],
  },
};

/**
 * Route to clinician response.
 * Demonstrates routing due to weak evidence or high uncertainty.
 */
export const routeSupervisionResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-route-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
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
  decision: 'ROUTE_TO_CLINICIAN',
  reason_codes: ['high_uncertainty', 'weak_evidence_grade'],
  explanation: 'Evidence grade below threshold for autonomous approval.',
  per_proposal_decisions: [
    {
      proposal_id: 'prop-001',
      decision: 'ROUTE_TO_CLINICIAN',
      reason_codes: ['weak_evidence_grade'],
      explanation: 'Expert opinion only; requires clinician review.',
    },
  ],
  safe_mode_state_used: {
    enabled: false,
  },
  audit_redaction: {
    summary: 'Routed to clinician due to weak evidence',
    decision: 'ROUTE_TO_CLINICIAN',
    reason_codes: ['high_uncertainty', 'weak_evidence_grade'],
  },
};

/**
 * Hard stop response.
 * Demonstrates policy violation or critical safety concern.
 */
export const hardStopSupervisionResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-stop-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
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
  decision: 'HARD_STOP',
  reason_codes: ['policy_violation', 'risk_too_high'],
  explanation: 'Proposed medication contraindicated per current records.',
  safe_mode_state_used: {
    enabled: false,
  },
  audit_redaction: {
    summary: 'Hard stop due to contraindication',
    decision: 'HARD_STOP',
    reason_codes: ['policy_violation', 'risk_too_high'],
  },
};

/**
 * Request more info response.
 * Demonstrates need for additional data before decision.
 */
export const requestMoreInfoResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-info-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
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
    quality: {
      missing_signals: ['serum_potassium', 'serum_creatinine'],
    },
  },
  decision: 'REQUEST_MORE_INFO',
  reason_codes: ['insufficient_evidence', 'data_quality_warning'],
  explanation: 'Missing required lab values for medication safety assessment.',
  safe_mode_state_used: {
    enabled: false,
  },
  audit_redaction: {
    summary: 'Request more info due to missing labs',
    decision: 'REQUEST_MORE_INFO',
    reason_codes: ['insufficient_evidence', 'data_quality_warning'],
  },
};

/**
 * Partial approval response for multi-domain composition.
 * Demonstrates per-proposal decisions.
 */
export const partialApprovalResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-partial-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
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
    sources: ['ehr', 'wearable', 'patient_reported'],
  },
  request_idempotency_key: 'idem-partial-001',
  response_timestamp: isoDateTime('2026-01-25T10:00:05.000Z'),
  decision: 'ROUTE_TO_CLINICIAN',
  reason_codes: ['needs_human_review'],
  explanation: 'Medication change requires clinician review; lifestyle recommendations approved.',
  per_proposal_decisions: [
    {
      proposal_id: 'prop-med-001',
      decision: 'ROUTE_TO_CLINICIAN',
      reason_codes: ['needs_human_review', 'risk_too_high'],
      explanation: 'Medication titration with drug-nutrient interaction',
    },
    {
      proposal_id: 'prop-nutr-001',
      decision: 'APPROVED',
      reason_codes: ['approved_with_constraints'],
      explanation: 'Nutrition plan approved with potassium constraint',
    },
    {
      proposal_id: 'prop-exer-001',
      decision: 'APPROVED',
      reason_codes: [],
      explanation: 'Exercise plan approved',
    },
  ],
  conflict_evaluations: [
    {
      conflict_id: 'conflict-001',
      popper_agrees_with_resolution: true,
    },
  ],
  safe_mode_state_used: {
    enabled: false,
  },
  audit_redaction: {
    summary: 'Partial approval: medication routed, lifestyle approved',
    decision: 'ROUTE_TO_CLINICIAN',
    reason_codes: ['needs_human_review'],
  },
};

/**
 * Response with control commands.
 * Demonstrates safe mode activation.
 */
export const responseWithControlCommands: SupervisionResponse = {
  ...hardStopSupervisionResponse,
  trace: {
    ...hardStopSupervisionResponse.trace,
    trace_id: 'tr-control-001',
  },
  control_commands: [
    {
      command_id: 'cmd-001',
      kind: 'SET_SAFE_MODE',
      created_at: isoDateTime('2026-01-25T10:00:05.000Z'),
      safe_mode: {
        enabled: true,
        reason: 'Critical safety signal detected',
        effective_at: isoDateTime('2026-01-25T10:00:05.000Z'),
        effective_until: isoDateTime('2026-01-25T22:00:00.000Z'),
      },
      audit_redaction: {
        summary: 'Safe mode enabled due to critical safety signal',
      },
    },
  ],
};
