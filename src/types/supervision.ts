/**
 * Supervision contract types for Hermes protocol (Deutsch ↔ Popper)
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3
 * @see 03-hermes-specs/01-hermes-system-spec.md — Section 3
 * @module types/supervision
 */

import type {
  CompositionMetadata,
  ConflictEvaluation,
  ContributingDomain,
  CrossDomainConflict,
} from './composition';
import type { ControlCommand, SafeModeStateUsed } from './control';
import type {
  AuditRedactionBase,
  HermesVersion,
  IsoDateTime,
  Mode,
  ProposedInterventionKind,
  ReasonCode,
  SubjectRef,
  SupervisionDecision,
  TraceContext,
} from './core';
import type {
  ClinicianAction,
  ClinicianRole,
  ConfidenceLevel,
  OverrideApplicability,
  RationaleCategory,
} from './feedback';
import type { ProposedIntervention } from './proposals';
import type { HealthStateSnapshotRef } from './snapshot';

// =============================================================================
// Section 3.4: Input Risk
// =============================================================================

/**
 * Input risk flags.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 */
export type InputRiskFlag =
  | 'phi_detected'
  | 'prompt_injection_suspected'
  | 'malware_suspected'
  | 'other';

/**
 * All valid input risk flags as a readonly array for runtime validation.
 */
export const INPUT_RISK_FLAGS: readonly InputRiskFlag[] = [
  'phi_detected',
  'prompt_injection_suspected',
  'malware_suspected',
  'other',
] as const;

/**
 * PHI-minimized risk flags about the inputs used to produce proposals.
 * Enables Popper to be conservative when multimodal inputs may be compromised.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 */
export interface InputRisk {
  /** Whether attachments are present in the input */
  readonly attachments_present?: boolean;
  /** Risk flags detected in the input */
  readonly flags?: readonly InputRiskFlag[];
  /** Brief notes; MUST NOT include direct identifiers */
  readonly notes?: string;
}

// =============================================================================
// Section 3.4: Prior Override (for SupervisionRequest)
// =============================================================================

/**
 * Relevant prior override for supervision request context.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 * @see schema/hermes-message.schema.json — $defs.PriorOverride
 */
export interface PriorOverride {
  /** Trace ID of the original supervision request */
  readonly original_trace_id: string;
  /** What the clinician decided */
  readonly action: ClinicianAction;
  /** Brief explanation (MUST NOT include direct identifiers, max 500 chars) */
  readonly rationale_summary: string;
  /** Structured category for analytics */
  readonly rationale_category: RationaleCategory;
  /** How confident the clinician is */
  readonly confidence?: ConfidenceLevel;
  /** Role of the deciding clinician */
  readonly clinician_role?: ClinicianRole;
  /** What this override applies to */
  readonly applies_to?: OverrideApplicability;
  /** How old is this override (in days) */
  readonly age_days: number;
  /** Permanent patient-specific contraindication */
  readonly is_permanent?: boolean;
}

/**
 * Unresolved override conflict for supervision request.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 * @see schema/hermes-message.schema.json — $defs.UnresolvedOverrideConflict
 */
export interface UnresolvedOverrideConflict {
  /** Unique identifier for this conflict */
  readonly conflict_id: string;
  /** Type of conflict */
  readonly conflict_type: 'reversal' | 'disagreement';
  /** Which intervention kinds are affected */
  readonly affected_intervention_kinds: readonly ProposedInterventionKind[];
  /** The conflicting feedback trace IDs */
  readonly override_trace_ids?: readonly string[];
  /** Human-readable conflict description */
  readonly conflict_summary?: string;
  /** Does this need attending review? */
  readonly requires_attending_resolution?: boolean;
  /** Suggested resolution action */
  readonly recommended_action?: string;
}

/**
 * Alert fatigue indicators.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 */
export interface AlertFatigueIndicators {
  /** Average response time < threshold (e.g., 30s) */
  readonly rapid_responses: boolean;
  /** Many rejections with low confidence */
  readonly low_confidence_rejections: boolean;
  /** Human-readable summary of detected pattern */
  readonly pattern_detected?: string;
}

/**
 * Feedback metrics for alert fatigue analysis.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 * @see schema/hermes-message.schema.json — $defs.FeedbackMetrics
 */
export interface FeedbackMetrics {
  /** Override rate in the last 30 days (0.0-1.0) */
  readonly override_rate_30d: number;
  /** Trend of override rate */
  readonly override_rate_trend: 'increasing' | 'stable' | 'decreasing';
  /** Average response time in seconds */
  readonly avg_response_time_seconds?: number;
  /** Structured alert fatigue indicators */
  readonly alert_fatigue_indicators?: AlertFatigueIndicators;
}

// =============================================================================
// Section 3.4: Supervision Request
// =============================================================================

/**
 * Audit redaction for supervision request.
 */
export interface SupervisionRequestAuditRedaction extends AuditRedactionBase {
  /** Summaries of each proposal */
  readonly proposal_summaries: readonly string[];
  /** Whether there are unresolved clinician conflicts */
  readonly has_unresolved_conflicts?: boolean;
  /** Whether alert fatigue warning is present */
  readonly alert_fatigue_warning?: boolean;
  /** Bucketed override rate for analytics */
  readonly override_rate_bucket?: string;
}

/**
 * Request from Deutsch to Popper for supervision.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.4
 * @see 03-hermes-specs/01-hermes-system-spec.md — Section 3.1
 * @see schema/hermes-message.schema.json — $defs.SupervisionRequest
 */
export interface SupervisionRequest {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'supervision_request';

  /** Distributed tracing context */
  readonly trace: TraceContext;
  /** Operational mode */
  readonly mode: Mode;
  /** Patient subject reference */
  readonly subject: SubjectRef;
  /** Health state snapshot reference */
  readonly snapshot: HealthStateSnapshotRef;

  /**
   * Optional inline snapshot payload for deployments where Popper cannot
   * (or should not) fetch snapshots via snapshot_uri.
   * If present, this MUST be the exact JSON payload whose bytes are
   * hashed for snapshot.snapshot_hash.
   */
  readonly snapshot_payload?: Record<string, unknown>;

  /**
   * Replay protection / request binding.
   * Required in advocate_clinical deployments; recommended elsewhere.
   */
  readonly idempotency_key?: string;

  /** Request timestamp for clock skew and safe-mode effective checks */
  readonly request_timestamp?: IsoDateTime;

  /** PHI-minimized risk flags about the inputs */
  readonly input_risk?: InputRisk;

  /** Proposed interventions (at least one required) */
  readonly proposals: readonly ProposedIntervention[];

  /** Optional free-text notes (SHOULD be brief; avoid PHI) */
  readonly notes?: string;

  // === MULTI-DOMAIN COMPOSITION FIELDS ===

  /** Cross-domain conflicts detected and proposed resolutions */
  readonly cross_domain_conflicts?: readonly CrossDomainConflict[];

  /** Which domain modules contributed to this request */
  readonly contributing_domains?: readonly ContributingDomain[];

  /** Composition metadata for audit and reproducibility */
  readonly composition_metadata?: CompositionMetadata;

  // === CLINICIAN FEEDBACK CONTEXT ===

  /** Relevant prior overrides for this patient (PHI-minimized) */
  readonly relevant_prior_overrides?: readonly PriorOverride[];

  /** Unresolved clinician disagreements */
  readonly unresolved_override_conflicts?: readonly UnresolvedOverrideConflict[];

  /** Alert fatigue indicators */
  readonly feedback_metrics?: FeedbackMetrics;

  /** Redacted form safe for general logs */
  readonly audit_redaction: SupervisionRequestAuditRedaction;
}

// =============================================================================
// Section 3.5: Approved Constraints
// =============================================================================

/**
 * Constraints on approved proposals.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @see schema/hermes-message.schema.json — $defs.ApprovedConstraints
 */
export interface ApprovedConstraints {
  /** If not resolved by this time, route to clinician */
  readonly must_route_after?: IsoDateTime;
  /** Which action types are allowed */
  readonly allowed_actions?: readonly ProposedInterventionKind[];
}

// =============================================================================
// Section 3.5: Per-Proposal Decision
// =============================================================================

/**
 * Decision for an individual proposal.
 * Used for partial approval scenarios in multi-domain composition.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @see schema/hermes-message.schema.json — $defs.PerProposalDecision
 */
export interface PerProposalDecision {
  /** Which proposal this decision applies to */
  readonly proposal_id: string;
  /** The supervision decision */
  readonly decision: SupervisionDecision;
  /** Reason codes for the decision */
  readonly reason_codes: readonly ReasonCode[];
  /** Human-readable explanation */
  readonly explanation?: string;
}

// =============================================================================
// Section 3.5: Supervision Response
// =============================================================================

/**
 * Audit redaction for supervision response.
 */
export interface SupervisionResponseAuditRedaction extends AuditRedactionBase {
  /** The overall decision */
  readonly decision: SupervisionDecision;
  /** Reason codes for the decision */
  readonly reason_codes: readonly ReasonCode[];
}

/**
 * Response from Popper to Deutsch with supervision decision.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @see 03-hermes-specs/01-hermes-system-spec.md — Section 3.2
 * @see schema/hermes-message.schema.json — $defs.SupervisionResponse
 */
export interface SupervisionResponse {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'supervision_response';

  /** Distributed tracing context */
  readonly trace: TraceContext;
  /** Operational mode */
  readonly mode: Mode;
  /** Patient subject reference */
  readonly subject: SubjectRef;
  /** Health state snapshot reference (echoed from request) */
  readonly snapshot: HealthStateSnapshotRef;

  /** Echo of request idempotency key */
  readonly request_idempotency_key?: string;
  /** Response timestamp */
  readonly response_timestamp?: IsoDateTime;

  /** Overall supervision decision */
  readonly decision: SupervisionDecision;
  /** Reason codes for the decision */
  readonly reason_codes: readonly ReasonCode[];
  /** Human-readable explanation (may be shown to clinicians) */
  readonly explanation: string;

  /** Optional constraints if approved */
  readonly approved_constraints?: ApprovedConstraints;

  /** Control plane hooks (Popper can modify settings/safe-mode) */
  readonly control_commands?: readonly ControlCommand[];

  /** Safe-mode state used at evaluation time (for audits) */
  readonly safe_mode_state_used?: SafeModeStateUsed;

  // === MULTI-DOMAIN COMPOSITION FIELDS ===

  /**
   * Per-proposal decisions for partial approval scenarios.
   * If absent, the top-level decision applies to all proposals.
   */
  readonly per_proposal_decisions?: readonly PerProposalDecision[];

  /** Conflict evaluation results */
  readonly conflict_evaluations?: readonly ConflictEvaluation[];

  /** Redacted form safe for general logs */
  readonly audit_redaction: SupervisionResponseAuditRedaction;
}
