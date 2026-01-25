/**
 * Evidence reference types for Hermes protocol
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.6
 * @see 03-hermes-specs/04-hermes-epistemological-types.md
 * @module types/evidence
 */

// =============================================================================
// Section 2.6: Evidence Reference
// =============================================================================

/**
 * Type of evidence supporting a claim or recommendation.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.6
 */
export type EvidenceType =
  | 'guideline'
  | 'study'
  | 'patient_data'
  | 'calculation'
  | 'policy'
  | 'other';

/**
 * All valid evidence types as a readonly array for runtime validation.
 */
export const EVIDENCE_TYPES: readonly EvidenceType[] = [
  'guideline',
  'study',
  'patient_data',
  'calculation',
  'policy',
  'other',
] as const;

// =============================================================================
// Section 2.8.2: Evidence Grade (Epistemological Hierarchy)
// =============================================================================

/**
 * Evidence strength grade based on Deutschian "hard-to-vary" epistemology.
 * Ordered from strongest (systematic_review) to weakest (calculated).
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.2
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 2.4
 * @see schema/hermes-message.schema.json — $defs.EvidenceGrade
 */
export type EvidenceGrade =
  | 'systematic_review' // Meta-analysis of RCTs (hardest to vary)
  | 'rct' // Randomized controlled trial
  | 'cohort' // Observational cohort study
  | 'case_control' // Retrospective case-control
  | 'case_series' // Descriptive case series
  | 'case_report' // Single case report
  | 'expert_opinion' // Expert consensus without systematic evidence
  | 'policy' // Organizational policy
  | 'patient_reported' // Self-reported by patient
  | 'calculated'; // Derived from other data

/**
 * All valid evidence grades as a readonly array for runtime validation.
 * Ordered from strongest to weakest.
 */
export const EVIDENCE_GRADES: readonly EvidenceGrade[] = [
  'systematic_review',
  'rct',
  'cohort',
  'case_control',
  'case_series',
  'case_report',
  'expert_opinion',
  'policy',
  'patient_reported',
  'calculated',
] as const;

/**
 * Numeric weight for evidence grades (higher = stronger).
 * Useful for threshold comparisons.
 */
export const EVIDENCE_GRADE_WEIGHTS: Readonly<Record<EvidenceGrade, number>> = {
  systematic_review: 10,
  rct: 9,
  cohort: 7,
  case_control: 6,
  case_series: 5,
  case_report: 4,
  expert_opinion: 3,
  policy: 2,
  patient_reported: 1,
  calculated: 1,
} as const;

/**
 * Reference to supporting evidence.
 * Provides "why" without copying large documents into messages.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.6
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 2.4
 */
export interface EvidenceRef {
  /** Unique identifier for this evidence reference */
  readonly evidence_id: string;

  /** Type of evidence */
  readonly evidence_type: EvidenceType;

  /**
   * Human-readable citation string.
   * Example: "ACC/AHA HF Guideline 2024, Section 7.2"
   */
  readonly citation: string;

  /** Optional pointer to full evidence text or stored "evidence pack" */
  readonly uri?: string;

  /**
   * Optional short excerpt.
   * MUST be brief to avoid payload bloat (<= ~500 chars recommended).
   */
  readonly excerpt?: string;

  /** Optional content hash for immutability */
  readonly content_hash?: string;

  // === EPISTEMOLOGICAL ENHANCEMENT ===

  /**
   * Evidence strength grade.
   * SHOULD be populated for all evidence refs in advocate_clinical mode.
   * SHOULD be populated for evidence supporting MEDICATION_ORDER_PROPOSAL.
   * If absent on medication proposals, Popper SHOULD treat as below threshold.
   */
  readonly evidence_grade?: EvidenceGrade;

  /**
   * Calibrated confidence (0.0-1.0), accounting for grade and recency.
   */
  readonly confidence?: number;

  /**
   * Publication date for confidence decay calculation.
   * ISO 8601 date string.
   */
  readonly publication_date?: string;

  /**
   * What would refute this evidence?
   * Supports Popperian falsificationism.
   */
  readonly falsification_condition?: string;
}

/**
 * Maximum recommended excerpt length in characters.
 */
export const MAX_EXCERPT_LENGTH = 500;
