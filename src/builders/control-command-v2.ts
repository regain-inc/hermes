/**
 * Builder for ControlCommandV2 messages
 * @module builders/control-command-v2
 */

import type {
  CommandPriority,
  ControlCommandV2,
  ControlCommandV2Kind,
  ModeTransition,
  OperationalSettingChange,
  SafeModeConfigV2,
} from '../types/control-v2';
import { createIsoDateTime } from '../utils/datetime';

/**
 * Options for creating a ControlCommandV2.
 */
export interface ControlCommandV2Options {
  /** Command kind */
  readonly kind: ControlCommandV2Kind;

  /** Priority level (default: ROUTINE) */
  readonly priority?: CommandPriority;

  /** Target system identifier (default: 'deutsch') */
  readonly target_system?: string;

  /** Target organization ID */
  readonly target_organization_id?: string;

  /** Target instance ID */
  readonly target_instance_id?: string;

  /** Source system identifier (default: 'popper') */
  readonly source_system?: string;

  /** Source service version (default: '2.0.0') */
  readonly source_service_version?: string;

  /** Source operator ID */
  readonly source_operator_id?: string;

  /** Safe mode configuration (for SET_SAFE_MODE) */
  readonly safe_mode?: SafeModeConfigV2;

  /** Operational setting changes (for SET_OPERATIONAL_SETTINGS) */
  readonly settings?: readonly OperationalSettingChange[];

  /** Mode transition payload (for SET_OPERATIONAL_MODE) */
  readonly mode_transition?: ModeTransition;

  /** Batch correlation ID */
  readonly command_batch_id?: string;

  /** PHI-free audit summary */
  readonly audit_summary?: string;
}

/**
 * Creates a ControlCommandV2 message.
 *
 * @param options - Command configuration
 * @returns A fully formed ControlCommandV2
 *
 * @example
 * ```typescript
 * const cmd = createControlCommandV2({
 *   kind: 'SET_OPERATIONAL_SETTINGS',
 *   settings: [{ key: 'autonomy.max_risk_level', value: 'low' }],
 * });
 * ```
 */
export function createControlCommandV2(options: ControlCommandV2Options): ControlCommandV2 {
  const now = createIsoDateTime();
  const commandId = crypto.randomUUID();

  const command: ControlCommandV2 = {
    hermes_version: '2.0.0',
    message_type: 'control_command_v2',
    command_id: commandId,
    created_at: now,
    source: {
      system: options.source_system ?? 'popper',
      service_version: options.source_service_version ?? '2.0.0',
    },
    target: {
      system: options.target_system ?? 'deutsch',
    },
    kind: options.kind,
    priority: options.priority ?? 'ROUTINE',
    idempotency_key: crypto.randomUUID(),
    audit_redaction: {
      summary: options.audit_summary ?? `Control command: ${options.kind}`,
    },
  };

  // Add optional fields — exactOptionalPropertyTypes: do NOT assign undefined
  if (options.source_operator_id) {
    (command.source as { operator_id?: string }).operator_id = options.source_operator_id;
  }
  if (options.target_organization_id) {
    (command.target as { organization_id?: string }).organization_id =
      options.target_organization_id;
  }
  if (options.target_instance_id) {
    (command.target as { instance_id?: string }).instance_id = options.target_instance_id;
  }
  if (options.safe_mode) {
    (command as { safe_mode?: SafeModeConfigV2 }).safe_mode = options.safe_mode;
  }
  if (options.settings) {
    (command as { settings?: readonly OperationalSettingChange[] }).settings = options.settings;
  }
  if (options.mode_transition) {
    (command as { mode_transition?: ModeTransition }).mode_transition = options.mode_transition;
  }
  if (options.command_batch_id) {
    (command as { command_batch_id?: string }).command_batch_id = options.command_batch_id;
  }

  return command;
}
