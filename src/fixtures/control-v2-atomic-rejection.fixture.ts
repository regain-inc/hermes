/**
 * Conformance fixture §6.3 — Atomic batch rejection.
 * @module fixtures/control-v2-atomic-rejection
 */

import type { ControlCommandStatus, ControlCommandV2 } from '../types/control-v2';
import type { IsoDateTime } from '../types/core';

function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * SET_OPERATIONAL_SETTINGS with a valid and an invalid key — atomic rejection.
 */
export const atomicRejectionCommand: ControlCommandV2 = {
  hermes_version: '2.0.0',
  message_type: 'control_command_v2',
  command_id: 'cmd-atomic-rejection-001',
  created_at: isoDateTime('2025-01-15T10:10:00.000Z'),
  source: { system: 'popper', service_version: '2.0.0' },
  target: { system: 'deutsch' },
  kind: 'SET_OPERATIONAL_SETTINGS',
  priority: 'ROUTINE',
  settings: [
    { key: 'autonomy.max_risk_level', value: 'low' },
    { key: 'nonexistent.setting_key', value: 'any_value' },
  ],
  idempotency_key: 'idem-atomic-rejection-001',
  audit_redaction: { summary: 'Batch setting change with invalid key (atomic rejection test)' },
};

/** Conformance fixture shape for §6.3 */
export interface AtomicRejectionConformanceFixture {
  readonly fixture_id: string;
  readonly description: string;
  readonly input: ControlCommandV2;
  readonly expected_response: {
    readonly status: ControlCommandStatus;
    readonly setting_results: readonly {
      readonly key: string;
      readonly status: 'APPLIED' | 'REJECTED';
    }[];
    readonly reason: string;
  };
  readonly expected_audit_events: readonly string[];
}

/**
 * Conformance fixture §6.3 — expected request/response pair.
 * Both settings REJECTED due to atomic batch semantics.
 */
export const atomicRejectionFixture: AtomicRejectionConformanceFixture = {
  fixture_id: 'hermes-v2-atomic-rejection-001',
  description: 'Batch with valid + invalid setting key — atomic REJECTED',
  input: atomicRejectionCommand,
  expected_response: {
    status: 'REJECTED',
    setting_results: [
      { key: 'autonomy.max_risk_level', status: 'REJECTED' },
      { key: 'nonexistent.setting_key', status: 'REJECTED' },
    ],
    reason: 'Atomic batch rejection: unknown setting key nonexistent.setting_key',
  },
  expected_audit_events: ['CONTROL_COMMAND_RECEIVED', 'CONTROL_COMMAND_REJECTED'],
};
