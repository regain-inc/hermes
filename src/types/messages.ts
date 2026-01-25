/**
 * Hermes message union types and type guards
 * Provides discriminated union of all Hermes message types.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md
 * @module types/messages
 */

import type { AuditEvent } from './audit';
import type { BiasDetectionEvent } from './bias';
import type { CrossDomainConflict } from './composition';
import type { HermesError } from './errors';
import type { ClinicianFeedbackEvent } from './feedback';
import type { SupervisionRequest, SupervisionResponse } from './supervision';

// =============================================================================
// Union Type: HermesMessage
// =============================================================================

/**
 * All possible message_type values in Hermes protocol.
 */
export type HermesMessageType =
  | 'supervision_request'
  | 'supervision_response'
  | 'audit_event'
  | 'error'
  | 'clinician_feedback'
  | 'bias_detection';

/**
 * All valid message types as a readonly array for runtime validation.
 */
export const HERMES_MESSAGE_TYPES: readonly HermesMessageType[] = [
  'supervision_request',
  'supervision_response',
  'audit_event',
  'error',
  'clinician_feedback',
  'bias_detection',
] as const;

/**
 * Union of all Hermes message types.
 * This is the discriminated union that can represent any valid Hermes message.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md
 */
export type HermesMessage =
  | SupervisionRequest
  | SupervisionResponse
  | AuditEvent
  | HermesError
  | ClinicianFeedbackEvent
  | BiasDetectionEvent;

/**
 * Union of all Hermes event types (excludes request/response/error).
 * Used for event-driven architectures.
 */
export type HermesEvent = AuditEvent | ClinicianFeedbackEvent | BiasDetectionEvent;

/**
 * All valid event types as a readonly array for runtime validation.
 */
export const HERMES_EVENT_TYPES: readonly HermesMessageType[] = [
  'audit_event',
  'clinician_feedback',
  'bias_detection',
] as const;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for SupervisionRequest.
 *
 * @param msg - Message to check
 * @returns True if message is a SupervisionRequest
 */
export function isSupervisionRequest(msg: HermesMessage): msg is SupervisionRequest {
  return msg.message_type === 'supervision_request';
}

/**
 * Type guard for SupervisionResponse.
 *
 * @param msg - Message to check
 * @returns True if message is a SupervisionResponse
 */
export function isSupervisionResponse(msg: HermesMessage): msg is SupervisionResponse {
  return msg.message_type === 'supervision_response';
}

/**
 * Type guard for AuditEvent.
 *
 * @param msg - Message to check
 * @returns True if message is an AuditEvent
 */
export function isAuditEvent(msg: HermesMessage): msg is AuditEvent {
  return msg.message_type === 'audit_event';
}

/**
 * Type guard for HermesError.
 *
 * @param msg - Message to check
 * @returns True if message is a HermesError
 */
export function isHermesError(msg: HermesMessage): msg is HermesError {
  return msg.message_type === 'error';
}

/**
 * Type guard for ClinicianFeedbackEvent.
 *
 * @param msg - Message to check
 * @returns True if message is a ClinicianFeedbackEvent
 */
export function isClinicianFeedbackEvent(msg: HermesMessage): msg is ClinicianFeedbackEvent {
  return msg.message_type === 'clinician_feedback';
}

/**
 * Type guard for BiasDetectionEvent.
 *
 * @param msg - Message to check
 * @returns True if message is a BiasDetectionEvent
 */
export function isBiasDetectionEvent(msg: HermesMessage): msg is BiasDetectionEvent {
  return msg.message_type === 'bias_detection';
}

/**
 * Type guard for HermesEvent (any event type).
 *
 * @param msg - Message to check
 * @returns True if message is an event (audit, feedback, or bias detection)
 */
export function isHermesEvent(msg: HermesMessage): msg is HermesEvent {
  return (
    msg.message_type === 'audit_event' ||
    msg.message_type === 'clinician_feedback' ||
    msg.message_type === 'bias_detection'
  );
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Extract message type from a HermesMessage.
 */
export type MessageTypeOf<T extends HermesMessage> = T['message_type'];

/**
 * Get the message type for a given message type discriminator.
 */
export type MessageForType<T extends HermesMessageType> = Extract<
  HermesMessage,
  { message_type: T }
>;

// =============================================================================
// Cross-Domain Conflict (re-export for convenience)
// =============================================================================

/**
 * Re-export CrossDomainConflict for use in message handling.
 * Note: CrossDomainConflict is not a top-level message type, but is
 * included in SupervisionRequest.cross_domain_conflicts.
 */
export type { CrossDomainConflict };
