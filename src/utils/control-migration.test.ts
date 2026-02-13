import { describe, expect, test } from 'bun:test';
import type { ControlCommand } from '../types/control';
import type { IsoDateTime } from '../types/core';
import {
  V1_REMOVED_KEYS,
  V1_TO_V2_KEY_MAP,
  mapV1ToV2,
  mapV2SettingToV1,
} from './control-migration';

const NOW = '2025-01-15T12:00:00.000Z' as IsoDateTime;
const AUDIT = { summary: 'test migration' };

function makeV1Setting(key: string, value: string): ControlCommand {
  return {
    command_id: `cmd-${key}`,
    kind: 'SET_OPERATIONAL_SETTING',
    created_at: NOW,
    setting: { key, value },
    audit_redaction: AUDIT,
  };
}

describe('v1 → v2 migration', () => {
  test('maps SET_SAFE_MODE', () => {
    const v1: ControlCommand = {
      command_id: 'cmd-safe',
      kind: 'SET_SAFE_MODE',
      created_at: NOW,
      safe_mode: { enabled: true, reason: 'emergency shutdown' },
      audit_redaction: AUDIT,
    };

    const v2 = mapV1ToV2(v1);
    expect(v2).not.toBeNull();
    expect(v2?.kind).toBe('SET_SAFE_MODE');
    expect(v2?.message_type).toBe('control_command_v2');
    expect(v2?.safe_mode?.enabled).toBe(true);
    expect(v2?.safe_mode?.reason).toBe('emergency shutdown');
    expect(v2?.priority).toBe('ROUTINE');
    expect(v2?.idempotency_key).toBe('cmd-safe');
  });

  test('maps max_autonomy_level "0" → autonomy.max_autonomy_tier "passive"', () => {
    const v2 = mapV1ToV2(makeV1Setting('max_autonomy_level', '0'));
    expect(v2).not.toBeNull();
    expect(v2?.kind).toBe('SET_OPERATIONAL_SETTINGS');
    expect(v2?.settings?.[0]?.key).toBe('autonomy.max_autonomy_tier');
    expect(v2?.settings?.[0]?.value).toBe('passive');
  });

  test('maps max_autonomy_level "3" → "autonomous"', () => {
    const v2 = mapV1ToV2(makeV1Setting('max_autonomy_level', '3'));
    expect(v2?.settings?.[0]?.value).toBe('autonomous');
  });

  test('maps max_risk_level pass-through', () => {
    const v2 = mapV1ToV2(makeV1Setting('max_risk_level', 'high'));
    expect(v2?.settings?.[0]?.key).toBe('autonomy.max_risk_level');
    expect(v2?.settings?.[0]?.value).toBe('high');
  });

  test('maps require_clinician_review "true" → boolean true', () => {
    const v2 = mapV1ToV2(makeV1Setting('require_clinician_review', 'true'));
    expect(v2?.settings?.[0]?.key).toBe('autonomy.require_clinician_review');
    expect(v2?.settings?.[0]?.value).toBe(true);
  });

  test('maps require_clinician_review "false" → boolean false', () => {
    const v2 = mapV1ToV2(makeV1Setting('require_clinician_review', 'false'));
    expect(v2?.settings?.[0]?.value).toBe(false);
  });

  test('maps staleness.wellness_hours to integer', () => {
    const v2 = mapV1ToV2(makeV1Setting('staleness.wellness_hours', '48'));
    expect(v2?.settings?.[0]?.key).toBe('infra.staleness_wellness_hours');
    expect(v2?.settings?.[0]?.value).toBe(48);
  });

  test('maps staleness.clinical_hours to integer', () => {
    const v2 = mapV1ToV2(makeV1Setting('staleness.clinical_hours', '8'));
    expect(v2?.settings?.[0]?.key).toBe('infra.staleness_clinical_hours');
    expect(v2?.settings?.[0]?.value).toBe(8);
  });

  test('maps rate_limit.per_minute to integer', () => {
    const v2 = mapV1ToV2(makeV1Setting('rate_limit.per_minute', '120'));
    expect(v2?.settings?.[0]?.key).toBe('infra.rate_limit_per_minute');
    expect(v2?.settings?.[0]?.value).toBe(120);
  });

  test('maps rate_limit.per_hour to integer', () => {
    const v2 = mapV1ToV2(makeV1Setting('rate_limit.per_hour', '1000'));
    expect(v2?.settings?.[0]?.key).toBe('infra.rate_limit_per_hour');
    expect(v2?.settings?.[0]?.value).toBe(1000);
  });

  test('removed keys return null', () => {
    expect(mapV1ToV2(makeV1Setting('disable_domain', 'true'))).toBeNull();
    expect(mapV1ToV2(makeV1Setting('policy_pack', 'strict'))).toBeNull();
  });

  test('defaults priority to ROUTINE', () => {
    const v2 = mapV1ToV2(makeV1Setting('max_risk_level', 'low'));
    expect(v2?.priority).toBe('ROUTINE');
  });

  test('unknown v1 key passes through as-is', () => {
    const v2 = mapV1ToV2(makeV1Setting('custom.some_key', 'some_value'));
    expect(v2).not.toBeNull();
    expect(v2?.settings?.[0]?.key).toBe('custom.some_key');
    expect(v2?.settings?.[0]?.value).toBe('some_value');
  });
});

describe('v2 → v1 reverse migration', () => {
  test('maps autonomy.max_autonomy_tier → max_autonomy_level', () => {
    const v1 = mapV2SettingToV1(
      'cmd-r1',
      NOW,
      { key: 'autonomy.max_autonomy_tier', value: 'passive' },
      'test'
    );
    expect(v1).not.toBeNull();
    expect(v1?.kind).toBe('SET_OPERATIONAL_SETTING');
    expect(v1?.setting?.key).toBe('max_autonomy_level');
    expect(v1?.setting?.value).toBe('0');
  });

  test('maps autonomy.max_risk_level → max_risk_level', () => {
    const v1 = mapV2SettingToV1(
      'cmd-r2',
      NOW,
      { key: 'autonomy.max_risk_level', value: 'high' },
      'test'
    );
    expect(v1?.setting?.key).toBe('max_risk_level');
    expect(v1?.setting?.value).toBe('high');
  });

  test('maps autonomy.require_clinician_review → require_clinician_review', () => {
    const v1 = mapV2SettingToV1(
      'cmd-r3',
      NOW,
      { key: 'autonomy.require_clinician_review', value: true },
      'test'
    );
    expect(v1?.setting?.key).toBe('require_clinician_review');
    expect(v1?.setting?.value).toBe('true');
  });

  test('maps infra.staleness_wellness_hours → staleness.wellness_hours', () => {
    const v1 = mapV2SettingToV1(
      'cmd-r4',
      NOW,
      { key: 'infra.staleness_wellness_hours', value: 48 },
      'test'
    );
    expect(v1?.setting?.key).toBe('staleness.wellness_hours');
    expect(v1?.setting?.value).toBe('48');
  });

  test('returns null for unknown v2 key', () => {
    const v1 = mapV2SettingToV1(
      'cmd-r5',
      NOW,
      { key: 'prescriptions.enabled', value: true },
      'test'
    );
    expect(v1).toBeNull();
  });
});

describe('roundtrip v1 → v2 → v1', () => {
  test('preserves max_autonomy_level values', () => {
    for (const [v1Val, v2Val] of [
      ['0', 'passive'],
      ['1', 'advisory'],
      ['2', 'semi_autonomous'],
      ['3', 'autonomous'],
    ]) {
      const v1 = makeV1Setting('max_autonomy_level', v1Val ?? '');
      const v2 = mapV1ToV2(v1);
      expect(v2?.settings?.[0]?.value).toBe(v2Val);

      const v2Setting = v2?.settings?.[0];
      if (!v2Setting) throw new Error('Expected v2 setting');
      const roundtrip = mapV2SettingToV1('rt-cmd', NOW, v2Setting, 'roundtrip');
      expect(roundtrip).not.toBeNull();
      expect(roundtrip?.setting?.key).toBe('max_autonomy_level');
      expect(roundtrip?.setting?.value).toBe(v1Val);
    }
  });

  test('preserves require_clinician_review boolean roundtrip', () => {
    const v1 = makeV1Setting('require_clinician_review', 'true');
    const v2 = mapV1ToV2(v1);
    expect(v2?.settings?.[0]?.value).toBe(true);

    const v2ReviewSetting = v2?.settings?.[0];
    if (!v2ReviewSetting) throw new Error('Expected v2 setting');
    const roundtrip = mapV2SettingToV1('rt-cmd', NOW, v2ReviewSetting, 'roundtrip');
    expect(roundtrip?.setting?.value).toBe('true');
  });

  test('preserves integer settings roundtrip', () => {
    const v1 = makeV1Setting('staleness.wellness_hours', '48');
    const v2 = mapV1ToV2(v1);
    expect(v2?.settings?.[0]?.value).toBe(48);

    const v2IntSetting = v2?.settings?.[0];
    if (!v2IntSetting) throw new Error('Expected v2 setting');
    const roundtrip = mapV2SettingToV1('rt-cmd', NOW, v2IntSetting, 'roundtrip');
    expect(roundtrip?.setting?.value).toBe('48');
  });
});

describe('key map completeness', () => {
  test('V1_TO_V2_KEY_MAP has 7 active mappings', () => {
    expect(Object.keys(V1_TO_V2_KEY_MAP)).toHaveLength(7);
  });

  test('V1_REMOVED_KEYS has 2 entries', () => {
    expect(V1_REMOVED_KEYS.size).toBe(2);
    expect(V1_REMOVED_KEYS.has('disable_domain')).toBe(true);
    expect(V1_REMOVED_KEYS.has('policy_pack')).toBe(true);
  });
});
