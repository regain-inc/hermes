import { describe, expect, test } from 'bun:test';
import type { ControlCommandV2Kind } from '../types/control-v2';
import type { IsoDateTime } from '../types/core';
import { createControlCommandResponse } from './control-command-response';
import { createControlCommandV2 } from './control-command-v2';

describe('createControlCommandV2', () => {
  const allKinds: ControlCommandV2Kind[] = [
    'SET_SAFE_MODE',
    'SET_OPERATIONAL_SETTINGS',
    'GET_OPERATIONAL_STATE',
    'SET_OPERATIONAL_MODE',
  ];

  for (const kind of allKinds) {
    test(`creates ${kind} command with defaults`, () => {
      const cmd = createControlCommandV2({ kind });

      expect(cmd.hermes_version).toBe('2.0.0');
      expect(cmd.message_type).toBe('control_command_v2');
      expect(cmd.kind).toBe(kind);
      expect(cmd.priority).toBe('ROUTINE');
      expect(cmd.source.system).toBe('popper');
      expect(cmd.source.service_version).toBe('2.0.0');
      expect(cmd.target.system).toBe('deutsch');
      expect(cmd.command_id).toBeTruthy();
      expect(cmd.idempotency_key).toBeTruthy();
      expect(cmd.created_at).toBeTruthy();
      expect(cmd.audit_redaction.summary).toContain(kind);
    });
  }

  test('generates unique command_id and idempotency_key per call', () => {
    const cmd1 = createControlCommandV2({ kind: 'SET_SAFE_MODE' });
    const cmd2 = createControlCommandV2({ kind: 'SET_SAFE_MODE' });

    expect(cmd1.command_id).not.toBe(cmd2.command_id);
    expect(cmd1.idempotency_key).not.toBe(cmd2.idempotency_key);
    expect(cmd1.command_id).not.toBe(cmd1.idempotency_key);
  });

  test('respects custom options', () => {
    const cmd = createControlCommandV2({
      kind: 'SET_OPERATIONAL_SETTINGS',
      priority: 'EMERGENCY',
      source_system: 'custom-source',
      source_service_version: '3.0.0',
      source_operator_id: 'op-123',
      target_system: 'custom-target',
      target_organization_id: 'org-456',
      target_instance_id: 'inst-789',
      settings: [{ key: 'autonomy.max_risk_level', value: 'low' }],
      command_batch_id: 'batch-001',
      audit_summary: 'Custom summary',
    });

    expect(cmd.priority).toBe('EMERGENCY');
    expect(cmd.source.system).toBe('custom-source');
    expect(cmd.source.service_version).toBe('3.0.0');
    expect(cmd.source.operator_id).toBe('op-123');
    expect(cmd.target.system).toBe('custom-target');
    expect(cmd.target.organization_id).toBe('org-456');
    expect(cmd.target.instance_id).toBe('inst-789');
    expect(cmd.settings).toHaveLength(1);
    expect(cmd.command_batch_id).toBe('batch-001');
    expect(cmd.audit_redaction.summary).toBe('Custom summary');
  });

  test('includes safe_mode for SET_SAFE_MODE', () => {
    const cmd = createControlCommandV2({
      kind: 'SET_SAFE_MODE',
      safe_mode: { enabled: true, reason: 'Safety concern' },
    });

    expect(cmd.safe_mode).toEqual({ enabled: true, reason: 'Safety concern' });
  });

  test('includes mode_transition for SET_OPERATIONAL_MODE', () => {
    const cmd = createControlCommandV2({
      kind: 'SET_OPERATIONAL_MODE',
      mode_transition: { target_mode: 'SAFE_MODE', reason: 'Emergency' },
    });

    expect(cmd.mode_transition).toEqual({ target_mode: 'SAFE_MODE', reason: 'Emergency' });
  });

  test('omits optional fields when not provided', () => {
    const cmd = createControlCommandV2({ kind: 'GET_OPERATIONAL_STATE' });

    expect(cmd).not.toHaveProperty('safe_mode');
    expect(cmd).not.toHaveProperty('settings');
    expect(cmd).not.toHaveProperty('mode_transition');
    expect(cmd).not.toHaveProperty('command_batch_id');
    expect(cmd.source).not.toHaveProperty('operator_id');
    expect(cmd.target).not.toHaveProperty('organization_id');
    expect(cmd.target).not.toHaveProperty('instance_id');
  });
});

describe('createControlCommandResponse', () => {
  test('creates APPLIED response with defaults', () => {
    const resp = createControlCommandResponse({
      command_id: 'cmd-001',
      status: 'APPLIED',
    });

    expect(resp.hermes_version).toBe('2.0.0');
    expect(resp.message_type).toBe('control_command_response');
    expect(resp.command_id).toBe('cmd-001');
    expect(resp.status).toBe('APPLIED');
    expect(resp.source.system).toBe('deutsch');
    expect(resp.source.service_version).toBe('2.0.0');
    expect(resp.response_id).toBeTruthy();
    expect(resp.received_at).toBeTruthy();
    expect(resp.responded_at).toBeTruthy();
    expect(resp.audit_redaction.summary).toContain('cmd-001');
    expect(resp.audit_redaction.summary).toContain('APPLIED');
  });

  test('creates REJECTED response with reason', () => {
    const resp = createControlCommandResponse({
      command_id: 'cmd-002',
      status: 'REJECTED',
      reason: 'Unknown setting key',
    });

    expect(resp.status).toBe('REJECTED');
    expect(resp.reason).toBe('Unknown setting key');
  });

  test('creates DEFERRED response with deferred info', () => {
    const resp = createControlCommandResponse({
      command_id: 'cmd-003',
      status: 'DEFERRED',
      deferred: {
        estimated_apply_at: '2025-01-15T11:00:00.000Z' as IsoDateTime,
        retry_after_ms: 5000,
      },
    });

    expect(resp.status).toBe('DEFERRED');
    expect(resp.deferred?.estimated_apply_at).toBeTruthy();
    expect(resp.deferred?.retry_after_ms).toBe(5000);
  });

  test('generates unique response_id per call', () => {
    const r1 = createControlCommandResponse({ command_id: 'cmd-001', status: 'APPLIED' });
    const r2 = createControlCommandResponse({ command_id: 'cmd-001', status: 'APPLIED' });

    expect(r1.response_id).not.toBe(r2.response_id);
  });

  test('includes setting_results and snapshot', () => {
    const resp = createControlCommandResponse({
      command_id: 'cmd-004',
      status: 'APPLIED',
      setting_results: [
        { key: 'autonomy.max_risk_level', status: 'APPLIED', applied_value: 'low' },
      ],
      settings_snapshot: {
        snapshot_id: 'snap-001',
        created_at: '2025-01-15T10:00:00.000Z' as IsoDateTime,
        safe_mode: { enabled: false },
        operational_mode: 'NORMAL',
        settings: { 'autonomy.max_risk_level': 'low' },
        catalog_version: '1.0.0',
        supported_keys: ['autonomy.max_risk_level'],
      },
    });

    expect(resp.setting_results).toHaveLength(1);
    expect(resp.settings_snapshot?.operational_mode).toBe('NORMAL');
  });

  test('omits optional fields when not provided', () => {
    const resp = createControlCommandResponse({
      command_id: 'cmd-005',
      status: 'APPLIED',
    });

    expect(resp).not.toHaveProperty('reason');
    expect(resp).not.toHaveProperty('setting_results');
    expect(resp).not.toHaveProperty('settings_snapshot');
    expect(resp).not.toHaveProperty('deferred');
    expect(resp).not.toHaveProperty('command_batch_id');
    expect(resp.source).not.toHaveProperty('instance_id');
  });
});
