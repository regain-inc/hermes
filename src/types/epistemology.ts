/**
 * Epistemological types for Hermes protocol
 * Operationalizes Deutschian/Popperian epistemology.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8
 * @see 03-hermes-specs/04-hermes-epistemological-types.md
 * @module types/epistemology
 */

import type { UncertaintyLevel } from './disclosure';

// =============================================================================
// Section 2.8.1: Claim Type
// =============================================================================

/**
 * Classification of claims by epistemic status.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.1
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
// Section 2.8.3: Hard-to-Vary Score
// =============================================================================

/**
 * Hard-to-Vary (HTV) score measuring explanation quality.
 * Based on David Deutsch's epistemology.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.3
 * @see 03-hermes-specs/04-hermes-epistemological-types.md
 */
export interface HTVScore {
  /** How tightly coupled are claim parts? (0.0-1.0) */
  readonly interdependence: number;

  /** How precise are predictions? (0.0-1.0) */
  readonly specificity: number;

  /** Are all elements necessary? (0.0-1.0) */
  readonly parsimony: number;

  /** What would refute this? (0.0-1.0) */
  readonly falsifiability: number;

  /**
   * Weighted average of component scores.
   * Default: equal weights.
   * Threshold mapping: ≥0.7 (good) | 0.4–0.7 (moderate) | <0.4 (poor/trigger IDK)
   */
  readonly composite: number;
}

/**
 * HTV score thresholds for decision-making.
 */
export const HTV_THRESHOLDS = {
  GOOD: 0.7,
  MODERATE: 0.4,
} as const;

// =============================================================================
// Section 2.8.4: Uncertainty Calibration
// =============================================================================

/**
 * Factors that contribute to uncertainty.
 */
export type UncertaintyFactor =
  | 'evidence_grade'
  | 'htv_score'
  | 'data_quality'
  | 'debate_consensus'
  | 'staleness'
  | 'conflicting_evidence';

/**
 * Single driver of uncertainty with quantified contribution.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.4
 */
export interface UncertaintyDriver {
  /** What factor contributed to uncertainty */
  readonly factor: UncertaintyFactor;

  /** Numeric contribution (0.0-1.0) */
  readonly contribution: number;

  /** Human-readable explanation */
  readonly details: string;
}

/**
 * Quantified fallibilism — calibrated uncertainty assessment.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.4
 */
export interface UncertaintyCalibration {
  /** Categorical uncertainty level */
  readonly level: UncertaintyLevel;

  /** Continuous uncertainty score (0.0-1.0) */
  readonly score: number;

  /** What contributed to this uncertainty */
  readonly drivers: readonly UncertaintyDriver[];
}

// =============================================================================
// Section 2.8.5: Falsification Criteria
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
 * Testable refutation conditions for a claim.
 * Supports Popperian falsificationism.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.8.5
 */
export interface FalsificationCriteria {
  /** ID of the claim these criteria apply to */
  readonly claim_id: string;

  /** Observable conditions that would refute the claim */
  readonly refutation_conditions: readonly string[];

  /** Time window for observing outcomes (in days) */
  readonly observation_window_days?: number;

  /** Metrics to monitor for refutation */
  readonly outcome_measures: readonly string[];

  /** What to do if refutation conditions are met */
  readonly refutation_action?: RefutationAction;
}
