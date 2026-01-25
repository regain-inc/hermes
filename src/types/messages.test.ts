/**
 * Tests for Hermes Message union types and type guards
 */

import { describe, expect, it } from 'bun:test';
import { createIsoDateTime } from '../utils/datetime';
import { createTraceContext } from '../utils/trace';
import type { AuditEvent } from './audit';
import type { BiasDetectionEvent } from './bias';
import type { SubjectRef } from './core';
import { CURRENT_HERMES_VERSION } from './core';
import type { HermesError } from './errors';
import type { ClinicianFeedbackEvent } from './feedback';
import {
  HERMES_EVENT_TYPES,
  HERMES_MESSAGE_TYPES,
  type HermesMessage,
  isAuditEvent,
  isBiasDetectionEvent,
  isClinicianFeedbackEvent,
  isHermesError,
  isHermesEvent,
  isSupervisionRequest,
  isSupervisionResponse,
} from './messages';
import type { MedicationOrderProposal } from './proposals';
import type { HealthStateSnapshotRef } from './snapshot';
import type { SupervisionRequest, SupervisionResponse } from './supervision';

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

function createTestSupervisionRequest(): SupervisionRequest {
  const trace = createTraceContext({
    system: 'deutsch',
    service_version: '1.0.0',
  });

  return {
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
}

function createTestSupervisionResponse(): SupervisionResponse {
  const trace = createTraceContext({
    system: 'popper',
    service_version: '1.0.0',
  });

  return {
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
}

function createTestAuditEvent(): AuditEvent {
  const trace = createTraceContext({
    system: 'deutsch',
    service_version: '1.0.0',
  });

  return {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'audit_event',
    event_type: 'SUPERVISION_REQUEST_SENT',
    occurred_at: createIsoDateTime(),
    trace,
    mode: 'advocate_clinical',
    subject: createTestSubject(),
    summary: 'Supervision request sent',
  };
}

function createTestHermesError(): HermesError {
  return {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'error',
    code: 'invalid_schema',
    message: 'Schema validation failed',
  };
}

function createTestClinicianFeedbackEvent(): ClinicianFeedbackEvent {
  const trace = createTraceContext({
    system: 'gateway',
    service_version: '1.0.0',
  });

  return {
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
    clinician_ref: {
      clinician_id: 'clin_123',
      role: 'attending',
    },
    rationale: {
      summary: 'Appropriate treatment',
      category: 'clinical_judgment',
      confidence: 'high',
    },
    audit_redaction: {
      summary: 'Clinician accepted',
      action: 'accepted',
      category: 'clinical_judgment',
    },
  };
}

function createTestBiasDetectionEvent(): BiasDetectionEvent {
  const trace = createTraceContext({
    system: 'popper',
    service_version: '1.0.0',
  });

  return {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'bias_detection',
    trace,
    mode: 'advocate_clinical',
    organization_id: 'org_ta3_alpha',
    detection_id: 'bias_001',
    detection_type: 'demographic_override_disparity',
    severity: 'warning',
    detected_at: createIsoDateTime(),
    analysis_period: {
      start: createIsoDateTime(),
      end: createIsoDateTime(),
      days: 30,
    },
    affected_dimension: {
      dimension_type: 'age_group',
      dimension_value: 'geriatric',
    },
    metrics: {
      overall_override_rate: 0.15,
      affected_group_override_rate: 0.25,
      control_group_override_rate: 0.1,
      rate_difference: 0.15,
      rate_ratio: 2.5,
      sample_size_affected: 150,
      sample_size_control: 200,
    },
    recommendations: [],
    audit_redaction: {
      summary: 'Bias detected',
      detection_type: 'demographic_override_disparity',
      severity: 'warning',
      affected_dimension: 'age_group:geriatric',
      rate_difference: '15%',
      recommendations_count: 0,
    },
  };
}

// =============================================================================
// Message Types Constants Tests
// =============================================================================

describe('HERMES_MESSAGE_TYPES', () => {
  it('should have all expected message types', () => {
    expect(HERMES_MESSAGE_TYPES).toContain('supervision_request');
    expect(HERMES_MESSAGE_TYPES).toContain('supervision_response');
    expect(HERMES_MESSAGE_TYPES).toContain('audit_event');
    expect(HERMES_MESSAGE_TYPES).toContain('error');
    expect(HERMES_MESSAGE_TYPES).toContain('clinician_feedback');
    expect(HERMES_MESSAGE_TYPES).toContain('bias_detection');
    expect(HERMES_MESSAGE_TYPES).toHaveLength(6);
  });
});

describe('HERMES_EVENT_TYPES', () => {
  it('should have all expected event types', () => {
    expect(HERMES_EVENT_TYPES).toContain('audit_event');
    expect(HERMES_EVENT_TYPES).toContain('clinician_feedback');
    expect(HERMES_EVENT_TYPES).toContain('bias_detection');
    expect(HERMES_EVENT_TYPES).toHaveLength(3);
  });
});

// =============================================================================
// Type Guard Tests: isSupervisionRequest
// =============================================================================

describe('isSupervisionRequest', () => {
  it('should return true for SupervisionRequest', () => {
    const msg: HermesMessage = createTestSupervisionRequest();
    expect(isSupervisionRequest(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isSupervisionRequest(createTestSupervisionResponse())).toBe(false);
    expect(isSupervisionRequest(createTestAuditEvent())).toBe(false);
    expect(isSupervisionRequest(createTestHermesError())).toBe(false);
    expect(isSupervisionRequest(createTestClinicianFeedbackEvent())).toBe(false);
    expect(isSupervisionRequest(createTestBiasDetectionEvent())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestSupervisionRequest();
    if (isSupervisionRequest(msg)) {
      // TypeScript should know msg is SupervisionRequest here
      expect(msg.proposals).toBeDefined();
      expect(msg.proposals.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// Type Guard Tests: isSupervisionResponse
// =============================================================================

describe('isSupervisionResponse', () => {
  it('should return true for SupervisionResponse', () => {
    const msg: HermesMessage = createTestSupervisionResponse();
    expect(isSupervisionResponse(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isSupervisionResponse(createTestSupervisionRequest())).toBe(false);
    expect(isSupervisionResponse(createTestAuditEvent())).toBe(false);
    expect(isSupervisionResponse(createTestHermesError())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestSupervisionResponse();
    if (isSupervisionResponse(msg)) {
      // TypeScript should know msg is SupervisionResponse here
      expect(msg.decision).toBe('APPROVED');
      expect(msg.reason_codes).toBeDefined();
    }
  });
});

// =============================================================================
// Type Guard Tests: isAuditEvent
// =============================================================================

describe('isAuditEvent', () => {
  it('should return true for AuditEvent', () => {
    const msg: HermesMessage = createTestAuditEvent();
    expect(isAuditEvent(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isAuditEvent(createTestSupervisionRequest())).toBe(false);
    expect(isAuditEvent(createTestSupervisionResponse())).toBe(false);
    expect(isAuditEvent(createTestHermesError())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestAuditEvent();
    if (isAuditEvent(msg)) {
      // TypeScript should know msg is AuditEvent here
      expect(msg.event_type).toBe('SUPERVISION_REQUEST_SENT');
      expect(msg.occurred_at).toBeDefined();
    }
  });
});

// =============================================================================
// Type Guard Tests: isHermesError
// =============================================================================

describe('isHermesError', () => {
  it('should return true for HermesError', () => {
    const msg: HermesMessage = createTestHermesError();
    expect(isHermesError(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isHermesError(createTestSupervisionRequest())).toBe(false);
    expect(isHermesError(createTestSupervisionResponse())).toBe(false);
    expect(isHermesError(createTestAuditEvent())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestHermesError();
    if (isHermesError(msg)) {
      // TypeScript should know msg is HermesError here
      expect(msg.code).toBe('invalid_schema');
      expect(msg.message).toBeDefined();
    }
  });
});

// =============================================================================
// Type Guard Tests: isClinicianFeedbackEvent
// =============================================================================

describe('isClinicianFeedbackEvent', () => {
  it('should return true for ClinicianFeedbackEvent', () => {
    const msg: HermesMessage = createTestClinicianFeedbackEvent();
    expect(isClinicianFeedbackEvent(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isClinicianFeedbackEvent(createTestSupervisionRequest())).toBe(false);
    expect(isClinicianFeedbackEvent(createTestSupervisionResponse())).toBe(false);
    expect(isClinicianFeedbackEvent(createTestAuditEvent())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestClinicianFeedbackEvent();
    if (isClinicianFeedbackEvent(msg)) {
      // TypeScript should know msg is ClinicianFeedbackEvent here
      expect(msg.action).toBe('accepted');
      expect(msg.rationale).toBeDefined();
      expect(msg.clinician_ref).toBeDefined();
    }
  });
});

// =============================================================================
// Type Guard Tests: isBiasDetectionEvent
// =============================================================================

describe('isBiasDetectionEvent', () => {
  it('should return true for BiasDetectionEvent', () => {
    const msg: HermesMessage = createTestBiasDetectionEvent();
    expect(isBiasDetectionEvent(msg)).toBe(true);
  });

  it('should return false for other message types', () => {
    expect(isBiasDetectionEvent(createTestSupervisionRequest())).toBe(false);
    expect(isBiasDetectionEvent(createTestSupervisionResponse())).toBe(false);
    expect(isBiasDetectionEvent(createTestAuditEvent())).toBe(false);
  });

  it('should narrow type correctly', () => {
    const msg: HermesMessage = createTestBiasDetectionEvent();
    if (isBiasDetectionEvent(msg)) {
      // TypeScript should know msg is BiasDetectionEvent here
      expect(msg.detection_type).toBe('demographic_override_disparity');
      expect(msg.metrics).toBeDefined();
      expect(msg.affected_dimension).toBeDefined();
    }
  });
});

// =============================================================================
// Type Guard Tests: isHermesEvent
// =============================================================================

describe('isHermesEvent', () => {
  it('should return true for all event types', () => {
    expect(isHermesEvent(createTestAuditEvent())).toBe(true);
    expect(isHermesEvent(createTestClinicianFeedbackEvent())).toBe(true);
    expect(isHermesEvent(createTestBiasDetectionEvent())).toBe(true);
  });

  it('should return false for non-event message types', () => {
    expect(isHermesEvent(createTestSupervisionRequest())).toBe(false);
    expect(isHermesEvent(createTestSupervisionResponse())).toBe(false);
    expect(isHermesEvent(createTestHermesError())).toBe(false);
  });
});

// =============================================================================
// Discriminated Union Tests
// =============================================================================

describe('HermesMessage discriminated union', () => {
  it('should support switch on message_type', () => {
    const messages: HermesMessage[] = [
      createTestSupervisionRequest(),
      createTestSupervisionResponse(),
      createTestAuditEvent(),
      createTestHermesError(),
      createTestClinicianFeedbackEvent(),
      createTestBiasDetectionEvent(),
    ];

    for (const msg of messages) {
      switch (msg.message_type) {
        case 'supervision_request':
          expect(msg.proposals).toBeDefined();
          break;
        case 'supervision_response':
          expect(msg.decision).toBeDefined();
          break;
        case 'audit_event':
          expect(msg.event_type).toBeDefined();
          break;
        case 'error':
          expect(msg.code).toBeDefined();
          break;
        case 'clinician_feedback':
          expect(msg.action).toBeDefined();
          break;
        case 'bias_detection':
          expect(msg.detection_type).toBeDefined();
          break;
        default: {
          // TypeScript should warn if we miss a case
          const _exhaustive: never = msg;
          throw new Error(`Unhandled message type: ${(_exhaustive as HermesMessage).message_type}`);
        }
      }
    }
  });
});
