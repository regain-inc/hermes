/**
 * Control command types for Hermes protocol (Popper → Deutsch)
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.6
 * @module types/control
 */

import type { AuditRedactionBase, IsoDateTime } from './core';

// =============================================================================
// Section 3.6: Control Command
// =============================================================================

/**
 * Types of control commands from Popper to Deutsch.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.6
 * @see schema/hermes-message.schema.json — $defs.ControlCommandKind
 */
export type ControlCommandKind = 'SET_SAFE_MODE' | 'SET_OPERATIONAL_SETTING';

/**
 * All valid control command kinds as a readonly array for runtime validation.
 */
export const CONTROL_COMMAND_KINDS: readonly ControlCommandKind[] = [
  'SET_SAFE_MODE',
  'SET_OPERATIONAL_SETTING',
] as const;

/**
 * Safe mode configuration.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.6
 */
export interface SafeModeConfig {
  /** Whether safe mode is enabled */
  readonly enabled: boolean;
  /** Reason for enabling/disabling safe mode */
  readonly reason: string;
  /** When safe mode takes effect */
  readonly effective_at?: IsoDateTime;
  /** When safe mode expires (if temporary) */
  readonly effective_until?: IsoDateTime;
}

/**
 * Operational setting key-value pair.
 * Stringly typed for v1; can become typed later.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.6
 */
export interface OperationalSetting {
  /** Setting key (e.g., "max_autonomy_level") */
  readonly key: string;
  /** Setting value */
  readonly value: string;
}

/**
 * Control command from Popper to Deutsch.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.6
 * @see schema/hermes-message.schema.json — $defs.ControlCommand
 */
export interface ControlCommand {
  /** Unique identifier for this command */
  readonly command_id: string;
  /** Type of control command */
  readonly kind: ControlCommandKind;
  /** When this command was created */
  readonly created_at: IsoDateTime;

  /** Safe mode configuration (for SET_SAFE_MODE) */
  readonly safe_mode?: SafeModeConfig;

  /** Operational setting (for SET_OPERATIONAL_SETTING) */
  readonly setting?: OperationalSetting;

  /** Audit redaction */
  readonly audit_redaction: AuditRedactionBase;
}

/**
 * Safe mode state used at evaluation time.
 * Binds decision to the safe-mode state for audits.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @see schema/hermes-message.schema.json — $defs.SafeModeStateUsed
 */
export interface SafeModeStateUsed {
  /** Whether safe mode was enabled */
  readonly enabled: boolean;
  /** When safe mode took effect */
  readonly effective_at?: IsoDateTime;
  /** When safe mode expires */
  readonly effective_until?: IsoDateTime;
}
