/**
 * Tests for Audit Event types
 */

import { describe, expect, it } from 'bun:test';
import { createIsoDateTime } from '../utils/datetime';
import { createTraceContext } from '../utils/trace';
import { AUDIT_EMISSION_REQUIREMENTS, AUDIT_EVENT_TYPES, type AuditEvent } from './audit';
import type { SubjectRef } from './core';
import { CURRENT_HERMES_VERSION } from './core';

// =============================================================================
// Test Fixtures
// =============================================================================

function createTestSubject(): SubjectRef {
  return {
    subject_type: 'patient',
    subject_id: 'patient_test_123',
    organization_id: 'org_test',
  };
}

// =============================================================================
// AuditEventType Tests
// =============================================================================

describe('AuditEventType', () => {
  it('should have all expected event types', () => {
    expect(AUDIT_EVENT_TYPES).toContain('SUPERVISION_REQUEST_SENT');
    expect(AUDIT_EVENT_TYPES).toContain('SUPERVISION_REQUEST_RECEIVED');
    expect(AUDIT_EVENT_TYPES).toContain('SUPERVISION_RESPONSE_DECIDED');
    expect(AUDIT_EVENT_TYPES).toContain('SUPERVISION_RESPONSE_RECEIVED');
    expect(AUDIT_EVENT_TYPES).toContain('CONTROL_COMMAND_ISSUED');
    expect(AUDIT_EVENT_TYPES).toContain('CONTROL_COMMAND_APPLIED');
    expect(AUDIT_EVENT_TYPES).toContain('SAFE_MODE_ENABLED');
    expect(AUDIT_EVENT_TYPES).toContain('SAFE_MODE_DISABLED');
    expect(AUDIT_EVENT_TYPES).toContain('OUTPUT_RETURNED');
    expect(AUDIT_EVENT_TYPES).toContain('VALIDATION_FAILED');
    expect(AUDIT_EVENT_TYPES).toContain('OTHER');
    expect(AUDIT_EVENT_TYPES).toHaveLength(11);
  });
});

// =============================================================================
// Audit Emission Requirements Tests
// =============================================================================

describe('Audit Emission Requirements', () => {
  it('should document control command emission requirements', () => {
    expect(AUDIT_EMISSION_REQUIREMENTS.CONTROL_COMMAND_ISSUED).toBeDefined();
    expect(AUDIT_EMISSION_REQUIREMENTS.CONTROL_COMMAND_APPLIED).toBeDefined();
    expect(AUDIT_EMISSION_REQUIREMENTS.VALIDATION_FAILED).toBeDefined();
  });
});

// =============================================================================
// AuditEvent Tests
// =============================================================================

describe('AuditEvent', () => {
  it('should create a valid supervision request sent event', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'SUPERVISION_REQUEST_SENT',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Deutsch sent supervision request for medication proposal',
    };

    expect(event.message_type).toBe('audit_event');
    expect(event.event_type).toBe('SUPERVISION_REQUEST_SENT');
  });

  it('should create a valid supervision response decided event', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'SUPERVISION_RESPONSE_DECIDED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Popper decided: ROUTE_TO_CLINICIAN',
      tags: {
        decision: 'ROUTE_TO_CLINICIAN',
        reason: 'high_uncertainty',
      },
    };

    expect(event.event_type).toBe('SUPERVISION_RESPONSE_DECIDED');
    expect(event.tags?.decision).toBe('ROUTE_TO_CLINICIAN');
  });

  it('should create a valid control command issued event', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'CONTROL_COMMAND_ISSUED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Safe mode enabled due to drift detection',
      tags: {
        command_kind: 'SET_SAFE_MODE',
        enabled: 'true',
      },
    };

    expect(event.event_type).toBe('CONTROL_COMMAND_ISSUED');
    expect(event.tags?.command_kind).toBe('SET_SAFE_MODE');
  });

  it('should create a valid control command applied event', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'CONTROL_COMMAND_APPLIED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Deutsch applied safe mode command',
      tags: {
        command_id: 'cmd_123',
        applied_by: 'deutsch',
      },
    };

    expect(event.event_type).toBe('CONTROL_COMMAND_APPLIED');
  });

  it('should create a valid validation failed event', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'VALIDATION_FAILED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Signature verification failed',
      tags: {
        failure_type: 'signature_mismatch',
        severity: 'critical',
      },
    };

    expect(event.event_type).toBe('VALIDATION_FAILED');
    expect(event.tags?.failure_type).toBe('signature_mismatch');
  });

  it('should create a valid safe mode enabled event', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'SAFE_MODE_ENABLED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Safe mode enabled for organization',
      tags: {
        reason: 'drift_detected',
        scope: 'organization',
      },
    };

    expect(event.event_type).toBe('SAFE_MODE_ENABLED');
  });

  it('should support OTHER event type with custom type', () => {
    const trace = createTraceContext({
      system: 'gateway',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'OTHER',
      other_event_type: 'CLINICIAN_PORTAL_LOGIN',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'advocate_clinical',
      subject: createTestSubject(),
      summary: 'Clinician logged into portal',
      tags: {
        portal: 'clinical_dashboard',
      },
    };

    expect(event.event_type).toBe('OTHER');
    expect(event.other_event_type).toBe('CLINICIAN_PORTAL_LOGIN');
  });

  it('should support wellness mode', () => {
    const trace = createTraceContext({
      system: 'deutsch',
      service_version: '1.0.0',
    });

    const event: AuditEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'audit_event',
      event_type: 'OUTPUT_RETURNED',
      occurred_at: createIsoDateTime(),
      trace,
      mode: 'wellness',
      subject: {
        subject_type: 'patient',
        subject_id: 'user_wellness_123',
      },
      summary: 'Lifestyle recommendation delivered',
    };

    expect(event.mode).toBe('wellness');
    expect(event.event_type).toBe('OUTPUT_RETURNED');
  });
});
