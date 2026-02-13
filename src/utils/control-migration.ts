// src/utils/control-migration.ts

import type { ControlCommand } from '../types/control';
import type {
  ControlCommandV2,
  OperationalSettingChange,
  SafeModeConfigV2,
  SettingValue,
} from '../types/control-v2';
import type { IsoDateTime } from '../types/core';

// ─── v1 → v2 Key Mapping (spec §3.2) ───

interface V1KeyMapping {
  v2Key: string;
  parseValue: (v1Value: string) => SettingValue;
}

const AUTONOMY_LEVEL_MAP: Record<string, string> = {
  '0': 'passive',
  '1': 'advisory',
  '2': 'semi_autonomous',
  '3': 'autonomous',
};

const AUTONOMY_LEVEL_REVERSE: Record<string, string> = {
  passive: '0',
  advisory: '1',
  semi_autonomous: '2',
  autonomous: '3',
};

export const V1_TO_V2_KEY_MAP: Record<string, V1KeyMapping> = {
  max_autonomy_level: {
    v2Key: 'autonomy.max_autonomy_tier',
    parseValue: (v) => AUTONOMY_LEVEL_MAP[v] ?? v,
  },
  max_risk_level: {
    v2Key: 'autonomy.max_risk_level',
    parseValue: (v) => v, // pass-through (already enum string)
  },
  require_clinician_review: {
    v2Key: 'autonomy.require_clinician_review',
    parseValue: (v) => v === 'true',
  },
  'staleness.wellness_hours': {
    v2Key: 'infra.staleness_wellness_hours',
    parseValue: (v) => Number.parseInt(v, 10),
  },
  'staleness.clinical_hours': {
    v2Key: 'infra.staleness_clinical_hours',
    parseValue: (v) => Number.parseInt(v, 10),
  },
  'rate_limit.per_minute': {
    v2Key: 'infra.rate_limit_per_minute',
    parseValue: (v) => Number.parseInt(v, 10),
  },
  'rate_limit.per_hour': {
    v2Key: 'infra.rate_limit_per_hour',
    parseValue: (v) => Number.parseInt(v, 10),
  },
};

// Keys that are removed in v2 (spec §3.2 "Removed" column)
export const V1_REMOVED_KEYS: Set<string> = new Set(['disable_domain', 'policy_pack']);

/**
 * Map a v1 ControlCommand to a v2 ControlCommandV2.
 * Returns null if the v1 command uses a removed key (e.g., disable_domain).
 *
 * @see 01-control-channel-v2-spec.md §3.1
 */
export function mapV1ToV2(v1: ControlCommand): ControlCommandV2 | null {
  if (v1.kind === 'SET_SAFE_MODE') {
    const base = {
      hermes_version: '2.0.0',
      message_type: 'control_command_v2' as const,
      command_id: v1.command_id,
      created_at: v1.created_at,
      source: { system: 'popper', service_version: 'v1-compat' },
      target: { system: 'deutsch' },
      kind: 'SET_SAFE_MODE' as const,
      priority: 'ROUTINE' as const,
      idempotency_key: v1.command_id, // v1 has no idempotency_key; use command_id
      audit_redaction: v1.audit_redaction,
    };

    if (v1.safe_mode) {
      const sm: SafeModeConfigV2 = {
        enabled: v1.safe_mode.enabled,
        reason: v1.safe_mode.reason,
        ...(v1.safe_mode.effective_at !== undefined && { effective_at: v1.safe_mode.effective_at }),
        ...(v1.safe_mode.effective_until !== undefined && {
          effective_until: v1.safe_mode.effective_until,
        }),
      };
      return { ...base, safe_mode: sm };
    }

    return base;
  }

  // SET_OPERATIONAL_SETTING (singular)
  if (v1.kind === 'SET_OPERATIONAL_SETTING' && v1.setting) {
    const v1Key = v1.setting.key;

    if (V1_REMOVED_KEYS.has(v1Key)) return null;

    const mapping = V1_TO_V2_KEY_MAP[v1Key];
    const setting: OperationalSettingChange = mapping
      ? { key: mapping.v2Key, value: mapping.parseValue(v1.setting.value) }
      : { key: v1Key, value: v1.setting.value }; // Unknown key: pass-through as string

    return {
      hermes_version: '2.0.0',
      message_type: 'control_command_v2',
      command_id: v1.command_id,
      created_at: v1.created_at,
      source: { system: 'popper', service_version: 'v1-compat' },
      target: { system: 'deutsch' },
      kind: 'SET_OPERATIONAL_SETTINGS',
      priority: 'ROUTINE',
      settings: [setting],
      idempotency_key: v1.command_id,
      audit_redaction: v1.audit_redaction,
    };
  }

  return null;
}

// ─── v2 → v1 Reverse Key Mapping ───

const V2_TO_V1_KEY_MAP: Record<
  string,
  { v1Key: string; formatValue: (v: SettingValue) => string }
> = {
  'autonomy.max_autonomy_tier': {
    v1Key: 'max_autonomy_level',
    formatValue: (v) => AUTONOMY_LEVEL_REVERSE[v as string] ?? String(v),
  },
  'autonomy.max_risk_level': {
    v1Key: 'max_risk_level',
    formatValue: (v) => String(v),
  },
  'autonomy.require_clinician_review': {
    v1Key: 'require_clinician_review',
    formatValue: (v) => String(v),
  },
  'infra.staleness_wellness_hours': {
    v1Key: 'staleness.wellness_hours',
    formatValue: (v) => String(v),
  },
  'infra.staleness_clinical_hours': {
    v1Key: 'staleness.clinical_hours',
    formatValue: (v) => String(v),
  },
  'infra.rate_limit_per_minute': {
    v1Key: 'rate_limit.per_minute',
    formatValue: (v) => String(v),
  },
  'infra.rate_limit_per_hour': {
    v1Key: 'rate_limit.per_hour',
    formatValue: (v) => String(v),
  },
};

/**
 * Map a single v2 setting change to a v1 ControlCommand.
 * Only supports SET_OPERATIONAL_SETTINGS with a single setting.
 * Returns null if the v2 key has no v1 equivalent.
 */
export function mapV2SettingToV1(
  commandId: string,
  createdAt: IsoDateTime,
  change: OperationalSettingChange,
  auditSummary: string
): ControlCommand | null {
  const mapping = V2_TO_V1_KEY_MAP[change.key];
  if (!mapping) return null;

  return {
    command_id: commandId,
    kind: 'SET_OPERATIONAL_SETTING',
    created_at: createdAt,
    setting: {
      key: mapping.v1Key,
      value: mapping.formatValue(change.value),
    },
    audit_redaction: { summary: auditSummary },
  };
}
