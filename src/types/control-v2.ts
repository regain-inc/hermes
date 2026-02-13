// src/types/control-v2.ts

import type { AuditRedactionBase, IsoDateTime } from './core';

// ─── Command Types (01-control-channel-v2-spec.md §1.1) ───

/**
 * Control command v2 kinds.
 * @see 01-control-channel-v2-spec.md §1.2
 */
export type ControlCommandV2Kind =
  | 'SET_SAFE_MODE'
  | 'SET_OPERATIONAL_SETTINGS' // Plural — batched
  | 'GET_OPERATIONAL_STATE' // New: request state snapshot
  | 'SET_OPERATIONAL_MODE'; // New: mode transitions

export const CONTROL_COMMAND_V2_KINDS: readonly ControlCommandV2Kind[] = [
  'SET_SAFE_MODE',
  'SET_OPERATIONAL_SETTINGS',
  'GET_OPERATIONAL_STATE',
  'SET_OPERATIONAL_MODE',
] as const;

/**
 * Command priority levels.
 * @see 01-control-channel-v2-spec.md §1.3
 */
export type CommandPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export const COMMAND_PRIORITIES: readonly CommandPriority[] = [
  'ROUTINE',
  'URGENT',
  'EMERGENCY',
] as const;

/**
 * Operational modes for mode transitions.
 * @see 01-control-channel-v2-spec.md §1.1 mode_transition.target_mode
 */
export type OperationalMode = 'NORMAL' | 'RESTRICTED' | 'SAFE_MODE' | 'MAINTENANCE';

export const OPERATIONAL_MODES: readonly OperationalMode[] = [
  'NORMAL',
  'RESTRICTED',
  'SAFE_MODE',
  'MAINTENANCE',
] as const;

/**
 * Typed setting value — replaces stringly-typed v1.
 * @see 02-operational-settings-catalog.md §1 type field
 */
export type SettingValue = boolean | string | number | string[];

/**
 * Source of a control command.
 */
export interface ControlCommandSource {
  readonly system: string;
  readonly service_version: string;
  readonly operator_id?: string;
}

/**
 * Target of a control command.
 */
export interface ControlCommandTarget {
  readonly system: string;
  readonly organization_id?: string;
  readonly instance_id?: string;
}

/**
 * A single setting change within a batch.
 * @see 01-control-channel-v2-spec.md §1.1 OperationalSettingChange
 */
export interface OperationalSettingChange {
  readonly key: string;
  readonly value: SettingValue;
  readonly previous_value?: SettingValue;
  readonly effective_until?: IsoDateTime;
  readonly reason?: string;
}

/**
 * Safe mode configuration (shared with v1 SafeModeConfig but extended with effective_until).
 */
export interface SafeModeConfigV2 {
  readonly enabled: boolean;
  readonly reason: string;
  readonly effective_at?: IsoDateTime;
  readonly effective_until?: IsoDateTime;
}

/**
 * Mode transition payload.
 * @see 01-control-channel-v2-spec.md §1.1 mode_transition
 */
export interface ModeTransition {
  readonly target_mode: OperationalMode;
  readonly reason: string;
  readonly effective_at?: IsoDateTime;
}

/**
 * ControlCommand v2 — typed, batched, priority-aware control message.
 * @see 01-control-channel-v2-spec.md §1.1
 */
export interface ControlCommandV2 {
  readonly hermes_version: string;
  readonly message_type: 'control_command_v2';

  // Identity
  readonly command_id: string;
  readonly command_batch_id?: string;
  readonly created_at: IsoDateTime;

  // Source & Target
  readonly source: ControlCommandSource;
  readonly target: ControlCommandTarget;

  // Command
  readonly kind: ControlCommandV2Kind;
  readonly priority: CommandPriority;

  // Payloads (kind-dependent)
  readonly safe_mode?: SafeModeConfigV2;
  readonly settings?: readonly OperationalSettingChange[];
  readonly mode_transition?: ModeTransition;

  // Idempotency
  readonly idempotency_key: string;

  // Audit
  readonly audit_redaction: AuditRedactionBase;
}

// ─── Response Types (03-ack-nack-protocol.md §1.1) ───

/**
 * Status of a control command response.
 * @see 03-ack-nack-protocol.md §2
 */
export type ControlCommandStatus = 'APPLIED' | 'REJECTED' | 'DEFERRED';

export const CONTROL_COMMAND_STATUSES: readonly ControlCommandStatus[] = [
  'APPLIED',
  'REJECTED',
  'DEFERRED',
] as const;

/**
 * Per-setting result within a batch response.
 * @see 03-ack-nack-protocol.md §1.1 SettingApplicationResult
 */
export interface SettingApplicationResult {
  readonly key: string;
  readonly status: 'APPLIED' | 'REJECTED';
  readonly reason?: string;
  readonly applied_value?: unknown;
  readonly previous_value?: unknown;
}

/**
 * Full operational state snapshot — returned after command application.
 * @see 03-ack-nack-protocol.md §1.1 OperationalStateSnapshot
 */
export interface OperationalStateSnapshot {
  readonly snapshot_id: string;
  readonly created_at: IsoDateTime;
  readonly safe_mode: {
    readonly enabled: boolean;
    readonly reason?: string;
    readonly effective_at?: IsoDateTime;
    readonly effective_until?: IsoDateTime;
  };
  readonly operational_mode: OperationalMode;
  readonly settings: Record<string, unknown>;

  // Catalog discovery
  readonly catalog_version: string;
  readonly supported_keys: readonly string[];
  readonly extensions?: readonly string[];
}

/**
 * Deferred processing info.
 * @see 03-ack-nack-protocol.md §2.3
 */
export interface DeferredInfo {
  readonly estimated_apply_at: IsoDateTime;
  readonly retry_after_ms?: number;
}

/**
 * Response source (the responder system).
 */
export interface ControlResponseSource {
  readonly system: string;
  readonly service_version: string;
  readonly instance_id?: string;
}

/**
 * ACK/NACK response to a ControlCommandV2.
 * @see 03-ack-nack-protocol.md §1.1
 */
export interface ControlCommandResponse {
  readonly hermes_version: string;
  readonly message_type: 'control_command_response';

  // Correlation
  readonly command_id: string;
  readonly command_batch_id?: string;
  readonly response_id: string;

  // Timing
  readonly received_at: IsoDateTime;
  readonly responded_at: IsoDateTime;

  // Source
  readonly source: ControlResponseSource;

  // Result
  readonly status: ControlCommandStatus;
  readonly reason?: string;

  // Per-setting detail
  readonly setting_results?: readonly SettingApplicationResult[];

  // State snapshot
  readonly settings_snapshot?: OperationalStateSnapshot;

  // Deferred
  readonly deferred?: DeferredInfo;

  // Audit
  readonly audit_redaction: AuditRedactionBase;
}
