/**
 * Conformance fixture §6.2 — Emergency mode transition.
 * @module fixtures/control-v2-emergency-mode
 */

import type { ControlCommandStatus, ControlCommandV2, OperationalMode } from '../types/control-v2';
import type { IsoDateTime } from '../types/core';

function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * SET_OPERATIONAL_MODE to SAFE_MODE with EMERGENCY priority.
 */
export const emergencyModeCommand: ControlCommandV2 = {
  hermes_version: '2.0.0',
  message_type: 'control_command_v2',
  command_id: 'cmd-emergency-mode-001',
  created_at: isoDateTime('2025-01-15T10:05:00.000Z'),
  source: { system: 'popper', service_version: '2.0.0' },
  target: { system: 'deutsch' },
  kind: 'SET_OPERATIONAL_MODE',
  priority: 'EMERGENCY',
  mode_transition: {
    target_mode: 'SAFE_MODE',
    reason: 'Critical safety concern detected',
  },
  idempotency_key: 'idem-emergency-mode-001',
  audit_redaction: { summary: 'Emergency transition to SAFE_MODE' },
};

/** Conformance fixture shape for §6.2 */
export interface EmergencyModeConformanceFixture {
  readonly fixture_id: string;
  readonly description: string;
  readonly input: ControlCommandV2;
  readonly expected_response: {
    readonly status: ControlCommandStatus;
    readonly settings_snapshot: {
      readonly operational_mode: OperationalMode;
      readonly safe_mode: { readonly enabled: boolean; readonly reason: string };
    };
  };
  readonly timing_constraint_ms: number;
  readonly expected_audit_events: readonly string[];
}

/**
 * Conformance fixture §6.2 — expected request/response pair.
 * Timing constraint: 100ms RTT for EMERGENCY priority.
 */
export const emergencyModeFixture: EmergencyModeConformanceFixture = {
  fixture_id: 'hermes-v2-emergency-mode-001',
  description: 'Emergency transition to SAFE_MODE — EMERGENCY priority, 100ms RTT',
  input: emergencyModeCommand,
  expected_response: {
    status: 'APPLIED',
    settings_snapshot: {
      operational_mode: 'SAFE_MODE',
      safe_mode: { enabled: true, reason: 'Critical safety concern detected' },
    },
  },
  timing_constraint_ms: 100,
  expected_audit_events: ['CONTROL_COMMAND_RECEIVED', 'CONTROL_COMMAND_APPLIED'],
};
