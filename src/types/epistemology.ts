/**
 * Epistemological types for Hermes protocol
 * Implements Deutschian/Popperian epistemology for clinical recommendations.
 *
 * @see 00-overall-specs/0A-epistemology/01-hard-to-vary-explanations.md
 * @see 00-overall-specs/0A-epistemology/03-conjecture-and-refutation.md
 * @module types/epistemology
 */

// =============================================================================
// Section 1: ClaimType — Classifying Claims by Epistemic Status
// =============================================================================

/**
 * Classification of clinical claims by their epistemic nature.
 * Each type has different falsifiability conditions and risk profiles.
 *
 * Per Popperian epistemology, claims must be:
 * 1. Classifiable (what kind of claim is it?)
 * 2. Falsifiable (what would refute it?)
 * 3. Distinguishable by risk profile
 *
 * @see 00-overall-specs/0A-epistemology/03-conjecture-and-refutation.md
 */
export type ClaimType =
  | 'observation' // Directly observed data point
  | 'diagnosis' // Explanatory hypothesis about patient state
  | 'prognosis' // Prediction about future outcomes
  | 'treatment_rec' // Recommendation for therapeutic action
  | 'lifestyle_rec' // Recommendation for behavioral change
  | 'diagnostic_prompt' // Suggestion to gather more information
  | 'escalation' // Routing decision (clinician involvement)
  | 'administrative'; // Scheduling, logistics, non-clinical

/**
 * Risk level classification for claims.
 */
export type ClaimRiskLevel = 'low' | 'medium' | 'high';

/**
 * Risk characteristics for a claim type.
 */
export interface ClaimTypeRiskProfile {
  /** Risk level of the claim type */
  readonly riskLevel: ClaimRiskLevel;
  /** Whether Popper supervision is required for this claim type */
  readonly requiresPopper: boolean;
}

/**
 * Risk characteristics by claim type.
 * High-risk claim types (diagnosis, treatment_rec, escalation) MUST include
 * falsification_criteria when used in advocate_clinical mode.
 *
 */
export const CLAIM_TYPE_RISK: Record<ClaimType, ClaimTypeRiskProfile> = {
  observation: { riskLevel: 'low', requiresPopper: false },
  diagnosis: { riskLevel: 'high', requiresPopper: true },
  prognosis: { riskLevel: 'medium', requiresPopper: true },
  treatment_rec: { riskLevel: 'high', requiresPopper: true },
  lifestyle_rec: { riskLevel: 'low', requiresPopper: false },
  diagnostic_prompt: { riskLevel: 'low', requiresPopper: false },
  escalation: { riskLevel: 'medium', requiresPopper: true },
  administrative: { riskLevel: 'low', requiresPopper: false },
} as const;

/**
 * All valid claim types as a readonly array for runtime validation.
 */
export const CLAIM_TYPES: readonly ClaimType[] = [
  'observation',
  'diagnosis',
  'prognosis',
  'treatment_rec',
  'lifestyle_rec',
  'diagnostic_prompt',
  'escalation',
  'administrative',
] as const;

// =============================================================================
// Section 2: EvidenceGrade — Hierarchy for Hard-to-Vary Explanations
// =============================================================================

/**
 * Evidence quality hierarchy, ordered from strongest to weakest.
 * Stronger grades indicate evidence that is "harder to vary" —
 * every methodological element is load-bearing, making the
 * conclusions more resistant to ad-hoc adjustments.
 *
 * @see 00-overall-specs/0A-epistemology/01-hard-to-vary-explanations.md
 */
export type EvidenceGrade =
  | 'systematic_review' // Meta-analysis of RCTs (hardest to vary)
  | 'rct' // Randomized controlled trial
  | 'cohort' // Observational cohort study
  | 'case_control' // Retrospective case-control
  | 'case_series' // Descriptive case series
  | 'case_report' // Single case report
  | 'expert_opinion' // Expert consensus without systematic evidence
  | 'policy' // Organizational policy (may or may not be evidence-based)
  | 'patient_reported' // Self-reported by patient
  | 'calculated'; // Derived from other data (algorithms, scores)

/**
 * Evidence hierarchy strength ordering.
 * Lower number = stronger evidence.
 *
 * Special grades (policy, patient_reported, calculated) are mapped
 * to equivalent positions in the main hierarchy for routing decisions.
 *
 */
export const EVIDENCE_GRADE_STRENGTH: Record<EvidenceGrade, number> = {
  systematic_review: 1,
  rct: 2,
  cohort: 3,
  case_control: 4,
  case_series: 5,
  case_report: 6,
  expert_opinion: 7,
  // Special grades mapped to main hierarchy
  policy: 3, // Treat as cohort level
  patient_reported: 6, // Treat as case_report level
  calculated: 3, // Depends on inputs, default to cohort
} as const;

/**
 * All valid evidence grades as a readonly array for runtime validation.
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
 * Compare evidence grades.
 * Returns negative if a is stronger, positive if b is stronger, zero if equal.
 *
 * @param a - First evidence grade
 * @param b - Second evidence grade
 * @returns Negative if a stronger, positive if b stronger, zero if equal
 */
export function compareEvidenceGrades(a: EvidenceGrade, b: EvidenceGrade): number {
  return EVIDENCE_GRADE_STRENGTH[a] - EVIDENCE_GRADE_STRENGTH[b];
}

/**
 * Get the effective evidence grade for routing decisions.
 * Maps special grades (policy, patient_reported, calculated) to main hierarchy.
 *
 * @param grade - The evidence grade to normalize
 * @returns The effective grade in the main hierarchy
 */
export function getEffectiveEvidenceGrade(grade: EvidenceGrade): EvidenceGrade {
  switch (grade) {
    case 'policy':
      return 'cohort';
    case 'patient_reported':
      return 'case_report';
    case 'calculated':
      return 'cohort';
    default:
      return grade;
  }
}

// =============================================================================
// Section 3: HTVScore — Hard-to-Vary Scoring
// =============================================================================

/**
 * Hard-to-Vary score measuring explanation quality.
 * Based on Deutsch's criterion: good explanations are those
 * where changing any detail would invalidate the explanation.
 *
 * Each dimension is scored 0.0-1.0:
 * - 0.0 = easy to vary (bad)
 * - 1.0 = hard to vary (good)
 *
 * @see 00-overall-specs/0A-epistemology/01-hard-to-vary-explanations.md
 */
export interface HTVScore {
  /**
   * How tightly coupled are the claim's components?
   * High: every piece of evidence connects to the conclusion.
   * Low: components could be swapped without affecting the claim.
   */
  readonly interdependence: number; // 0.0-1.0

  /**
   * How precise are the predictions?
   * High: specific, measurable outcomes predicted.
   * Low: vague, unfalsifiable predictions.
   */
  readonly specificity: number; // 0.0-1.0

  /**
   * Are all elements necessary?
   * High: minimal sufficient explanation.
   * Low: includes superfluous elements that could be removed.
   */
  readonly parsimony: number; // 0.0-1.0

  /**
   * What would refute this claim?
   * High: clear falsification conditions exist.
   * Low: claim is unfalsifiable or immune to counterevidence.
   */
  readonly falsifiability: number; // 0.0-1.0

  /**
   * Composite score (weighted average of dimensions).
   * Default weights: equal (0.25 each).
   */
  readonly composite: number; // 0.0-1.0
}

/**
 * Default weights for HTV score dimensions.
 * Equal weighting by default; can be customized per deployment.
 */
export const HTV_DEFAULT_WEIGHTS = {
  interdependence: 0.25,
  specificity: 0.25,
  parsimony: 0.25,
  falsifiability: 0.25,
} as const;

/**
 * Quality levels based on composite HTV score.
 *
 */
export type HTVQualityLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'refuted';

/**
 * Get the quality level for a composite HTV score.
 *
 * | Composite Score | Quality Level | Recommended Action |
 * |-----------------|---------------|-------------------|
 * | >= 0.9          | excellent     | May proceed with high confidence |
 * | >= 0.7          | good          | May proceed (subject to other checks) |
 * | 0.4 – 0.7       | moderate      | Disclose uncertainty; prefer conservative action |
 * | 0.3 – 0.4       | poor          | Trigger IDK Protocol or route to clinician |
 * | < 0.3           | refuted       | Treat as failed hypothesis; do not proceed |
 *
 * @param composite - The composite HTV score (0.0-1.0)
 * @returns The quality level
 */
export function getHTVQualityLevel(composite: number): HTVQualityLevel {
  if (composite >= 0.9) return 'excellent';
  if (composite >= 0.7) return 'good';
  if (composite >= 0.4) return 'moderate';
  if (composite >= 0.3) return 'poor';
  return 'refuted';
}

// =============================================================================
// Section 4: UncertaintyCalibration — Quantified Fallibilism
// =============================================================================

/**
 * Uncertainty level classification.
 */
export type UncertaintyLevel = 'low' | 'medium' | 'high';

/**
 * Factor types that can contribute to uncertainty.
 */
export type UncertaintyFactorType =
  | 'evidence_grade' // Weak evidence
  | 'htv_score' // Low HTV score
  | 'data_quality' // Missing or conflicting snapshot signals
  | 'debate_consensus' // Generator-Verifier disagreement
  | 'staleness' // Old data or evidence
  | 'conflicting_evidence'; // Sources disagree

/**
 * A factor contributing to uncertainty in a recommendation.
 *
 */
export interface UncertaintyDriver {
  /** The type of factor contributing to uncertainty */
  readonly factor: UncertaintyFactorType;

  /** How much this factor adds to uncertainty (0.0-1.0) */
  readonly contribution: number;

  /** Human-readable explanation of this uncertainty driver */
  readonly details: string;
}

/**
 * Enhanced uncertainty representation with calibration details.
 * Extends the existing UncertaintyLevel with quantified scoring.
 *
 */
export interface UncertaintyCalibration {
  /** Discrete uncertainty level for routing decisions */
  readonly level: UncertaintyLevel;

  /** Continuous uncertainty score (0.0-1.0) */
  readonly score: number;

  /** Factors that contributed to this uncertainty */
  readonly drivers: readonly UncertaintyDriver[];
}

// =============================================================================
// Section 5: FalsificationCriteria — Testable Refutation Conditions
// =============================================================================

/**
 * Action to take when refutation conditions are met.
 */
export type RefutationAction =
  | 'route_to_clinician'
  | 'hard_stop'
  | 'modify_recommendation'
  | 'log_only';

/**
 * Specifies what would refute a clinical claim.
 * Implements Popper's demarcation criterion: scientific claims
 * must be falsifiable.
 *
 * @see 00-overall-specs/0A-epistemology/03-conjecture-and-refutation.md
 */
export interface FalsificationCriteria {
  /** Links to the proposal this criteria applies to */
  readonly claim_id: string;

  /**
   * Observable conditions that would refute the claim.
   * E.g., "If serum potassium > 5.5 mEq/L post-titration"
   */
  readonly refutation_conditions: readonly string[];

  /**
   * Time window for observing outcomes (days).
   * E.g., 30 days for medication efficacy assessment.
   */
  readonly observation_window_days?: number;

  /**
   * Specific metrics to monitor for refutation.
   * E.g., ["serum_potassium", "serum_creatinine", "blood_pressure"]
   */
  readonly outcome_measures: readonly string[];

  /**
   * What action to take if refutation conditions are met.
   */
  readonly refutation_action?: RefutationAction;
}

/**
 * All valid refutation actions as a readonly array for runtime validation.
 */
export const REFUTATION_ACTIONS: readonly RefutationAction[] = [
  'route_to_clinician',
  'hard_stop',
  'modify_recommendation',
  'log_only',
] as const;

// =============================================================================
// Section 6: Auto-Refutation Types (SAL-508)
// =============================================================================

/**
 * Direction of expected metric change.
 */
export type ExpectedDirection = 'improve' | 'decline' | 'stabilize';

/**
 * Observed trend from outcome tracking.
 */
export type ObservedTrend = 'improved' | 'no_change' | 'worsened' | 'insufficient_data';

/**
 * Reason a prediction was considered failed.
 */
export type PredictionFailureReason =
  | 'opposite_direction' // Expected improve, got worsened
  | 'no_change_after_window' // Expected improve, got no_change after full timeframe
  | 'insufficient_data'; // No data available after timeframe + grace period

/**
 * Represents a prediction that failed — the observed outcome contradicted
 * the expected direction within the specified timeframe.
 *
 * This is a core Popperian concept: when a theory's predictions fail,
 * the theory must be revised or abandoned.
 *
 * @see 00-overall-specs/0A-epistemology/03-conjecture-and-refutation.md
 */
export interface FailedPrediction {
  /** ID of the predicted outcome record */
  readonly prediction_id: string;

  /** ID of the original proposal that made this prediction */
  readonly proposal_id: string;

  /** The metric being tracked (e.g., "blood_pressure_systolic") */
  readonly predicted_metric: string;

  /** Expected direction of change */
  readonly predicted_direction: ExpectedDirection;

  /** Timeframe in days for the prediction */
  readonly timeframe_days: number;

  /** What actually happened */
  readonly actual_trend: ObservedTrend;

  /** Why this counts as a failure */
  readonly failure_reason: PredictionFailureReason;
}

/**
 * Trigger sent to Deutsch when a prediction fails, prompting re-conjecture.
 *
 * The engine should:
 * 1. Explain why the original hypothesis failed
 * 2. Generate revised hypotheses that account for the failure
 * 3. Score new hypotheses with HTV (the failure data is new evidence)
 */
export interface RefutationTrigger {
  /** Unique ID for this trigger event */
  readonly trigger_id: string;

  /** Session in which the original hypothesis was proposed */
  readonly original_session_id: string;

  /** The failed prediction details */
  readonly failed_prediction: FailedPrediction;

  /** ID of the hypothesis that was refuted */
  readonly original_hypothesis_id: string;

  /** When this trigger was created (ISO 8601) */
  readonly triggered_at: string;
}
