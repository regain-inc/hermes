import { describe, expect, test } from 'bun:test';
import {
  COMMAND_PRIORITIES,
  CONTROL_COMMAND_STATUSES,
  CONTROL_COMMAND_V2_KINDS,
  type ControlCommandResponse,
  type ControlCommandV2,
  OPERATIONAL_MODES,
  type OperationalStateSnapshot,
} from './control-v2';
import type { IsoDateTime } from './core';

const NOW = '2025-01-15T12:00:00.000Z' as IsoDateTime;

describe('ControlCommandV2 const arrays', () => {
  test('CONTROL_COMMAND_V2_KINDS has 4 entries', () => {
    expect(CONTROL_COMMAND_V2_KINDS).toHaveLength(4);
    expect(CONTROL_COMMAND_V2_KINDS).toContain('SET_SAFE_MODE');
    expect(CONTROL_COMMAND_V2_KINDS).toContain('SET_OPERATIONAL_SETTINGS');
    expect(CONTROL_COMMAND_V2_KINDS).toContain('GET_OPERATIONAL_STATE');
    expect(CONTROL_COMMAND_V2_KINDS).toContain('SET_OPERATIONAL_MODE');
  });

  test('COMMAND_PRIORITIES has 3 entries', () => {
    expect(COMMAND_PRIORITIES).toHaveLength(3);
    expect(COMMAND_PRIORITIES).toContain('ROUTINE');
    expect(COMMAND_PRIORITIES).toContain('URGENT');
    expect(COMMAND_PRIORITIES).toContain('EMERGENCY');
  });

  test('OPERATIONAL_MODES has 4 entries', () => {
    expect(OPERATIONAL_MODES).toHaveLength(4);
    expect(OPERATIONAL_MODES).toContain('NORMAL');
    expect(OPERATIONAL_MODES).toContain('RESTRICTED');
    expect(OPERATIONAL_MODES).toContain('SAFE_MODE');
    expect(OPERATIONAL_MODES).toContain('MAINTENANCE');
  });

  test('CONTROL_COMMAND_STATUSES has 3 entries', () => {
    expect(CONTROL_COMMAND_STATUSES).toHaveLength(3);
    expect(CONTROL_COMMAND_STATUSES).toContain('APPLIED');
    expect(CONTROL_COMMAND_STATUSES).toContain('REJECTED');
    expect(CONTROL_COMMAND_STATUSES).toContain('DEFERRED');
  });
});

describe('ControlCommandV2 construction', () => {
  const base = {
    hermes_version: '2.0.0',
    message_type: 'control_command_v2' as const,
    command_id: 'cmd-001',
    created_at: NOW,
    source: { system: 'popper', service_version: '2.0.0' },
    target: { system: 'deutsch' },
    priority: 'ROUTINE' as const,
    idempotency_key: 'idem-001',
    audit_redaction: { summary: 'test' },
  };

  test('SET_SAFE_MODE command', () => {
    const cmd: ControlCommandV2 = {
      ...base,
      kind: 'SET_SAFE_MODE',
      safe_mode: { enabled: true, reason: 'emergency' },
    };
    expect(cmd.kind).toBe('SET_SAFE_MODE');
    expect(cmd.safe_mode?.enabled).toBe(true);
  });

  test('SET_OPERATIONAL_SETTINGS command', () => {
    const cmd: ControlCommandV2 = {
      ...base,
      kind: 'SET_OPERATIONAL_SETTINGS',
      settings: [{ key: 'autonomy.max_risk_level', value: 'low' }],
    };
    expect(cmd.kind).toBe('SET_OPERATIONAL_SETTINGS');
    expect(cmd.settings).toHaveLength(1);
  });

  test('GET_OPERATIONAL_STATE command', () => {
    const cmd: ControlCommandV2 = {
      ...base,
      kind: 'GET_OPERATIONAL_STATE',
    };
    expect(cmd.kind).toBe('GET_OPERATIONAL_STATE');
  });

  test('SET_OPERATIONAL_MODE command', () => {
    const cmd: ControlCommandV2 = {
      ...base,
      kind: 'SET_OPERATIONAL_MODE',
      mode_transition: { target_mode: 'MAINTENANCE', reason: 'scheduled' },
    };
    expect(cmd.kind).toBe('SET_OPERATIONAL_MODE');
    expect(cmd.mode_transition?.target_mode).toBe('MAINTENANCE');
  });
});

describe('ControlCommandResponse construction', () => {
  const baseResp = {
    hermes_version: '2.0.0',
    message_type: 'control_command_response' as const,
    command_id: 'cmd-001',
    response_id: 'resp-001',
    received_at: NOW,
    responded_at: NOW,
    source: { system: 'deutsch', service_version: '2.0.0' },
    audit_redaction: { summary: 'test response' },
  };

  test('APPLIED response', () => {
    const resp: ControlCommandResponse = {
      ...baseResp,
      status: 'APPLIED',
    };
    expect(resp.status).toBe('APPLIED');
  });

  test('REJECTED response with reason', () => {
    const resp: ControlCommandResponse = {
      ...baseResp,
      status: 'REJECTED',
      reason: 'Setting not supported',
    };
    expect(resp.status).toBe('REJECTED');
    expect(resp.reason).toBe('Setting not supported');
  });

  test('DEFERRED response with deferred info', () => {
    const resp: ControlCommandResponse = {
      ...baseResp,
      status: 'DEFERRED',
      deferred: {
        estimated_apply_at: '2025-01-15T13:00:00.000Z' as IsoDateTime,
        retry_after_ms: 60000,
      },
    };
    expect(resp.status).toBe('DEFERRED');
    expect(resp.deferred?.retry_after_ms).toBe(60000);
  });
});

describe('OperationalStateSnapshot', () => {
  test('includes catalog_version and supported_keys', () => {
    const snapshot: OperationalStateSnapshot = {
      snapshot_id: 'snap-001',
      created_at: NOW,
      safe_mode: { enabled: false },
      operational_mode: 'NORMAL',
      settings: { 'autonomy.max_risk_level': 'medium' },
      catalog_version: '2.0.0',
      supported_keys: ['autonomy.max_risk_level', 'autonomy.max_autonomy_tier'],
    };
    expect(snapshot.catalog_version).toBe('2.0.0');
    expect(snapshot.supported_keys).toHaveLength(2);
    expect(snapshot.supported_keys).toContain('autonomy.max_risk_level');
  });
});
