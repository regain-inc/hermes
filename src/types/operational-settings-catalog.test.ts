import { describe, expect, test } from 'bun:test';
import {
  OPERATIONAL_SETTINGS_CATALOG,
  SETTINGS_CATALOG_VERSION,
  getAllSettingKeys,
  getCoreSettings,
  getDefaultSettings,
  getExtensionSettings,
  getSafeModeLockValues,
  getSettingDefinition,
  getTA1ControlSettings,
  validateSettingValue,
} from './operational-settings-catalog';

describe('OPERATIONAL_SETTINGS_CATALOG', () => {
  test('has exactly 31 settings', () => {
    expect(OPERATIONAL_SETTINGS_CATALOG).toHaveLength(31);
  });

  test('has exactly 3 core settings', () => {
    const core = OPERATIONAL_SETTINGS_CATALOG.filter((s) => s.conformance === 'core');
    expect(core).toHaveLength(3);
  });

  test('has exactly 28 extension settings', () => {
    const ext = OPERATIONAL_SETTINGS_CATALOG.filter((s) => s.conformance === 'extension');
    expect(ext).toHaveLength(28);
  });

  test('all keys are unique', () => {
    const keys = OPERATIONAL_SETTINGS_CATALOG.map((s) => s.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  test('all keys follow namespace.setting_name pattern', () => {
    for (const setting of OPERATIONAL_SETTINGS_CATALOG) {
      expect(setting.key).toContain('.');
      const parts = setting.key.split('.');
      expect(parts.length).toBe(2);
      expect(parts[0]?.length).toBeGreaterThan(0);
      expect(parts[1]?.length).toBeGreaterThan(0);
    }
  });

  test('core settings are the 3 autonomy.* settings', () => {
    const core = getCoreSettings();
    const keys = core.map((s) => s.key);
    expect(keys).toContain('autonomy.max_risk_level');
    expect(keys).toContain('autonomy.max_autonomy_tier');
    expect(keys).toContain('autonomy.require_clinician_review');
  });

  test('catalog version is 2.0.0', () => {
    expect(SETTINGS_CATALOG_VERSION).toBe('2.0.0');
  });
});

describe('helper functions', () => {
  test('getSettingDefinition returns definition for known key', () => {
    const def = getSettingDefinition('autonomy.max_risk_level');
    expect(def).toBeDefined();
    expect(def?.type).toBe('enum');
    expect(def?.conformance).toBe('core');
  });

  test('getSettingDefinition returns undefined for unknown key', () => {
    const def = getSettingDefinition('nonexistent.key');
    expect(def).toBeUndefined();
  });

  test('getCoreSettings returns 3', () => {
    expect(getCoreSettings()).toHaveLength(3);
  });

  test('getExtensionSettings returns 28', () => {
    expect(getExtensionSettings()).toHaveLength(28);
  });

  test('getTA1ControlSettings excludes infra.* keys', () => {
    const ta1 = getTA1ControlSettings();
    for (const setting of ta1) {
      expect(setting.key.startsWith('infra.')).toBe(false);
    }
    // 31 total - 4 infra = 27
    expect(ta1).toHaveLength(27);
  });

  test('getAllSettingKeys returns 31 keys', () => {
    const keys = getAllSettingKeys();
    expect(keys).toHaveLength(31);
  });

  test('getDefaultSettings returns Record with 31 keys', () => {
    const defaults = getDefaultSettings();
    expect(Object.keys(defaults)).toHaveLength(31);
    expect(defaults['autonomy.max_risk_level']).toBe('medium');
    expect(defaults['autonomy.require_clinician_review']).toBe(false);
  });

  test('getSafeModeLockValues returns Record with locked values', () => {
    const locks = getSafeModeLockValues();
    expect(Object.keys(locks).length).toBeGreaterThan(0);
    expect(locks['autonomy.max_risk_level']).toBe('none');
    expect(locks['autonomy.require_clinician_review']).toBe(true);
    expect(locks['autonomy.max_autonomy_tier']).toBe('passive');
  });
});

describe('validateSettingValue', () => {
  test('accepts valid boolean', () => {
    expect(validateSettingValue('autonomy.require_clinician_review', true)).toBeNull();
    expect(validateSettingValue('autonomy.require_clinician_review', false)).toBeNull();
  });

  test('rejects wrong type for boolean', () => {
    const err = validateSettingValue('autonomy.require_clinician_review', 'true');
    expect(err).not.toBeNull();
    expect(err).toContain('boolean');
  });

  test('accepts valid enum value', () => {
    expect(validateSettingValue('autonomy.max_risk_level', 'low')).toBeNull();
    expect(validateSettingValue('autonomy.max_risk_level', 'high')).toBeNull();
  });

  test('rejects invalid enum value', () => {
    const err = validateSettingValue('autonomy.max_risk_level', 'extreme');
    expect(err).not.toBeNull();
    expect(err).toContain('Invalid value');
  });

  test('accepts integer in range', () => {
    expect(validateSettingValue('prescriptions.max_titration_step', 2)).toBeNull();
  });

  test('rejects integer out of range', () => {
    const err = validateSettingValue('prescriptions.max_titration_step', 5);
    expect(err).not.toBeNull();
    expect(err).toContain('out of range');
  });

  test('rejects float for integer field', () => {
    const err = validateSettingValue('prescriptions.max_titration_step', 1.5);
    expect(err).not.toBeNull();
    expect(err).toContain('integer');
  });

  test('accepts valid float', () => {
    expect(validateSettingValue('autonomy.auto_refer_threshold', 0.5)).toBeNull();
  });

  test('rejects float out of range', () => {
    const err = validateSettingValue('autonomy.auto_refer_threshold', 1.5);
    expect(err).not.toBeNull();
    expect(err).toContain('out of range');
  });

  test('accepts valid string[]', () => {
    expect(
      validateSettingValue('navigation.specialist_categories_allowed', ['cardiology'])
    ).toBeNull();
  });

  test('rejects non-array for string[] field', () => {
    const err = validateSettingValue('navigation.specialist_categories_allowed', 'cardiology');
    expect(err).not.toBeNull();
    expect(err).toContain('string[]');
  });

  test('rejects unknown key', () => {
    const err = validateSettingValue('nonexistent.key', 'value');
    expect(err).not.toBeNull();
    expect(err).toContain('Unknown setting key');
  });
});
