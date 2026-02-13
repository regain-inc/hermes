// src/types/operational-settings-catalog.ts

import type { OperationalMode, SettingValue } from './control-v2';

// ─── Setting Affects Points (§1 SettingAffectsPoint) ───

export type SettingAffectsPoint =
  | 'prompt_generation'
  | 'debate_orchestration'
  | 'htv_scoring'
  | 'post_processing_filter'
  | 'triage_routing'
  | 'prescription_engine'
  | 'care_navigation'
  | 'data_integration';

export const SETTING_AFFECTS_POINTS: readonly SettingAffectsPoint[] = [
  'prompt_generation',
  'debate_orchestration',
  'htv_scoring',
  'post_processing_filter',
  'triage_routing',
  'prescription_engine',
  'care_navigation',
  'data_integration',
] as const;

// ─── Setting Types ───

export type SettingType = 'boolean' | 'enum' | 'integer' | 'float' | 'string' | 'string[]';

export const SETTING_TYPES: readonly SettingType[] = [
  'boolean',
  'enum',
  'integer',
  'float',
  'string',
  'string[]',
] as const;

// ─── Meta-Schema (§1) ───

export interface OperationalSettingDefinition {
  readonly key: string;
  readonly display_name: string;
  readonly description: string;

  readonly type: SettingType;
  readonly allowed_values?: readonly string[];
  readonly range?: { readonly min: number; readonly max: number };
  readonly default_value: SettingValue;

  readonly care_management_function: string;
  readonly iso_references: readonly string[];

  readonly affects: readonly SettingAffectsPoint[];
  readonly mode_overrides?: Readonly<Record<OperationalMode, SettingValue>>;

  readonly conformance: 'core' | 'extension';

  readonly requires_clinician_approval?: boolean;
  readonly safe_mode_locked_value?: SettingValue;
}

// ─── Full Catalog Constant (§2.1 – §2.9) ───

export const OPERATIONAL_SETTINGS_CATALOG: readonly OperationalSettingDefinition[] = [
  // §2.1 Autonomy & Risk — Core Profile (3 settings)
  {
    key: 'autonomy.max_risk_level',
    display_name: 'Max Risk Level',
    description: 'Maximum risk level the agent is allowed to handle autonomously.',
    type: 'enum',
    allowed_values: ['none', 'low', 'medium', 'high'],
    default_value: 'medium',
    care_management_function: 'Agentic Execution',
    iso_references: ['Table 1 — Agentic Execution', '§1.2.5'],
    affects: ['prompt_generation', 'post_processing_filter', 'triage_routing'],
    conformance: 'core',
    requires_clinician_approval: true,
    safe_mode_locked_value: 'none',
  },
  {
    key: 'autonomy.max_autonomy_tier',
    display_name: 'Max Autonomy Tier',
    description: 'Highest tier of autonomous action permitted.',
    type: 'enum',
    allowed_values: ['passive', 'advisory', 'semi_autonomous', 'autonomous'],
    default_value: 'semi_autonomous',
    care_management_function: 'Agentic Execution',
    iso_references: ['Table 1 — Agentic Execution', '§1.2.5'],
    affects: ['prompt_generation', 'prescription_engine', 'care_navigation'],
    conformance: 'core',
    requires_clinician_approval: true,
    safe_mode_locked_value: 'passive',
  },
  {
    key: 'autonomy.require_clinician_review',
    display_name: 'Require Clinician Review',
    description: 'When true, ALL agent outputs require clinician review before delivery.',
    type: 'boolean',
    default_value: false,
    care_management_function: 'Agentic Execution',
    iso_references: ['Table 1 — Agentic Execution', '§1.2.5'],
    affects: ['post_processing_filter'],
    conformance: 'core',
    requires_clinician_approval: false,
    safe_mode_locked_value: true,
  },

  // §2.1 Autonomy & Risk — Extension (1 setting)
  {
    key: 'autonomy.auto_refer_threshold',
    display_name: 'Auto-Refer Threshold',
    description: 'Confidence threshold below which the agent automatically refers to clinician.',
    type: 'float',
    range: { min: 0.0, max: 1.0 },
    default_value: 0.7,
    care_management_function: 'Agentic Execution',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['triage_routing', 'debate_orchestration'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 0.0,
  },

  // §2.2 Prescriptions (4 settings)
  {
    key: 'prescriptions.enabled',
    display_name: 'Prescriptions Enabled',
    description: 'Master switch for prescription-related proposals.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Prescriptions',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prescription_engine', 'prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: false,
  },
  {
    key: 'prescriptions.controlled_substance_mode',
    display_name: 'Controlled Substance Mode',
    description: 'Policy for controlled substance recommendations.',
    type: 'enum',
    allowed_values: ['deny', 'flag_only', 'allow_with_review'],
    default_value: 'deny',
    care_management_function: 'Care Management — Prescriptions',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prescription_engine', 'post_processing_filter'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 'deny',
  },
  {
    key: 'prescriptions.max_titration_step',
    display_name: 'Max Titration Step',
    description: 'Maximum number of titration steps in a single recommendation.',
    type: 'integer',
    range: { min: 0, max: 3 },
    default_value: 1,
    care_management_function: 'Care Management — Prescriptions',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prescription_engine'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 0,
  },
  {
    key: 'prescriptions.new_medication_enabled',
    display_name: 'New Medication Enabled',
    description: 'Whether the agent can propose entirely new medications.',
    type: 'boolean',
    default_value: false,
    care_management_function: 'Care Management — Prescriptions',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prescription_engine', 'prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: false,
  },

  // §2.3 Care Navigation (3 settings)
  {
    key: 'navigation.referral_auto_generate',
    display_name: 'Referral Auto-Generate',
    description: 'Whether the agent can automatically generate specialist referrals.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Care Navigation',
    iso_references: ['Table 1 — Care Management'],
    affects: ['care_navigation', 'prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: false,
  },
  {
    key: 'navigation.specialist_categories_allowed',
    display_name: 'Specialist Categories Allowed',
    description: 'Which specialist categories the agent can refer to autonomously.',
    type: 'string[]',
    default_value: ['cardiology', 'primary_care'],
    care_management_function: 'Care Management — Care Navigation',
    iso_references: ['Table 1 — Care Management'],
    affects: ['care_navigation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: [],
  },
  {
    key: 'navigation.appointment_modification_enabled',
    display_name: 'Appointment Modification Enabled',
    description: 'Whether the agent can modify existing appointments.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Care Navigation',
    iso_references: ['Table 1 — Care Management'],
    affects: ['care_navigation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: false,
  },

  // §2.4 Triage & Escalation (3 settings)
  {
    key: 'triage.emergency_detection_sensitivity',
    display_name: 'Emergency Detection Sensitivity',
    description: 'Sensitivity level for detecting potential emergencies from patient inputs.',
    type: 'enum',
    allowed_values: ['low', 'medium', 'high', 'maximum'],
    default_value: 'high',
    care_management_function: 'Care Management — Triage',
    iso_references: ['Table 1 — Care Management'],
    affects: ['triage_routing', 'prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 'maximum',
  },
  {
    key: 'triage.symptom_escalation_threshold',
    display_name: 'Symptom Escalation Threshold',
    description: 'Probability threshold for escalating symptom reports to clinical team.',
    type: 'float',
    range: { min: 0.0, max: 1.0 },
    default_value: 0.6,
    care_management_function: 'Care Management — Triage',
    iso_references: ['Table 1 — Care Management'],
    affects: ['triage_routing'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 0.0,
  },
  {
    key: 'triage.auto_engage_clinical_team',
    display_name: 'Auto-Engage Clinical Team',
    description: 'Whether the agent can automatically page/notify clinical team members.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Triage',
    iso_references: ['Table 1 — Care Management'],
    affects: ['triage_routing', 'care_navigation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: true,
  },

  // §2.5 Nutrition & Lifestyle (3 settings)
  {
    key: 'nutrition.dietary_restriction_mode',
    display_name: 'Dietary Restriction Mode',
    description: 'Mode for generating dietary recommendations.',
    type: 'enum',
    allowed_values: ['disabled', 'guideline_based', 'personalized'],
    default_value: 'guideline_based',
    care_management_function: 'Care Management — Nutrition',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 'disabled',
  },
  {
    key: 'nutrition.caloric_guidance_enabled',
    display_name: 'Caloric Guidance Enabled',
    description: 'Whether caloric guidance is enabled.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Nutrition',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: false,
  },
  {
    key: 'nutrition.sodium_limit_override_mg',
    display_name: 'Sodium Limit Override (mg)',
    description: 'Override sodium limit in milligrams for dietary recommendations.',
    type: 'integer',
    range: { min: 500, max: 5000 },
    default_value: 2000,
    care_management_function: 'Care Management — Nutrition',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 2000,
  },

  // §2.6 Exercise & Rehabilitation (3 settings)
  {
    key: 'exercise.contraindication_strict',
    display_name: 'Contraindication Strict',
    description:
      'Whether to enforce strict contraindication checking for exercise recommendations.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Exercise',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation', 'post_processing_filter'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: true,
  },
  {
    key: 'exercise.max_met_level',
    display_name: 'Max MET Level',
    description: 'Maximum MET level for exercise recommendations.',
    type: 'float',
    range: { min: 1.0, max: 20.0 },
    default_value: 6.0,
    care_management_function: 'Care Management — Exercise',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: true,
    safe_mode_locked_value: 3.0,
  },
  {
    key: 'exercise.enabled',
    display_name: 'Exercise Enabled',
    description: 'Master switch for exercise-related guidance.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Care Management — Exercise',
    iso_references: ['Table 1 — Care Management'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: false,
  },

  // §2.7 Patient Engagement (3 settings)
  {
    key: 'engagement.follow_up_frequency_hours',
    display_name: 'Follow-Up Frequency (hours)',
    description: 'Minimum hours between proactive follow-up messages to patient.',
    type: 'integer',
    range: { min: 1, max: 168 },
    default_value: 24,
    care_management_function: 'Agentic Execution — Patient Engagement',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['care_navigation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 168,
  },
  {
    key: 'engagement.communication_tone',
    display_name: 'Communication Tone',
    description: 'Tone for patient-facing communications.',
    type: 'enum',
    allowed_values: ['clinical', 'empathetic', 'motivational'],
    default_value: 'empathetic',
    care_management_function: 'Agentic Execution — Patient Engagement',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 'clinical',
  },
  {
    key: 'engagement.proactive_outreach_enabled',
    display_name: 'Proactive Outreach Enabled',
    description: 'Whether the agent can proactively reach out to patients.',
    type: 'boolean',
    default_value: true,
    care_management_function: 'Agentic Execution — Patient Engagement',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['care_navigation', 'prompt_generation'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: false,
  },

  // §2.8 Pipeline & Reasoning (4 settings)
  {
    key: 'pipeline.debate_rounds_max',
    display_name: 'Max Debate Rounds',
    description: 'Maximum number of Generator/Verifier debate rounds before Reasoner adjudicates.',
    type: 'integer',
    range: { min: 1, max: 7 },
    default_value: 3,
    care_management_function: 'Agentic Execution — Clinical Reasoning',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['debate_orchestration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 5,
  },
  {
    key: 'pipeline.htv_threshold',
    display_name: 'HTV Threshold',
    description: 'Minimum HTV score for outputs to proceed without additional review.',
    type: 'float',
    range: { min: 0.0, max: 1.0 },
    default_value: 0.7,
    care_management_function: 'Clinical Agent Monitoring / Clinical Reasoning',
    iso_references: ['Table 5 — TA2 Metrics', 'Table 1 — Agentic Execution'],
    affects: ['htv_scoring', 'post_processing_filter'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 0.9,
  },
  {
    key: 'pipeline.idk_sensitivity',
    display_name: 'IDK Sensitivity',
    description: "Sensitivity of the IDK (I Don't Know) protocol triggering.",
    type: 'enum',
    allowed_values: ['low', 'medium', 'high'],
    default_value: 'medium',
    care_management_function: 'Agentic Execution — Clinical Reasoning',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['debate_orchestration', 'post_processing_filter'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 'high',
  },
  {
    key: 'pipeline.reasoning_depth',
    display_name: 'Reasoning Depth',
    description: 'Depth of reasoning in the clinical pipeline.',
    type: 'enum',
    allowed_values: ['minimal', 'standard', 'thorough'],
    default_value: 'standard',
    care_management_function: 'Agentic Execution — Clinical Reasoning',
    iso_references: ['Table 1 — Agentic Execution'],
    affects: ['debate_orchestration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 'thorough',
  },

  // §2.9 Infrastructure — Popper-internal (4 settings, NOT sent to TA1)
  {
    key: 'infra.staleness_wellness_hours',
    display_name: 'Staleness Threshold — Wellness (hours)',
    description: 'Maximum data age in hours for wellness-mode snapshots.',
    type: 'integer',
    range: { min: 1, max: 168 },
    default_value: 24,
    care_management_function: 'TA2 — Monitoring (internal)',
    iso_references: ['Table 2 — TA2'],
    affects: ['data_integration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 4,
  },
  {
    key: 'infra.staleness_clinical_hours',
    display_name: 'Staleness Threshold — Clinical (hours)',
    description: 'Maximum data age in hours for clinical-mode snapshots.',
    type: 'integer',
    range: { min: 1, max: 48 },
    default_value: 4,
    care_management_function: 'TA2 — Monitoring (internal)',
    iso_references: ['Table 2 — TA2'],
    affects: ['data_integration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 1,
  },
  {
    key: 'infra.rate_limit_per_minute',
    display_name: 'Rate Limit (per minute)',
    description: 'Maximum requests per minute.',
    type: 'integer',
    range: { min: 1, max: 1000 },
    default_value: 60,
    care_management_function: 'TA2 — Monitoring (internal)',
    iso_references: ['Table 2 — TA2'],
    affects: ['data_integration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 10,
  },
  {
    key: 'infra.rate_limit_per_hour',
    display_name: 'Rate Limit (per hour)',
    description: 'Maximum requests per hour.',
    type: 'integer',
    range: { min: 10, max: 10000 },
    default_value: 500,
    care_management_function: 'TA2 — Monitoring (internal)',
    iso_references: ['Table 2 — TA2'],
    affects: ['data_integration'],
    conformance: 'extension',
    requires_clinician_approval: false,
    safe_mode_locked_value: 60,
  },
] as const;

// ─── Catalog Version ───

export const SETTINGS_CATALOG_VERSION = '2.0.0';

// ─── Helper Functions ───

/** Lookup a setting definition by key. Returns undefined if not found. */
export function getSettingDefinition(key: string): OperationalSettingDefinition | undefined {
  return OPERATIONAL_SETTINGS_CATALOG.find((s) => s.key === key);
}

/** Get all core conformance profile settings. */
export function getCoreSettings(): readonly OperationalSettingDefinition[] {
  return OPERATIONAL_SETTINGS_CATALOG.filter((s) => s.conformance === 'core');
}

/** Get all extension settings. */
export function getExtensionSettings(): readonly OperationalSettingDefinition[] {
  return OPERATIONAL_SETTINGS_CATALOG.filter((s) => s.conformance === 'extension');
}

/** Get all TA2→TA1 control settings (excludes infra.* which are Popper-internal). */
export function getTA1ControlSettings(): readonly OperationalSettingDefinition[] {
  return OPERATIONAL_SETTINGS_CATALOG.filter((s) => !s.key.startsWith('infra.'));
}

/** Get all setting keys. */
export function getAllSettingKeys(): readonly string[] {
  return OPERATIONAL_SETTINGS_CATALOG.map((s) => s.key);
}

/** Get the default values as a Record. */
export function getDefaultSettings(): Record<string, SettingValue> {
  const result: Record<string, SettingValue> = {};
  for (const setting of OPERATIONAL_SETTINGS_CATALOG) {
    result[setting.key] = setting.default_value;
  }
  return result;
}

/** Get safe-mode locked values as a Record. */
export function getSafeModeLockValues(): Record<string, SettingValue> {
  const result: Record<string, SettingValue> = {};
  for (const setting of OPERATIONAL_SETTINGS_CATALOG) {
    if (setting.safe_mode_locked_value !== undefined) {
      result[setting.key] = setting.safe_mode_locked_value;
    }
  }
  return result;
}

function validateRange(
  key: string,
  value: number,
  range?: { readonly min: number; readonly max: number }
): string | null {
  if (range && (value < range.min || value > range.max)) {
    return `Value ${value} out of range [${range.min}, ${range.max}] for ${key}`;
  }
  return null;
}

const TYPE_VALIDATORS: Record<
  SettingType,
  (key: string, value: unknown, def: OperationalSettingDefinition) => string | null
> = {
  boolean: (key, value) =>
    typeof value !== 'boolean' ? `Expected boolean for ${key}, got ${typeof value}` : null,
  enum: (key, value, def) => {
    if (typeof value !== 'string') return `Expected string for ${key}, got ${typeof value}`;
    if (def.allowed_values && !def.allowed_values.includes(value)) {
      return `Invalid value "${value}" for ${key}. Allowed: ${def.allowed_values.join(', ')}`;
    }
    return null;
  },
  integer: (key, value, def) => {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return `Expected integer for ${key}, got ${typeof value === 'number' ? 'float' : typeof value}`;
    }
    return validateRange(key, value, def.range);
  },
  float: (key, value, def) => {
    if (typeof value !== 'number') return `Expected number for ${key}, got ${typeof value}`;
    return validateRange(key, value, def.range);
  },
  string: (key, value) =>
    typeof value !== 'string' ? `Expected string for ${key}, got ${typeof value}` : null,
  'string[]': (key, value) => {
    if (!Array.isArray(value)) return `Expected string[] for ${key}, got ${typeof value}`;
    for (const item of value) {
      if (typeof item !== 'string') return `Expected string[] items for ${key}, got ${typeof item}`;
    }
    return null;
  },
};

/**
 * Validate a setting value against the catalog definition.
 * Returns null if valid, or a human-readable error string if invalid.
 */
export function validateSettingValue(key: string, value: unknown): string | null {
  const def = getSettingDefinition(key);
  if (!def) return `Unknown setting key: ${key}`;

  const validator = TYPE_VALIDATORS[def.type];
  const error = validator(key, value, def);
  if (error) return error;
  return null;
}
