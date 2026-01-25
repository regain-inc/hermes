/**
 * Audit event types for Hermes protocol
 * Standard audit envelope for observability and compliance.
 *
 * @module types/audit
 */

import type { HermesVersion, IsoDateTime, Mode, SubjectRef, TraceContext } from './core';

// =============================================================================
// Section 4: Audit Event Types
// =============================================================================

/**
 * Types of audit events.
 * @see schema/hermes-message.schema.json — $defs.AuditEventType
 */
export type AuditEventType =
  | 'SUPERVISION_REQUEST_SENT'
  | 'SUPERVISION_REQUEST_RECEIVED'
  | 'SUPERVISION_RESPONSE_DECIDED'
  | 'SUPERVISION_RESPONSE_RECEIVED'
  | 'CONTROL_COMMAND_ISSUED'
  | 'CONTROL_COMMAND_APPLIED'
  | 'SAFE_MODE_ENABLED'
  | 'SAFE_MODE_DISABLED'
  | 'OUTPUT_RETURNED'
  | 'VALIDATION_FAILED'
  | 'OTHER';

/**
 * All valid audit event types as a readonly array for runtime validation.
 */
export const AUDIT_EVENT_TYPES: readonly AuditEventType[] = [
  'SUPERVISION_REQUEST_SENT',
  'SUPERVISION_REQUEST_RECEIVED',
  'SUPERVISION_RESPONSE_DECIDED',
  'SUPERVISION_RESPONSE_RECEIVED',
  'CONTROL_COMMAND_ISSUED',
  'CONTROL_COMMAND_APPLIED',
  'SAFE_MODE_ENABLED',
  'SAFE_MODE_DISABLED',
  'OUTPUT_RETURNED',
  'VALIDATION_FAILED',
  'OTHER',
] as const;

/**
 * Audit event for observability.
 * Common envelope so systems can emit events that are joinable by trace_id.
 *
 * @see schema/hermes-message.schema.json — $defs.AuditEvent
 */
export interface AuditEvent {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'audit_event';

  /** Type of audit event */
  readonly event_type: AuditEventType;
  /**
   * Custom event type when event_type is 'OTHER'.
   * REQUIRED if event_type === 'OTHER'.
   */
  readonly other_event_type?: string;

  /** When the event occurred */
  readonly occurred_at: IsoDateTime;

  /** Distributed tracing context */
  readonly trace: TraceContext;
  /** Operational mode */
  readonly mode: Mode;
  /** Patient subject reference */
  readonly subject: SubjectRef;

  /**
   * PHI-minimized summary of the event.
   * MUST NOT include direct identifiers.
   */
  readonly summary: string;

  /** Optional structured tags for dashboards */
  readonly tags?: Readonly<Record<string, string>>;
}

// =============================================================================
// Audit Event Emission Expectations (Normative)
// =============================================================================

/**
 * Audit event emission requirements:
 *
 * - If a system ISSUES a ControlCommand, it MUST emit CONTROL_COMMAND_ISSUED
 * - If a system APPLIES a received ControlCommand, it MUST emit CONTROL_COMMAND_APPLIED
 *   (PHI-minimized), so auditors can reconstruct enforcement
 * - For VALIDATION_FAILED events related to integrity/replay/snapshot failures,
 *   deployments SHOULD use AuditEvent.tags for classification
 *
 */
export const AUDIT_EMISSION_REQUIREMENTS = {
  CONTROL_COMMAND_ISSUED: 'MUST emit when issuing a ControlCommand',
  CONTROL_COMMAND_APPLIED: 'MUST emit when applying a received ControlCommand',
  VALIDATION_FAILED: 'SHOULD use tags for integrity/replay/snapshot failure classification',
} as const;
