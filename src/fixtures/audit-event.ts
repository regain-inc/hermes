/**
 * AuditEvent fixtures for testing and examples.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4
 * @module fixtures/audit-event
 */

import type { AuditEvent } from '../types/audit';
import type { IsoDateTime } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';

/**
 * Helper to create IsoDateTime values.
 */
function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * Supervision request sent audit event.
 * Emitted when Deutsch sends a supervision request to Popper.
 */
export const supervisionRequestSentEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'SUPERVISION_REQUEST_SENT',
  occurred_at: isoDateTime('2026-01-25T10:00:00.000Z'),
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
  summary: 'Supervision request sent with 1 medication proposal',
  tags: {
    proposal_count: '1',
    proposal_types: 'MEDICATION_ORDER_PROPOSAL',
  },
};

/**
 * Supervision request received audit event.
 * Emitted when Popper receives a supervision request.
 */
export const supervisionRequestReceivedEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'SUPERVISION_REQUEST_RECEIVED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.010Z'),
  trace: {
    trace_id: 'tr-001',
    span_id: 'sp-popper-001',
    parent_span_id: 'sp-deutsch-001',
    created_at: isoDateTime('2026-01-25T10:00:00.010Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  summary: 'Supervision request received for evaluation',
};

/**
 * Supervision response decided audit event.
 * Emitted when Popper makes a supervision decision.
 */
export const supervisionResponseDecidedEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'SUPERVISION_RESPONSE_DECIDED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.050Z'),
  trace: {
    trace_id: 'tr-001',
    span_id: 'sp-popper-001',
    created_at: isoDateTime('2026-01-25T10:00:00.050Z'),
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
  summary: 'Supervision decision: APPROVED',
  tags: {
    decision: 'APPROVED',
    latency_ms: '40',
  },
};

/**
 * Control command issued audit event.
 * Emitted when Popper issues a control command (e.g., safe mode).
 */
export const controlCommandIssuedEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'CONTROL_COMMAND_ISSUED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.050Z'),
  trace: {
    trace_id: 'tr-001',
    created_at: isoDateTime('2026-01-25T10:00:00.050Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  summary: 'Control command issued: SET_SAFE_MODE enabled',
  tags: {
    command_kind: 'SET_SAFE_MODE',
    safe_mode_enabled: 'true',
  },
};

/**
 * Safe mode enabled audit event.
 * Emitted when safe mode is activated system-wide.
 */
export const safeModeEnabledEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'SAFE_MODE_ENABLED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.060Z'),
  trace: {
    trace_id: 'tr-safe-001',
    created_at: isoDateTime('2026-01-25T10:00:00.060Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  summary: 'Safe mode enabled due to critical safety signal',
  tags: {
    reason: 'critical_safety_signal',
    duration_hours: '12',
  },
};

/**
 * Validation failed audit event.
 * Emitted when message validation fails (integrity/replay/schema).
 */
export const validationFailedEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'VALIDATION_FAILED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.015Z'),
  trace: {
    trace_id: 'tr-invalid-001',
    created_at: isoDateTime('2026-01-25T10:00:00.015Z'),
    producer: {
      system: 'popper',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
    organization_id: 'org-ta3-alpha',
  },
  summary: 'Validation failed: signature verification failed',
  tags: {
    failure_type: 'signature_invalid',
    action_taken: 'message_rejected',
  },
};

/**
 * Output returned audit event.
 * Emitted when Deutsch returns output to the patient/clinician.
 */
export const outputReturnedEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'OUTPUT_RETURNED',
  occurred_at: isoDateTime('2026-01-25T10:00:00.100Z'),
  trace: {
    trace_id: 'tr-001',
    created_at: isoDateTime('2026-01-25T10:00:00.100Z'),
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
  summary: 'Patient message delivered',
  tags: {
    output_type: 'PATIENT_MESSAGE',
    channel: 'app_notification',
  },
};

/**
 * Other event type audit event.
 * Demonstrates custom event types.
 */
export const otherAuditEvent: AuditEvent = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'audit_event',
  event_type: 'OTHER',
  other_event_type: 'CLINICIAN_OVERRIDE_RECORDED',
  occurred_at: isoDateTime('2026-01-25T10:30:00.000Z'),
  trace: {
    trace_id: 'tr-override-001',
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
  summary: 'Clinician override recorded for medication proposal',
  tags: {
    override_action: 'rejected',
    override_category: 'contraindication',
  },
};
