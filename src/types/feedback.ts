/**
 * Clinician feedback types for Hermes protocol
 * @module types/feedback
 */

import type {
  AuditRedactionBase,
  HermesVersion,
  IsoDateTime,
  Mode,
  ProposedInterventionKind,
  SubjectRef,
  TraceContext,
} from './core';
import type { EvidenceRef } from './evidence';
import type { HealthStateSnapshotRef } from './snapshot';

// =============================================================================
// Section 4.2.1: Clinician Action
// =============================================================================

/**
 * Clinician's decision on a routed proposal.
 * @see schema/hermes-message.schema.json — $defs.ClinicianAction
 */
export type ClinicianAction =
  | 'accepted' // Clinician approved Deutsch's proposal as-is
  | 'modified' // Clinician modified the proposal
  | 'rejected' // Clinician rejected the proposal
  | 'deferred'; // Clinician deferred decision — see DeferralReason for structured subtypes

// =============================================================================
// Section 4.2.1b: Deferral Reason Taxonomy (C5)
// @since Hermes v2.2
// @see 03-deutsch-cvd-cartridge-spec.md §13.2b
// =============================================================================

/**
 * Structured reason for deferral, enabling three-bucket analytics:
 * - Clinical delay (appropriate): awaiting_data, temporary_clinical_hold, not_clinically_appropriate_now
 * - Operational barrier (needs access support): access_barrier, patient_preference_delay
 * - Inertia-eligible (potential therapeutic inertia): address_next_visit, other
 *
 * @since Hermes v2.2
 */
export type DeferralReason =
  | 'awaiting_data' // labs pending, workup incomplete
  | 'temporary_clinical_hold' // post-op, acute illness, decompensation
  | 'patient_preference_delay' // patient wants to discuss at next visit
  | 'access_barrier' // cost, insurance, pharmacy issue
  | 'address_next_visit' // timing — will address at scheduled follow-up
  | 'not_clinically_appropriate_now' // legitimate clinical timing
  | 'other'; // free-text reason

/**
 * All valid deferral reasons as a readonly array for runtime validation.
 */
export const DEFERRAL_REASONS: readonly DeferralReason[] = [
  'awaiting_data',
  'temporary_clinical_hold',
  'patient_preference_delay',
  'access_barrier',
  'address_next_visit',
  'not_clinically_appropriate_now',
  'other',
] as const;

/**
 * Deferral reason classification buckets for analytics.
 */
export const CLINICAL_DELAY_REASONS: readonly DeferralReason[] = [
  'awaiting_data',
  'temporary_clinical_hold',
  'not_clinically_appropriate_now',
] as const;

export const OPERATIONAL_BARRIER_REASONS: readonly DeferralReason[] = [
  'access_barrier',
  'patient_preference_delay',
] as const;

export const INERTIA_ELIGIBLE_REASONS: readonly DeferralReason[] = [
  'address_next_visit',
  'other',
] as const;

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
 */
export const MAX_ACTIVE_OVERRIDES = 50;

/**
 * Maximum number of unresolved conflicts.
 */
export const MAX_UNRESOLVED_CONFLICTS = 10;

/**
 * Maximum length of rationale summary in characters.
 */
export const MAX_RATIONALE_SUMMARY_LENGTH = 500;

/**
 * Maximum size of prior_clinician_overrides object in bytes.
 */
export const MAX_OVERRIDE_HISTORY_SIZE_BYTES = 50_000;

// =============================================================================
// Section 4.2.3: Clinician Feedback Event
// =============================================================================

/**
 * Reference to the clinician who provided feedback.
 */
export interface ClinicianRef {
  /** Pseudonymous clinician ID (NOT name/NPI in audit) */
  readonly clinician_id: string;
  /** Role of the clinician */
  readonly role: ClinicianRole;
  /** Specialty (e.g., "cardiology", "nephrology") */
  readonly specialty?: string;
}

/**
 * Contraindication details for structured rationale.
 */
export interface ContraindicationDetails {
  /** ICD-10 or SNOMED condition code */
  readonly condition_code?: string;
  /** Severity of the contraindication */
  readonly severity: 'relative' | 'absolute';
}

/**
 * Structured rationale for clinician feedback.
 * REQUIRED (not optional) per liability best practices.
 *
 */
export interface ClinicianRationale {
  /** Brief explanation (MUST NOT include direct identifiers) */
  readonly summary: string;
  /** Structured category for analytics */
  readonly category: RationaleCategory;
  /** Free-text subcategory */
  readonly subcategory?: string;
  /** How confident is the clinician in this decision? */
  readonly confidence: ConfidenceLevel;
  /** Evidence supporting clinician's decision */
  readonly guideline_refs?: readonly EvidenceRef[];
  /** Structured fields for contraindication category */
  readonly contraindication_details?: ContraindicationDetails;
}

/**
 * Medication change details for modified actions.
 */
export interface MedicationChange {
  /** Summary of the original proposal */
  readonly original_proposal_summary?: string;
  /** Summary of what the clinician actually did */
  readonly actual_action_summary?: string;
  /** Why this alternative was chosen */
  readonly reason_for_alternative?: string;
}

/**
 * What clinician actually did (if modified).
 */
export interface ModifiedAction {
  /** Type of intervention actually performed */
  readonly intervention_kind: ProposedInterventionKind;
  /** PHI-minimized description of actual action */
  readonly summary: string;
  /** For medication changes */
  readonly medication_change?: MedicationChange;
}

/**
 * Extended scope of applicability for feedback.
 */
export interface FeedbackAppliesTo extends OverrideApplicability {
  /** When to re-evaluate (ISO 8601, REQUIRED unless is_permanent) */
  readonly valid_until?: IsoDateTime;
  /** Permanent patient-specific contraindication */
  readonly is_permanent?: boolean;
  /** What would trigger re-evaluation (e.g., "new renal function test") */
  readonly re_evaluation_trigger?: string;
}

/**
 * Conflict type for feedback.
 */
export type FeedbackConflictType = 'reversal' | 'escalation' | 'disagreement';

/**
 * Conflict with prior feedback.
 */
export interface FeedbackConflict {
  /** Previous feedback that this contradicts */
  readonly prior_trace_id: string;
  /** What the prior clinician decided */
  readonly prior_action: ClinicianAction;
  /** Type of conflict */
  readonly conflict_type: FeedbackConflictType;
  /** How was conflict resolved? */
  readonly resolution_note?: string;
}

/**
 * Age group for demographic context.
 */
export type AgeGroup = 'pediatric' | 'adult' | 'geriatric';

/**
 * Demographic context for bias monitoring per FDA requirements.
 */
export interface DemographicContext {
  /** Age group of the patient */
  readonly age_group?: AgeGroup;
  /**
   * Relevant demographics (e.g., ["chronic_kidney_disease", "heart_failure"]).
   * NOTE: NOT direct demographics (race/ethnicity) - only clinical factors.
   */
  readonly relevant_demographics?: readonly string[];
}

/**
 * Response time bucket for alert fatigue analysis.
 */
export type ResponseTimeBucket = '<1min' | '1-5min' | '5-15min' | '15-60min' | '>60min';

/**
 * All valid response time buckets as a readonly array for runtime validation.
 */
export const RESPONSE_TIME_BUCKETS: readonly ResponseTimeBucket[] = [
  '<1min',
  '1-5min',
  '5-15min',
  '15-60min',
  '>60min',
] as const;

/**
 * Audit redaction for clinician feedback event.
 */
export interface ClinicianFeedbackAuditRedaction extends AuditRedactionBase {
  /** The clinician's action */
  readonly action: ClinicianAction;
  /** Rationale category */
  readonly category: RationaleCategory;
  /** Bucketed response time for analytics */
  readonly response_time_bucket?: ResponseTimeBucket;
}

/**
 * Event recording clinician feedback on a proposal.
 * Captures what happens AFTER ROUTE_TO_CLINICIAN decisions.
 *
 * Enables:
 * - Patient-specific case reassessment (NOT RLHF model training)
 * - Malpractice documentation with required rationale
 * - Alert fatigue detection via response time tracking
 * - Conflict resolution when multiple clinicians disagree
 * - Demographic bias monitoring per FDA AI/ML guidance
 *
 * @see schema/hermes-message.schema.json — $defs.ClinicianFeedbackEvent
 */
export interface ClinicianFeedbackEvent {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'clinician_feedback';

  /** Link to the original supervision flow */
  readonly trace: TraceContext;
  /** Operational mode */
  readonly mode: Mode;
  /** Patient subject reference */
  readonly subject: SubjectRef;

  /** The supervision request trace_id */
  readonly original_trace_id: string;
  /** Which proposal was reviewed */
  readonly original_proposal_id: string;
  /** Snapshot at time of original proposal */
  readonly snapshot_ref: HealthStateSnapshotRef;

  /** Clinician's decision */
  readonly action: ClinicianAction;
  /**
   * Structured reason when action is 'deferred'.
   * Required when action === 'deferred'. Ignored for other actions.
   * @since Hermes v2.2
   */
  readonly deferral_reason?: DeferralReason;
  /** When clinician made decision */
  readonly occurred_at: IsoDateTime;
  /** Time from alert to decision (for alert fatigue analysis) */
  readonly response_time_seconds?: number;

  /** Clinician identity (for conflict resolution & audit) */
  readonly clinician_ref: ClinicianRef;

  /**
   * Rationale (critical for malpractice documentation).
   * REQUIRED (not optional) per liability best practices.
   */
  readonly rationale: ClinicianRationale;

  /** What clinician actually did (if modified) */
  readonly modified_action?: ModifiedAction;

  /** Scope of applicability */
  readonly applies_to?: FeedbackAppliesTo;

  /** Conflict detection (when multiple clinicians disagree) */
  readonly conflicts_with_prior_feedback?: FeedbackConflict;

  /** Demographic context (for bias monitoring per FDA requirements) */
  readonly demographic_context?: DemographicContext;

  /** PHI-minimized audit form (HIPAA 6-year retention) */
  readonly audit_redaction: ClinicianFeedbackAuditRedaction;
}
