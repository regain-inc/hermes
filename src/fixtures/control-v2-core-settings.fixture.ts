/**
 * Conformance fixture §6.1 — Core operational settings change.
 * @module fixtures/control-v2-core-settings
 */

import type { ControlCommandStatus, ControlCommandV2 } from '../types/control-v2';
import type { IsoDateTime } from '../types/core';

function isoDateTime(value: string): IsoDateTime {
  return value as IsoDateTime;
}

/**
 * SET_OPERATIONAL_SETTINGS command reducing max_risk_level to 'low', ROUTINE priority.
 */
export const coreSettingsCommand: ControlCommandV2 = {
  hermes_version: '2.0.0',
  message_type: 'control_command_v2',
  command_id: 'cmd-core-settings-001',
  created_at: isoDateTime('2025-01-15T10:00:00.000Z'),
  source: { system: 'popper', service_version: '2.0.0' },
  target: { system: 'deutsch' },
  kind: 'SET_OPERATIONAL_SETTINGS',
  priority: 'ROUTINE',
  settings: [{ key: 'autonomy.max_risk_level', value: 'low' }],
  idempotency_key: 'idem-core-settings-001',
  audit_redaction: { summary: 'Reduce max risk level to low' },
};

/** Conformance fixture shape for §6.1 */
export interface CoreSettingsConformanceFixture {
  readonly fixture_id: string;
  readonly description: string;
  readonly input: ControlCommandV2;
  readonly expected_response: {
    readonly status: ControlCommandStatus;
    readonly setting_results: readonly {
      readonly key: string;
      readonly status: 'APPLIED' | 'REJECTED';
      readonly applied_value?: string;
    }[];
  };
  readonly expected_audit_events: readonly string[];
}

/**
 * Conformance fixture §6.1 — expected request/response pair.
 */
export const coreSettingsFixture: CoreSettingsConformanceFixture = {
  fixture_id: 'hermes-v2-core-settings-001',
  description: 'Reduce max risk level — core profile setting, ROUTINE priority',
  input: coreSettingsCommand,
  expected_response: {
    status: 'APPLIED',
    setting_results: [{ key: 'autonomy.max_risk_level', status: 'APPLIED', applied_value: 'low' }],
  },
  expected_audit_events: ['CONTROL_COMMAND_RECEIVED', 'CONTROL_COMMAND_APPLIED'],
};
