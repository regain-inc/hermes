import { describe, expect, test } from 'bun:test';
import Ajv from 'ajv/dist/2020';
import { atomicRejectionCommand } from '../fixtures/control-v2-atomic-rejection.fixture';
import { coreSettingsCommand } from '../fixtures/control-v2-core-settings.fixture';
import { emergencyModeCommand } from '../fixtures/control-v2-emergency-mode.fixture';
import schema from './hermes-message.schema.json';

const ajv = new Ajv({ strict: false });
const validate = ajv.compile(schema);

// Helper to validate against a specific $def
function validateDef(defName: string, data: unknown): boolean {
  const defSchema = {
    $ref: `#/$defs/${defName}`,
    $defs: (schema as Record<string, unknown>).$defs,
  };
  const defValidate = ajv.compile(defSchema);
  return defValidate(data);
}

describe('ControlCommandV2 schema validation', () => {
  test('validates core settings fixture command', () => {
    const valid = validateDef('ControlCommandV2', coreSettingsCommand);
    expect(valid).toBe(true);
  });

  test('validates emergency mode fixture command', () => {
    const valid = validateDef('ControlCommandV2', emergencyModeCommand);
    expect(valid).toBe(true);
  });

  test('validates atomic rejection fixture command', () => {
    const valid = validateDef('ControlCommandV2', atomicRejectionCommand);
    expect(valid).toBe(true);
  });

  test('validates as top-level Hermes message', () => {
    expect(validate(coreSettingsCommand)).toBe(true);
    expect(validate(emergencyModeCommand)).toBe(true);
    expect(validate(atomicRejectionCommand)).toBe(true);
  });

  test('rejects command with missing required fields', () => {
    const invalid = {
      hermes_version: '2.0.0',
      message_type: 'control_command_v2',
      // missing: command_id, created_at, source, target, kind, priority, idempotency_key, audit_redaction
    };
    const valid = validateDef('ControlCommandV2', invalid);
    expect(valid).toBe(false);
  });

  test('rejects command with invalid kind', () => {
    const invalid = {
      ...coreSettingsCommand,
      kind: 'INVALID_KIND',
    };
    const valid = validateDef('ControlCommandV2', invalid);
    expect(valid).toBe(false);
  });

  test('rejects command with invalid priority', () => {
    const invalid = {
      ...coreSettingsCommand,
      priority: 'CRITICAL',
    };
    const valid = validateDef('ControlCommandV2', invalid);
    expect(valid).toBe(false);
  });
});

describe('ControlCommandResponse schema validation', () => {
  const appliedResponse = {
    hermes_version: '2.0.0',
    message_type: 'control_command_response',
    command_id: 'cmd-core-settings-001',
    response_id: 'resp-001',
    received_at: '2025-01-15T10:00:00.100Z',
    responded_at: '2025-01-15T10:00:00.150Z',
    source: { system: 'deutsch', service_version: '2.0.0' },
    status: 'APPLIED',
    setting_results: [{ key: 'autonomy.max_risk_level', status: 'APPLIED', applied_value: 'low' }],
    audit_redaction: { summary: 'Command applied: reduce max risk level' },
  };

  const rejectedResponse = {
    hermes_version: '2.0.0',
    message_type: 'control_command_response',
    command_id: 'cmd-atomic-rejection-001',
    response_id: 'resp-002',
    received_at: '2025-01-15T10:10:00.100Z',
    responded_at: '2025-01-15T10:10:00.150Z',
    source: { system: 'deutsch', service_version: '2.0.0' },
    status: 'REJECTED',
    reason: 'Unknown setting key: nonexistent.setting_key',
    setting_results: [
      { key: 'autonomy.max_risk_level', status: 'REJECTED' },
      { key: 'nonexistent.setting_key', status: 'REJECTED' },
    ],
    audit_redaction: { summary: 'Command rejected: atomic batch failure' },
  };

  const deferredResponse = {
    hermes_version: '2.0.0',
    message_type: 'control_command_response',
    command_id: 'cmd-deferred-001',
    response_id: 'resp-003',
    received_at: '2025-01-15T10:15:00.100Z',
    responded_at: '2025-01-15T10:15:00.150Z',
    source: { system: 'deutsch', service_version: '2.0.0' },
    status: 'DEFERRED',
    deferred: {
      estimated_apply_at: '2025-01-15T11:00:00.000Z',
      retry_after_ms: 5000,
    },
    audit_redaction: { summary: 'Command deferred: pending maintenance window' },
  };

  test('validates APPLIED response', () => {
    const valid = validateDef('ControlCommandResponse', appliedResponse);
    expect(valid).toBe(true);
  });

  test('validates REJECTED response', () => {
    const valid = validateDef('ControlCommandResponse', rejectedResponse);
    expect(valid).toBe(true);
  });

  test('validates DEFERRED response', () => {
    const valid = validateDef('ControlCommandResponse', deferredResponse);
    expect(valid).toBe(true);
  });

  test('validates responses as top-level Hermes messages', () => {
    expect(validate(appliedResponse)).toBe(true);
    expect(validate(rejectedResponse)).toBe(true);
    expect(validate(deferredResponse)).toBe(true);
  });

  test('rejects response with missing required fields', () => {
    const invalid = {
      hermes_version: '2.0.0',
      message_type: 'control_command_response',
      // missing required fields
    };
    const valid = validateDef('ControlCommandResponse', invalid);
    expect(valid).toBe(false);
  });

  test('rejects response with invalid status', () => {
    const invalid = {
      ...appliedResponse,
      status: 'PENDING',
    };
    const valid = validateDef('ControlCommandResponse', invalid);
    expect(valid).toBe(false);
  });
});
