/**
 * Clinician feedback types for Hermes protocol
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2-4.3
 * @module types/feedback
 */

import type { IsoDateTime, ProposedInterventionKind } from './core';

// =============================================================================
// Section 4.2.1: Clinician Action
// =============================================================================

/**
 * Clinician's decision on a routed proposal.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2.1
 * @see schema/hermes-message.schema.json — $defs.ClinicianAction
 */
export type ClinicianAction =
  | 'accepted' // Clinician approved Deutsch's proposal as-is
  | 'modified' // Clinician modified the proposal
  | 'rejected' // Clinician rejected the proposal
  | 'deferred'; // Clinician deferred decision (needs more info)

/**
 * All valid clinician actions as a readonly array for runtime validation.
 */
export const CLINICIAN_ACTIONS: readonly ClinicianAction[] = [
  'accepted',
  'modified',
  'rejected',
  'deferred',
] as const;

// =============================================================================
// Section 4.2.2: Rationale Category
// =============================================================================

/**
 * Structured categories for clinician override rationales.
 * Based on malpractice documentation best practices and real-world override patterns.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2.2
 * @see schema/hermes-message.schema.json — $defs.RationaleCategory
 */
export type RationaleCategory =
  | 'contraindication' // Medical contraindication identified
  | 'drug_interaction' // Drug-drug or drug-condition interaction
  | 'patient_preference' // Patient preference consideration
  | 'clinical_judgment' // Clinician experience/judgment
  | 'missing_context' // Important context was missing from snapshot
  | 'protocol_not_applicable' // Protocol doesn't apply to this patient
  | 'demographic_consideration' // Age/weight/renal function not suitable
  | 'recent_adverse_event' // Patient had adverse event to similar treatment
  | 'comorbidity_conflict' // Conflicts with another condition
  | 'insurance_formulary' // Insurance/formulary constraint (non-clinical)
  | 'other';

/**
 * All valid rationale categories as a readonly array for runtime validation.
 */
export const RATIONALE_CATEGORIES: readonly RationaleCategory[] = [
  'contraindication',
  'drug_interaction',
  'patient_preference',
  'clinical_judgment',
  'missing_context',
  'protocol_not_applicable',
  'demographic_consideration',
  'recent_adverse_event',
  'comorbidity_conflict',
  'insurance_formulary',
  'other',
] as const;

// =============================================================================
// Section 4.2: Clinician Role
// =============================================================================

/**
 * Clinician role for feedback attribution.
 * @see schema/hermes-message.schema.json — $defs.ClinicianRole
 */
export type ClinicianRole =
  | 'attending'
  | 'specialist'
  | 'primary_care'
  | 'nurse_practitioner'
  | 'physician_assistant'
  | 'other';

/**
 * All valid clinician roles as a readonly array for runtime validation.
 */
export const CLINICIAN_ROLES: readonly ClinicianRole[] = [
  'attending',
  'specialist',
  'primary_care',
  'nurse_practitioner',
  'physician_assistant',
  'other',
] as const;

// =============================================================================
// Section 4.3: Clinician Override History
// =============================================================================

/**
 * Confidence level for clinician decisions.
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Scope of applicability for an override.
 */
export interface OverrideApplicability {
  /** Drug class this override applies to (e.g., "ACE_INHIBITOR") */
  readonly medication_class?: string;
  /** Specific medication (e.g., "lisinopril") */
  readonly medication_specific?: string;
  /** Type of intervention this override applies to */
  readonly intervention_kind?: ProposedInterventionKind;
}

/**
 * Single active override in patient history.
 */
export interface ActiveOverride {
  /** Trace ID of the original supervision request */
  readonly original_trace_id: string;
  /** What the clinician decided */
  readonly action: ClinicianAction;
  /** When the decision was made */
  readonly occurred_at: IsoDateTime;
  /** Role of the deciding clinician */
  readonly clinician_role?: ClinicianRole;
  /** Specialty of the clinician (e.g., "cardiology") */
  readonly clinician_specialty?: string;
  /** Brief explanation (MUST NOT include direct identifiers, max 500 chars) */
  readonly rationale_summary: string;
  /** Structured category for analytics */
  readonly rationale_category: RationaleCategory;
  /** How confident the clinician is in this decision */
  readonly confidence?: ConfidenceLevel;
  /** What this override applies to */
  readonly applies_to?: OverrideApplicability;
  /** When to re-evaluate (ISO 8601, REQUIRED unless is_permanent) */
  readonly valid_until?: IsoDateTime;
  /** Permanent patient-specific contraindication */
  readonly is_permanent?: boolean;
  /** What would trigger re-evaluation */
  readonly re_evaluation_trigger?: string;
  /** Whether another clinician disagreed */
  readonly has_conflicting_feedback?: boolean;
  /** If conflicting, is this the authoritative one? */
  readonly most_recent_wins?: boolean;
}

/**
 * Conflict type for unresolved clinician disagreements.
 */
export type OverrideConflictType = 'reversal' | 'disagreement';

/**
 * Unresolved conflict between clinician overrides (for ClinicianOverrideHistory).
 */
export interface HistoryOverrideConflict {
  /** Unique identifier for this conflict */
  readonly conflict_id: string;
  /** The conflicting feedback trace IDs */
  readonly override_trace_ids: readonly string[];
  /** Type of conflict */
  readonly conflict_type: OverrideConflictType;
  /** Does this need attending/specialist review? */
  readonly requires_resolution: boolean;
  /** Suggested resolution action */
  readonly recommended_action?: string;
}

/**
 * Care continuity metadata for clinical handoffs.
 * Per IOM safety recommendations.
 */
export interface CareHandoff {
  /** When the handoff occurred */
  readonly occurred_at: IsoDateTime;
  /** Source organization */
  readonly from_organization_id?: string;
  /** Destination organization */
  readonly to_organization_id?: string;
  /** Number of overrides transferred */
  readonly overrides_transferred: number;
  /** Handoff notes */
  readonly notes?: string;
}

/**
 * Patient-specific override context for case reassessment.
 * DISTINCT from RLHF (model training) — this is patient-specific context.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3
 * @see schema/hermes-message.schema.json — $defs.ClinicianOverrideHistory
 */
export interface ClinicianOverrideHistory {
  /** Total number of overrides for this patient */
  readonly total_overrides: number;

  /** Number of overrides in the last 30 days */
  readonly recent_overrides_30d: number;

  /** Alert fatigue indicators (per FDA drift monitoring) */
  readonly override_rate_trend?: 'increasing' | 'stable' | 'decreasing';

  /**
   * Active overrides that may affect current reasoning.
   * SHOULD NOT exceed 50 entries per patient.
   */
  readonly active_overrides: readonly ActiveOverride[];

  /**
   * Unresolved conflicts between clinicians.
   * SHOULD NOT exceed 10 entries; if more exist, escalate immediately.
   */
  readonly unresolved_conflicts?: readonly HistoryOverrideConflict[];

  /** Care continuity metadata for handoffs */
  readonly last_handoff?: CareHandoff;
}

// =============================================================================
// Size Bounds (Normative)
// =============================================================================

/**
 * Maximum number of active overrides per patient.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3.1
 */
export const MAX_ACTIVE_OVERRIDES = 50;

/**
 * Maximum number of unresolved conflicts.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3.1
 */
export const MAX_UNRESOLVED_CONFLICTS = 10;

/**
 * Maximum length of rationale summary in characters.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3.1
 */
export const MAX_RATIONALE_SUMMARY_LENGTH = 500;

/**
 * Maximum size of prior_clinician_overrides object in bytes.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3.1
 */
export const MAX_OVERRIDE_HISTORY_SIZE_BYTES = 50_000;
