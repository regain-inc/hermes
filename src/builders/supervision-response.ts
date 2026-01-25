/**
 * Builder for SupervisionResponse messages
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @module builders/supervision-response
 */

import type { ConflictEvaluation } from '../types/composition';
import type { ControlCommand, SafeModeStateUsed } from '../types/control';
import type { Mode, ReasonCode, SubjectRef, SupervisionDecision } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';
import type { HealthStateSnapshotRef } from '../types/snapshot';
import type {
  ApprovedConstraints,
  PerProposalDecision,
  SupervisionResponse,
  SupervisionResponseAuditRedaction,
} from '../types/supervision';
import { createTraceContext } from '../utils/trace';

/**
 * Options for creating a SupervisionResponse.
 */
export interface SupervisionResponseOptions {
  /** Operational mode */
  readonly mode: Mode;

  /** Patient subject reference */
  readonly subject: SubjectRef;

  /** Health state snapshot reference (echoed from request) */
  readonly snapshot: HealthStateSnapshotRef;

  /** Overall supervision decision */
  readonly decision: SupervisionDecision;

  /** Reason codes for the decision */
  readonly reason_codes: readonly ReasonCode[];

  /** Human-readable explanation */
  readonly explanation: string;

  // Optional fields

  /** Echo of request idempotency key */
  readonly request_idempotency_key?: string;

  /** Optional constraints if approved */
  readonly approved_constraints?: ApprovedConstraints;

  /** Control commands */
  readonly control_commands?: readonly ControlCommand[];

  /** Safe-mode state used at evaluation time */
  readonly safe_mode_state_used?: SafeModeStateUsed;

  /** Per-proposal decisions for partial approval */
  readonly per_proposal_decisions?: readonly PerProposalDecision[];

  /** Conflict evaluation results */
  readonly conflict_evaluations?: readonly ConflictEvaluation[];

  // Trace context options

  /** Service version for trace context */
  readonly service_version?: string;

  /** Ruleset version for trace context */
  readonly ruleset_version?: string;

  /** Original trace_id to maintain correlation */
  readonly trace_id?: string;
}

/**
 * Creates a SupervisionResponse message.
 *
 * @param options - Response configuration
 * @returns A fully formed SupervisionResponse
 *
 * @example
 * ```typescript
 * const response = createSupervisionResponse({
 *   mode: 'advocate_clinical',
 *   subject: { subject_type: 'patient', subject_id: 'patient-123', organization_id: 'org-1' },
 *   snapshot: request.snapshot,
 *   decision: 'APPROVED',
 *   reason_codes: [],
 *   explanation: 'All proposals meet safety criteria.',
 *   request_idempotency_key: request.idempotency_key,
 *   trace_id: request.trace.trace_id,
 * });
 * ```
 */
export function createSupervisionResponse(
  options: SupervisionResponseOptions
): SupervisionResponse {
  const {
    mode,
    subject,
    snapshot,
    decision,
    reason_codes,
    explanation,
    request_idempotency_key,
    approved_constraints,
    control_commands,
    safe_mode_state_used,
    per_proposal_decisions,
    conflict_evaluations,
    service_version = '1.0.0',
    ruleset_version,
    trace_id,
  } = options;

  // Create trace context
  const trace = createTraceContext({
    system: 'popper',
    service_version,
    ...(ruleset_version && { ruleset_version }),
    ...(trace_id && { existingTraceId: trace_id }),
  });

  // Build audit redaction
  const auditRedaction: SupervisionResponseAuditRedaction = {
    summary: `Supervision response: ${decision}`,
    decision,
    reason_codes: [...reason_codes],
  };

  // Build response
  const response: SupervisionResponse = {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'supervision_response',
    trace,
    mode,
    subject,
    snapshot,
    decision,
    reason_codes,
    explanation,
    audit_redaction: auditRedaction,
  };

  // Add optional fields
  if (request_idempotency_key !== undefined) {
    (response as { request_idempotency_key?: string }).request_idempotency_key =
      request_idempotency_key;
  }
  if (approved_constraints !== undefined) {
    (response as { approved_constraints?: ApprovedConstraints }).approved_constraints =
      approved_constraints;
  }
  if (control_commands !== undefined) {
    (response as { control_commands?: readonly ControlCommand[] }).control_commands =
      control_commands;
  }
  if (safe_mode_state_used !== undefined) {
    (response as { safe_mode_state_used?: SafeModeStateUsed }).safe_mode_state_used =
      safe_mode_state_used;
  }
  if (per_proposal_decisions !== undefined) {
    (
      response as { per_proposal_decisions?: readonly PerProposalDecision[] }
    ).per_proposal_decisions = per_proposal_decisions;
  }
  if (conflict_evaluations !== undefined) {
    (response as { conflict_evaluations?: readonly ConflictEvaluation[] }).conflict_evaluations =
      conflict_evaluations;
  }

  return response;
}
