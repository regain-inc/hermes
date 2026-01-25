/**
 * Core types for Hermes protocol
 * @module types/core
 */

// =============================================================================
// Configuration Types (migrated from src/types.ts)
// =============================================================================

/**
 * Configuration options for Hermes
 */
export interface HermesConfig {
  /**
   * Enable debug mode
   * @default false
   */
  readonly debug?: boolean;
}

/**
 * Options for Hermes operations
 */
export interface HermesOptions {
  /**
   * Timeout in milliseconds
   * @default 5000
   */
  readonly timeout?: number;
}

// =============================================================================
// Section 1: Primitives
// =============================================================================

/**
 * Hermes protocol version in semver format.
 * @see schema/hermes-message.schema.json — $defs.HermesVersion
 */
export type HermesVersion = `${number}.${number}.${number}`;

/**
 * Current Hermes protocol version.
 */
export const CURRENT_HERMES_VERSION: HermesVersion = '1.6.0';

/**
 * ISO 8601 datetime string with timezone.
 * Pattern: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss±HH:MM
 * @see schema/hermes-message.schema.json — $defs.IsoDateTime
 */
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' };

/**
 * Operational mode determines clinical supervision requirements.
 * - 'wellness': Lifestyle/wellness guidance, lower supervision
 * - 'advocate_clinical': Clinical recommendations, strict supervision
 * @see schema/hermes-message.schema.json — $defs.Mode
 */
export type Mode = 'wellness' | 'advocate_clinical';

// =============================================================================
// Section 2: Context Types
// =============================================================================

/**
 * Producer system identifier for distributed tracing.
 */
export interface TraceProducer {
  readonly system: 'deutsch' | 'popper' | 'gateway' | 'other';
  readonly service_version: string;
  readonly ruleset_version?: string;
  readonly model_version?: string;
}

/**
 * Cryptographic signature for message authentication.
 */
export interface TraceSignature {
  readonly alg: 'hmac-sha256' | 'jws';
  readonly key_id: string;
  readonly value: string;
}

/**
 * Distributed tracing context for observability.
 * @see schema/hermes-message.schema.json — $defs.TraceContext
 */
export interface TraceContext {
  readonly trace_id: string;
  readonly span_id?: string;
  readonly parent_span_id?: string;
  readonly created_at: IsoDateTime;
  readonly producer: TraceProducer;
  readonly signature?: TraceSignature;
}

/**
 * Reference to the patient subject.
 * @see schema/hermes-message.schema.json — $defs.SubjectRef
 */
export interface SubjectRef {
  readonly subject_type: 'patient';
  readonly subject_id: string;
  readonly organization_id?: string;
}

/**
 * Base type for audit redaction summaries.
 * Contains PHI-free summary for logging.
 * @see schema/hermes-message.schema.json — $defs.AuditRedactionBase
 */
export interface AuditRedactionBase {
  readonly summary: string;
}

// =============================================================================
// Section 3: Supervision Types
// =============================================================================

/**
 * Reason codes for supervision decisions.
 * @see schema/hermes-message.schema.json — $defs.ReasonCode
 */
export type ReasonCode =
  | 'schema_invalid'
  | 'policy_violation'
  | 'insufficient_evidence'
  | 'high_uncertainty'
  | 'data_quality_warning'
  | 'patient_acuity_high'
  | 'risk_too_high'
  | 'drift_suspected'
  | 'needs_human_review'
  | 'approved_with_constraints'
  | 'low_htv_score'
  | 'weak_evidence_grade'
  | 'other';

/**
 * All valid reason codes as a readonly array for runtime validation.
 */
export const REASON_CODES: readonly ReasonCode[] = [
  'schema_invalid',
  'policy_violation',
  'insufficient_evidence',
  'high_uncertainty',
  'data_quality_warning',
  'patient_acuity_high',
  'risk_too_high',
  'drift_suspected',
  'needs_human_review',
  'approved_with_constraints',
  'low_htv_score',
  'weak_evidence_grade',
  'other',
] as const;

/**
 * Decision outcomes from Popper supervision.
 * @see schema/hermes-message.schema.json — $defs.SupervisionDecision
 */
export type SupervisionDecision =
  | 'APPROVED'
  | 'HARD_STOP'
  | 'ROUTE_TO_CLINICIAN'
  | 'REQUEST_MORE_INFO';

/**
 * All valid supervision decisions as a readonly array for runtime validation.
 */
export const SUPERVISION_DECISIONS: readonly SupervisionDecision[] = [
  'APPROVED',
  'HARD_STOP',
  'ROUTE_TO_CLINICIAN',
  'REQUEST_MORE_INFO',
] as const;

// =============================================================================
// Section 4: Intervention Types
// =============================================================================

/**
 * Types of proposed interventions.
 * @see schema/hermes-message.schema.json — $defs.ProposedInterventionKind
 */
export type ProposedInterventionKind =
  | 'CARE_NAVIGATION'
  | 'TRIAGE_ROUTE'
  | 'MEDICATION_ORDER_PROPOSAL'
  | 'PATIENT_MESSAGE'
  | 'LIFESTYLE_MODIFICATION_PROPOSAL'
  | 'NUTRITION_PLAN_PROPOSAL'
  | 'BEHAVIORAL_INTERVENTION_PROPOSAL'
  | 'OTHER';

/**
 * All valid intervention kinds as a readonly array for runtime validation.
 */
export const PROPOSED_INTERVENTION_KINDS: readonly ProposedInterventionKind[] = [
  'CARE_NAVIGATION',
  'TRIAGE_ROUTE',
  'MEDICATION_ORDER_PROPOSAL',
  'PATIENT_MESSAGE',
  'LIFESTYLE_MODIFICATION_PROPOSAL',
  'NUTRITION_PLAN_PROPOSAL',
  'BEHAVIORAL_INTERVENTION_PROPOSAL',
  'OTHER',
] as const;

/**
 * All valid modes as a readonly array for runtime validation.
 */
export const MODES: readonly Mode[] = ['wellness', 'advocate_clinical'] as const;
